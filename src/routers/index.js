const app = require("express").Router();
const botsdata = require("../database/models/botlist/bots.js");

console.log("[localhost]: Index router loaded.");

app.get("/", async (req, res) => {
  const botdata = await botsdata.find(
    {},
    {
      _id: false,
      __v: false,
      coowners: false,
      longDesc: false,
      owners: false,
      analytics_invites: false,
      analytics_visitors: false,
      dcwebhook: false,
      ownerName: false,
      token: false,
      prefix: false,
      tags: false,
      website: false,
      github: false,
      support: false,
      webhook: false,
    }
  );

  res.render("index.ejs", {
    bot: global.Client,
    path: req.path,
    config: global.config,
    user: req.isAuthenticated() ? req.user : null,
    req: req,
    botdata,
    roles: global.config.server.roles,
    channels: global.config.server.channels,
  });
});

module.exports = app;
