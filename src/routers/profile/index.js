const app = require("express").Router();
const botsdata = require("../../database/models/botlist/bots.js");
const servers = require("../../database/models/servers/server.js");
const client = global.Client;

console.log("[localhost]: Profile/Index router loaded.");

const profiledata = require("../../database/models/profile.js");
const banSchema = require("../../database/models/site-ban.js");
app.get("/:userID", async (req, res) => {
  client.users.fetch(req.params.userID).then(async (a) => {
    const pdata = await profiledata.findOne({
      userID: a.id,
    });
    const botdata = await botsdata.find(
      {},
      {
        _id: false,
        __v: false,
        longDesc: false,
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
    let banVerisi = await banSchema.findOne({ user: req.params.userID });
    const serverData = await servers.find();
    res.render("profile/profile.ejs", {
      bot: global.Client,
      path: req.path,
      config: global.config,
      user: req.isAuthenticated() ? req.user : null,
      req: req,
      roles: global.config.server.roles,
      channels: global.config.server.channels,
      botdata: botdata,
      pdata: pdata,
      member: a,
      serverData: serverData,
      bannedCheck: banVerisi,
    });
  });
});

module.exports = app;
