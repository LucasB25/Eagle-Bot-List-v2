const {
  ButtonBuilder,
  AttachmentBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonStyle,
} = require("discord.js");
const { registerFont, createCanvas } = require("canvas");
const serverData = require("../../database/models/servers/server.js");
const userData = require("../../database/models/servers/user.js");
exports.run = async ({ client, int, params }) => {
  let findServer = await serverData.findOne({ id: int.guild.id });
  let findUser = await userData.findOne({
    id: int.user.id,
    guild: int.guild.id,
  });
  if (!findServer)
    return int.reply(
      "This server was not found in our list.\n" +
        "Add your server: http://localhost/server/add"
    );
  if (findUser) return msgError("You can vote only once every 30 minutes.");

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
  let sorgu1 = new ButtonBuilder()
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
    iconURL: int.user.displayAvatarURL({ dynamic: true }),
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
      `You have successfully voted for server **${int.guild.name}**.`
    );

  const controlEmbed = new EmbedBuilder()
    .setTitle("Select the code button that is the same as the picture.")
    .setColor("BLURPLE")
    .setAuthor(author)
    //.setImage('attachment://captcha.png')
    .setDescription(
      "Select whichever of the buttons below matches the code and it will perform the operation, this operation will be canceled after **60** seconds."
    );

  const order = [sorgu1, sorgu2, sorgu3].sort(() => Math.random() - 0.5);

  int
    .reply({
      files: [attachment],
      embeds: [controlEmbed],
      components: [new ActionRowBuilder().setComponents(order)],
      fetchReply: true,
    })
    .then(async (msg) => {
      const filter = (i) => i.user.id === int.user.id;
      const collector = await msg.createMessageComponentCollector({
        componentType: "BUTTON",
        filter,
        time: 60000,
      });
      collector.on("collect", async (b) => {
        if (b.customId == kod1) {
          let findUserr = await userData.findOne({
            id: int.user.id,
            guild: int.guild.id,
          });
          if (findUserr)
            return msg
              .delete()
              .then(() => msgError("You can vote only once every 30 minutes."));
          msg.delete().then(() =>
            int.channel.send({
              embeds: [correctButton],
              components: [new ActionRowBuilder().setComponents(web)],
            })
          );
          await userData.updateOne(
            {
              id: int.user.id,
            },
            {
              $set: {
                guild: int.guild.id,
                date: Date.now(),
              },
            },
            { upsert: true }
          );
          await serverData.updateOne(
            {
              id: int.guild.id,
            },
            {
              $inc: {
                votes: 1,
              },
            }
          );
          return;
        } else if (b.id == kod2 || b.id == kod3) {
          msg.delete().then(() =>
            int.reply({
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
  name: "vote",
  description: "Vote for the server",
  usage: "",
};
