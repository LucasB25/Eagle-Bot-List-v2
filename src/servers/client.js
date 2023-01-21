const { Client, Collection, PermissionsBitField } = require("discord.js");
const serverClient = global.clientSL;
const config = global.config;
const fs = require("fs");

serverClient.on("clickButton", async (button) => {
  button.defer(true);
});

require("events").EventEmitter.prototype._maxListeners = 100;
serverClient.commands = new Collection();
serverClient.aliases = new Collection();
fs.readdir("./src/servers/commands/", (err, files) => {
  if (err) console.error(err);
  console.log(`[localhost/servers]: ${files.length} command loaded.`);
  files.forEach(async (f) => {
    let props = require(`./commands/${f}`);
    serverClient.commands.set(props.help.name, props);
    props.conf.aliases.forEach((alias) => {
      serverClient.aliases.set(alias, props.help.name);
    });
  });
});

serverClient.on("interactionCreate", async (int) => {
  if (!int.inGuild()) return;
  if (!int.isCommand()) return;
  let cmd =
    serverClient.commands.get(int.commandName) ||
    serverClient.aliases.find((cmd) => cmd === int.commandName);
  if (!cmd) return;
  cmd.run({ int, client: serverClient, params: int.options });
});

serverClient.on("ready", async () => {
  console.log(
    "[localhost/servers]: Bot successfully connected as " +
      serverClient.user.tag +
      "."
  );
  serverClient.user.setPresence({
    activity: {
      type: "WATCHING",
      name: "/bump & /vote",
    },
    status: "dnd",
  });
  serverClient.guilds.cache
    .get("564027438087143439")
    .commands.set(serverClient.commands.map((cmd) => cmd.help));
});

serverClient.makeid = function (length) {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

/*
let serverPrefix = config.bot.servers.prefix;
serverClient.on('messageCreate', async message => {
  if (message.author.bot) return;
  if (message.channel.type === 'dm') return;
  if (message.content.startsWith(serverPrefix)) {
  let command = message.content.split(' ')[0].slice(serverPrefix.length);
  let params = message.content.split(' ').slice(1);
  let cmd = serverClient.commands.get(command)
      || serverClient.aliases.find(cmd => cmd === command);
  if(cmd) cmd.run(serverClient, message, params);
  }
})
*/

const { Routes } = require("discord-api-types/v10");
const { REST } = require("@discordjs/rest");

const rest = new REST({ version: "10" }).setToken(config.bot.servers.token);

module.exports = (client) => {
  const slashCommands = [];

  fs.readdirSync("./slashCommands/").forEach(async (dir) => {
    const files = fs
      .readdirSync(`./slashCommands/${dir}/`)
      .filter((file) => file.endsWith(".js"));

    for (const file of files) {
      const slashCommand = require(`../../slashCommands/${dir}/${file}`);
      slashCommands.push({
        name: slashCommand.name,
        description: slashCommand.description,
        type: slashCommand.type,
        options: slashCommand.options ? slashCommand.options : null,
        default_member_permissions: slashCommand.default_member_permissions
          ? PermissionsBitField.resolve(
              slashCommand.default_member_permissions
            ).toString()
          : null,
      });
      client.logger.loader(
        `${client.color.chalkcolor.red(`${dir}`)} loaded with ${
          file.length
        } (/) commands`
      );
      client.slashCommands.set(slashCommand.name, slashCommand);
    }
  });

  (async () => {
    try {
      await rest.put(
        // GUILD SLASH COMMANDS (will deploy only in the server you put the ID of)
        //Routes.applicationGuildCommands(config.botID, config.privateServerID),

        //GLOBAL SLASH COMMANDS
        Routes.applicationCommands("927975793227858032"),
        { body: slashCommands }
      );
      console.log(
        "[Discord API] Successfully reloaded application (/) commands."
      );
    } catch (error) {
      console.log(error);
    }
  })();
};

module.exports = serverClient;
