const {
  ButtonBuilder,
  AttachmentBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonStyle,
} = require("discord.js");
const { registerFont, createCanvas } = require("canvas");
const serverData = require("../../database/models/servers/server.js");
/**
 * @param {Discord.Message} message
 */
exports.run = async ({ client, int, params }) => {
  let findServer = await serverData.findOne({ id: int.guild.id });
  if (!findServer)
    return int.reply(
      "This server was not found in our list.\n" +
        "Add your server: http://localhost/server/add"
    );

  let cooldown = 1800000;
  let lastDaily = findServer.bump;

  let kod1 = client.makeid(6);
  let kod2 = client.makeid(6);
  let kod3 = client.makeid(6);
  const width = 400;
  const height = 125;
  const canvas = createCanvas(width, height);
  const context = canvas.getContext("2d");
  context.fillRect(0, 0, width, height);
  context.font = "bold 48pt serif";
  context.textAlign = "center";
  context.fillStyle = "#fff";
  context.fillText(kod1, 200, 90);
  const attachment = new AttachmentBuilder(canvas.toBuffer(), "captcha.png");

  let sorgu = new ButtonBuilder()
    .setLabel(kod1)
    .setStyle(ButtonStyle.Primary)
    .setCustomId(kod1);
  let sorgu2 = new ButtonBuilder()
    .setLabel(kod2)
    .setStyle(ButtonStyle.Primary)
    .setCustomId(kod2);
  let sorgu3 = new ButtonBuilder()
    .setLabel(kod3)
    .setStyle(ButtonStyle.Primary)
    .setCustomId(kod3);
  let web = new ButtonBuilder()
    .setLabel("Visit server page")
    .setStyle("LINK")
    .setURL("http://localhost/server/" + int.guild.id);

  let author = {
    name: int.user.username,
    iconURL: int.user.avatarURL({ dynamic: true }),
  };
  const incorrectButton = new EmbedBuilder()
    .setTitle("Wrong button selected.")
    .setColor("RED")
    .setAuthor(author)
    .setDescription(
      `No way, the operation was canceled because you clicked the wrong code.`
    );
  const correctButton = new EmbedBuilder()
    .setTitle("The correct button has been selected.")
    .setColor("GREEN")
    .setAuthor(author)
    .setDescription(
      `You have successfully bumped for server **${int.guild.name}**.`
    );
  const controlEmbed = new EmbedBuilder()
    .setTitle("Select the code button that is the same as the picture.")
    .setColor("BLURPLE")
    .setAuthor(author)
    //.setImage(Buffer.from(attachment))
    .setDescription(
      "Select whichever of the buttons below matches the code and it will perform the operation, this operation will be canceled after **60** seconds."
    );

  int
    .reply({
      files: [attachment],
      embeds: [controlEmbed],
      components: [
        new ActionRowBuilder().setComponents(
          [sorgu, sorgu2, sorgu3].sort(() => Math.random() - 0.5)
        ),
      ],
      fetchReply: true,
    })
    .then(async (msg) => {
      const filter = (i) => i.user.id === int.user.id;
      const collector = msg.createMessageComponentCollector({
        componentType: "BUTTON",
        filter,
        time: 60000,
      });
      collector.on("collect", async (b) => {
        if (b.customId == kod1) {
          let _findServer = await serverData.findOne({ id: int.guild.id });
          let lastDailyy = _findServer.bump;
          if (cooldown - (Date.now() - lastDailyy) > 0)
            return msg
              .delete()
              .then(() =>
                msgError("This command is used only once every 30 minutes.")
              );
          msg.delete().then(() =>
            int.followUp({
              embeds: [correctButton],
              components: [new ActionRowBuilder().setComponents(web)],
            })
          );
          await serverData.updateOne(
            {
              id: int.guild.id,
            },
            {
              $set: {
                bump: new Date().getTime(),
              },
            }
          );
          await serverData.updateOne(
            {
              id: int.guild.id,
            },
            {
              $inc: {
                bumps: 1,
              },
            }
          );
          return;
        } else if (b.id == kod2 || b.id == kod3) {
          msg.delete().then(() =>
            int.followUp({
              embeds: [incorrectButton],
              components: [new ActionRowBuilder().setComponents(web)],
            })
          );
        }
      });
    });

  function msgError(msg) {
    int[int.replied ? "followUp" : "reply"]({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: global.clientSL.user.username,
            iconURL: global.clientSL.user.avatarURL(),
          })
          .setDescription(msg)
          .setColor("RED"),
      ],
    });
  }
};
exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
};
exports.help = {
  name: "bump",
  description: "Bump the server",
  usage: "",
};
