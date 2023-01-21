const { EmbedBuilder } = require("discord.js");
const bots = require("../database/models/botlist/bots.js");
/**
 * @param {Discord.Client} client
 * @param {Discord.Message} message
 * @param {string[]} args
 */
module.exports.run = async (client, message, args) => {
  if (!args[0]) return message.reply("Error: Please write bot id.");
  let id = message.mentions.users.filter((u) => u.bot).first() || args[0];
  let b = await bots.findOne({ botID: id });
  if (!b) return message.reply("Invalid bot id.");
  const links = [];
  links.push([
    "Invite link",
    "https://discord.com/oauth2/authorize?client_id=${b.botID}&scope=bot+applications.commands&permissions=8&scope=bot%20applications.commands",
  ]);
  if (b.website) links.push(["Website", b.website]);
  if (b.github) links.push(["Github", b.github]);
  if (b.support) links.push(["Support server", b.support]);
  let coowners = b.coowners.length
    ? b.coowners.map((a) => "<@" + a + ">").join(" - ")
    : [];

  let fix = (s) => s.toString();
  const embed = new EmbedBuilder()
    .setThumbnail(b.avatar)
    .setColor("#7289da")
    .setAuthor({ name: `${b.username}#${b.discrim}`, iconURL: b.avatar })
    .setDescription(
      `**[Vote for ${b.username}#${b.discrim}](http://localhost/bot/${b.botID}/vote)**`
    )
    .addFields({ name: "Bot ID", value: b.botID, inline: true })
    .addFields({ name: "Username", value: b.username, inline: true })
    .addFields({ name: "Discriminator", value: b.discrim || "X", inline: true })
    .addFields({ name: "Votes", value: `${b.votes}`, inline: true })
    .addFields({ name: "Certificate", value: b.certificate, inline: true })
    .addFields({ name: "Short Description", value: b.shortDesc, inline: true })
    .addFields({
      name: "Server Count",
      value: `${b.serverCount || "N/A"}`,
      inline: true,
    })
    .addFields({
      name: "Owner(s)",
      value: `<@${b.ownerID}> - ${coowners}` || "N/A",
      inline: true,
    })
    .addFields({
      name: "Links",
      value: links.map((l) => `[${l[0]}](${l[1]})`).join(" - ") || "X",
      inline: true,
    });
  message.reply({ embeds: [embed] });
};
exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
};

exports.help = {
  name: "botinfo",
  description: "",
  usage: "",
};
