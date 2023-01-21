const app = require("express").Router();
const db = require("../../database/models/servers/server.js");
const client = global.clientSL;
const channels = global.config.server.channels;

console.log("[localhost/servers]: Add Server router loaded.");

app.get("/add", global.checkAuth, async (req, res) => {
  if (!client.guilds.cache.get(config.server.id).members.cache.get(req.user.id))
    return res.redirect(
      "/error?code=403&message=To do this, you have to join our discord server."
    );
  res.render("servers/add.ejs", {
    bot: global.clientSL,
    path: req.path,
    config: global.config,
    user: req.isAuthenticated() ? req.user : null,
    req: req,
    roles: global.config.server.roles,
    channels: global.config.server.channels,
  });
});
app.post("/add", global.checkAuth, async (req, res) => {
  let { guildID, link, autoCreate, shortDesc, longDesc, tags } = req.body;
  const guild = client.guilds.cache.get(req.body.guildID);
  let checkGuild = await db.findOne({ id: guildID });
  if (checkGuild)
    return res.send({
      error: true,
      message: "This server already exist system.",
    });
  if (!guildID || !longDesc || !shortDesc || !tags)
    return res.send({ error: true, message: "Fill the must any blanks." });
  if (!link)
    return res.send({ error: true, message: "Fill the must any blanks." });
  if (!guild)
    return res.send({
      error: true,
      message: "You have to add me to that server first.",
    });
  const member = guild.members.cache.get(req.user.id);
  if (!member) {
    try {
      await guild.members.fetch();
      member = guild.members.cache.get(req.user.id);
    } catch (err) {
      res.send({
        error: true,
        message: `Couldn't fetch the members of ${guild.id}: ${err}`,
      });
    }
  }
  if (!member)
    return res.send({
      error: true,
      message: "You can only add servers with ADMINISTRATOR authorization.",
    });
  if (!member.permissions.has("ADMINISTRATOR"))
    return res.send({
      error: true,
      message: "You can only add servers with ADMINISTRATOR authorization.",
    });
  await db.updateOne(
    {
      id: guildID,
    },
    {
      $set: {
        name: guild.name,
        icon: guild.iconURL({ dynamic: true }),
        ownerID: guild.ownerId || req.user.id,
        longDesc: req.body.longDesc,
        shortDesc: req.body.shortDesc,
        tags: req.body.tags,
        votes: 0,
        link: req.body.link,
      },
    },
    { upsert: true }
  );
  res.send({ error: false, message: "Server added successfully." });
});

module.exports = app;
