/*=======================================================================================*/
const {
  Collection,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  SelectMenuBuilder,
  Partials,
  Client,
} = require("discord.js");
const client = (global.Client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildScheduledEvents,
  ],
  partials: [Partials.Channel],
}));
const config = require("./config.js");
global.config = config;
const fs = require("fs");
client.htmll = require("cheerio");
const request = require("request");
const db = require("quick.db");
const botsdata = require("./src/database/models/botlist/bots.js");
const ms = require("ms");
/*=======================================================================================*/

/*=======================================================================================*/
require("events").EventEmitter.prototype._maxListeners = 100;
client.komutlar = new Collection();
client.aliases = new Collection();
fs.readdir("./src/commands", (err, files) => {
  if (err) console.error(err);
  console.log(`[localhost]: ${files.length} command loaded.`);
  files.forEach((f) => {
    if (!f.endsWith(".js")) return;
    let props = require(`./src/commands/${f}`);
    if (!props.help) return;
    client.komutlar.set(props.help.name, props);
    props.conf.aliases.forEach((alias) => {
      client.aliases.set(alias, props.help.name);
      global.commands = files;
    });
  });
});
client.on("messageCreate", async (message) => {
  let p = config.bot.prefix;
  let client = message.client;
  if (message.author.bot) return;
  if (!message.content.startsWith(p)) return;
  let command = message.content.split(" ")[0].slice(p.length);
  let params = message.content.split(" ").slice(1);
  let cmd;
  if (client.komutlar.has(command)) {
    cmd = client.komutlar.get(command);
  } else if (client.aliases.has(command)) {
    cmd = client.komutlar.get(client.aliases.get(command));
  }
  if (cmd) {
    cmd.run(client, message, params, p);
  }
  if (!cmd) return;
});
/*=======================================================================================*/
const votes = require("./src/database/models/botlist/vote.js");
const votesServer = require("./src/database/models/servers/user.js");
client.on("ready", async () => {
  setInterval(async () => {
    let datalar = await votes.find();
    if (datalar.length > 0) {
      datalar.forEach(async (a) => {
        let süre = a.ms - (Date.now() - a.Date);
        if (süre > 0) return;
        await votes.findOneAndDelete({ bot: a.bot, user: a.user });
      });
    }
  }, 1500000);
});
client.on("ready", async () => {
  setInterval(async () => {
    let voteServer = await votesServer.find();
    if (voteServer.length > 0) {
      voteServer.forEach(async (a) => {
        let süre = 1800000 - (Date.now() - a.date);
        if (süre > 0) return;
        await votesServer.findOneAndDelete({
          guild: a.guild,
          id: a.id,
          date: a.date,
        });
      });
    }
  }, 1500000);
});
/*=======================================================================================*/

/*=======================================================================================*/
client.on("guildMemberRemove", async (member) => {
  const botlar = require("./src/database/models/botlist/bots.js");
  let data = await botlar.findOne({ ownerID: member.id });
  if (!data) return;
  let find = await botlar.find({ ownerID: member.id });
  await find.forEach(async (b) => {
    member.guild.members.cache.get(b.botID).kick();
    await botlar.deleteOne({ botID: b.botID });
  });
});
client.on("guildMemberAdd", async (member) => {
  let guild = client.guilds.cache.get(config.server.id);
  if (member.user.bot) {
    try {
      guild.member(member.id).roles.add(config.server.roles.botlist.bot);
    } catch (error) {}
  }
});
/*=======================================================================================*/

/*
    SERVER LIST CLIENT 
*/
const serverClient = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildScheduledEvents,
  ],
  partials: [Partials.Channel],
});
serverClient.login(config.bot.servers.token);
global.clientSL = serverClient;
require("./src/servers/client.js");

/*=======================================================================================*/
require("./src/server.js")(client);
require("./src/database/connect.js")(client);

client.login(config.bot.token);
client.on("ready", async () => {
  console.log(
    "[localhost]: Bot successfully connected as " + client.user.tag + "."
  );
  let botsSchema = require("./src/database/models/botlist/bots.js");
  const bots = await botsSchema.find();
  client.user.setPresence({
    activity: {
      type: "WATCHING",
      name: "localhost | " + bots.length + " bots",
    },
    status: "dnd",
  });
});
/*=======================================================================================*/

/* RESET DATA'S EVERY MONTHS */

// BOT/SERVER VOTES & ANALYTICS
const { CronJob } = require("cron");
const botlar = require("./src/database/models/botlist/bots.js");
const servers = require("./src/database/models/servers/server.js");
client.on("ready", async () => {
  var resetStats = new CronJob(
    "00 00 1 * *",
    async function () {
      let x = await botlar.find();
      await x.forEach(async (a) => {
        await botlar.findOneAndUpdate(
          {
            botID: a.botID,
          },
          {
            $set: {
              votes: 0,
              analytics_invites: 0,
              analytics_visitors: 0,
            },
          }
        );
      });
      let sunucular = await servers.find();
      await sunucular.forEach(async (a) => {
        await servers.findOneAndUpdate(
          {
            id: a.id,
          },
          {
            $set: {
              votes: 0,
              bumps: 0,
              analytics_joins: 0,
              analytics_visitors: 0,
            },
          }
        );
      });
    },
    null,
    true,
    "Europe/Istanbul"
  );
  resetStats.start();
});
