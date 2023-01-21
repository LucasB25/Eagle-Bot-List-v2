const url = require("url");
const path = require("path");
const express = require("express");
const passport = require("passport");
const session = require("express-session");
const Strategy = require("passport-discord").Strategy;
const ejs = require("ejs");
const bodyParser = require("body-parser");
const Discord = require("discord.js");
const config = require("../config.js");
const channels = config.server.channels;
const app = express();
const MemoryStore = require("memorystore")(session);
const fetch = require("node-fetch");
const cookieParser = require("cookie-parser");
const referrerPolicy = require("referrer-policy");
app.use(referrerPolicy({ policy: "strict-origin" }));
const rateLimit = require("express-rate-limit");
var MongoStore = require("rate-limit-mongo");
const roles = config.server.roles;
// MODELS
const banSchema = require("./database/models/site-ban.js");
module.exports = async (client) => {
  const apiLimiter = rateLimit({
    store: new MongoStore({
      uri: global.config.bot.mongourl,
      collectionName: "rate-limit",
      expireTimeMs: 60 * 60 * 1000,
      resetExpireDateOnChange: true,
    }),
    windowMs: 60 * 60 * 1000,
    max: 4,
    message: {
      error: true,
      message:
        "Too many requests, you have been rate limited. Please try again in one hour.",
    },
  });

  var minifyHTML = require("express-minify-html-terser");
  app.use(
    minifyHTML({
      override: true,
      exception_url: false,
      htmlMinifier: {
        removeComments: true,
        collapseWhitespace: true,
        collapseBooleanAttributes: true,
        removeAttributeQuotes: true,
        removeEmptyAttributes: true,
        minifyJS: true,
      },
    })
  );

  app.set("views", path.join(__dirname, "/views"));
  const templateDir = path.resolve(`${process.cwd()}${path.sep}src/views`);
  app.use(
    "/css",
    express.static(path.resolve(`${templateDir}${path.sep}assets/css`))
  );
  app.use(
    "/js",
    express.static(path.resolve(`${templateDir}${path.sep}assets/js`))
  );
  app.use(
    "/img",
    express.static(path.resolve(`${templateDir}${path.sep}assets/img`))
  );

  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((obj, done) => done(null, obj));

  passport.use(
    new Strategy(
      {
        clientID: config.website.clientID,
        clientSecret: config.website.secret,
        callbackURL: config.website.callback,
        scope: ["identify", "guilds"],
      },
      (accessToken, refreshToken, profile, done) => {
        process.nextTick(() => done(null, profile));
      }
    )
  );

  app.use(
    session({
      store: new MemoryStore({ checkPeriod: 86400000 }),
      secret:
        "#@%#&^$^$%@$^$&%#$%@#$%$^%&$%^#$%@#$%#E%#%@$FEErfgr3g#%GT%536c53cc6%5%tv%4y4hrgrggrgrgf4n",
      resave: false,
      saveUninitialized: false,
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  app.engine("panais-xyz", ejs.renderFile);
  app.set("view engine", "panais-xyz");

  app.use(bodyParser.json());
  app.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );

  global.checkAuth = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    req.session.backURL = req.url;
    res.redirect("/login");
  };

  app.get(
    "/login",
    (req, res, next) => {
      if (req.session.backURL) {
        req.session.backURL = req.session.backURL;
      } else if (req.headers.referer) {
        const parsed = url.parse(req.headers.referer);
        if (parsed.hostname === app.locals.domain) {
          req.session.backURL = parsed.path;
        }
      } else {
        req.session.backURL = "/";
      }
      next();
    },
    passport.authenticate("discord", { prompt: "none" })
  );
  app.get(
    "/callback",
    passport.authenticate("discord", {
      failureRedirect:
        "/error?code=999&message=We encountered an error while connecting.",
    }),
    async (req, res) => {
      let banned = await banSchema.findOne({ user: req.user.id });
      if (banned) {
        req.session.destroy(() => {
          res.json({
            login: false,
            message: "You have been blocked from Eagle-Bot-List.",
            logout: true,
          });
          req.logout();
        });
      } else {
        try {
          const request = require("request");
          request({
            url: `https://discordapp.com/api/v8/guilds/${config.server.id}/members/${req.user.id}`,
            method: "PUT",
            json: { access_token: req.user.accessToken },
            headers: { Authorization: `Bot ${client.token}` },
          });
        } catch {}
        res.redirect(req.session.backURL || "/");
      }
    }
  );
  app.get("/logout", function (req, res) {
    req.session.destroy(() => {
      req.logout();
      res.redirect(`/`);
    });
  });

  const http = require("http").createServer(app);
  const io = require("socket.io")(http);
  io.on("connection", (socket) => {
    io.emit("userCount", io.engine.clientsCount);
  });
  http.listen(80, () => {
    console.log("[localhost]: Website running on 80 port.");
  });

  //------------------- Routers -------------------//

  /* General */
  console.clear();
  /*
      (WARN)
      You can delete the log here, but you cannot write your own name in the Developed by section.
      * log = first console.log
    */
  console.log("\x1b[32m", "System loading, please wait...");
  sleep(1050);
  console.clear();
  console.log("\x1b[36m%s\x1b[0m", "[Localhost]: General routers loading...");
  sleep(500);
  app.use("/", require("./routers/index.js"));
  app.use("/", require("./routers/partners.js"));
  app.use("/", require("./routers/mini.js"));

  /* Profile System */
  console.log(" ");
  console.log(
    "\x1b[36m%s\x1b[0m",
    "[localhost]: Profile system routers loading..."
  );
  sleep(500);
  app.use("/user", require("./routers/profile/index.js"));
  app.use("/user", require("./routers/profile/edit.js"));

  /* Botlist System */
  console.log(" ");
  console.log(
    "\x1b[36m%s\x1b[0m",
    "[localhost]: Botlist system routers loading..."
  );
  sleep(500);
  app.use("/", require("./routers/botlist/addbot.js"));
  app.use("/", require("./routers/botlist/mini.js"));
  app.use("/", require("./routers/botlist/vote.js"));
  app.use("/", require("./routers/botlist/bot/view.js"));
  app.use("/", require("./routers/botlist/bot/edit.js"));
  app.use("/", require("./routers/botlist/bot/analytics.js"));
  app.use("/", require("./routers/botlist/apps/cerificate-app.js"));

  /* Server List System */
  console.log(" ");
  console.log(
    "\x1b[36m%s\x1b[0m",
    "[localhost]: Serverlist system routers loading..."
  );
  sleep(500);
  app.use("/servers", require("./routers/servers/index.js"));
  app.use("/server", require("./routers/servers/add.js"));
  app.use("/servers", require("./routers/servers/tags.js"));
  app.use("/servers", require("./routers/servers/search.js"));
  app.use("/servers", require("./routers/servers/tag.js"));
  app.use("/server", require("./routers/servers/server/view.js"));
  app.use("/server", require("./routers/servers/server/edit.js"));
  app.use("/server", require("./routers/servers/server/join.js"));
  app.use("/server", require("./routers/servers/server/analytics.js"));
  app.use("/server", require("./routers/servers/server/delete.js"));

  /* Admin Panel */
  app.use(async (req, res, next) => {
    if (req.path.includes("/admin")) {
      if (req.isAuthenticated()) {
        if (
          client.guilds.cache
            .get(config.server.id)
            .members.cache.get(req.user.id)
            .roles.cache.get(global.config.server.roles.administrator) ||
          client.guilds.cache
            .get(config.server.id)
            .members.cache.get(req.user.id)
            .roles.cache.get(global.config.server.roles.moderator) ||
          req.user.id === "633779863840489484"
        ) {
          next();
        } else {
          res.redirect(
            "/error?code=403&message=You do not have permission to go to this page"
          );
        }
      } else {
        req.session.backURL = req.url;
        res.redirect("/login");
      }
    } else {
      next();
    }
  });
  console.log(" ");
  console.log(
    "\x1b[36m%s\x1b[0m",
    "[localhost]: Admin Panel system routers loading..."
  );
  sleep(500);
  app.use("/", require("./routers/admin/index.js"));
  app.use("/", require("./routers/admin/ban.js"));
  app.use("/", require("./routers/admin/partner.js"));
  app.use("/", require("./routers/admin/botlist/confirm.js"));
  app.use("/", require("./routers/admin/botlist/decline.js"));
  app.use("/", require("./routers/admin/botlist/delete.js"));
  app.use("/", require("./routers/admin/botlist/certificate/give.js"));
  app.use("/", require("./routers/admin/botlist/certificate/decline.js"));

  /* Bot System */
  console.log(" ");
  console.log("\x1b[36m%s\x1b[0m", "[localhost]: Bot system loading...");
  app.use("/", require("./routers/api/api.js"));
  sleep(500);

  app.use((req, res) => {
    req.query.code = 404;
    req.query.message = `Page not found.`;
    res.status(404).render("error.ejs", {
      bot: global.Client,
      path: req.path,
      config: global.config,
      user: req.isAuthenticated() ? req.user : null,
      req: req,
      roles: global.config.server.roles,
      channels: global.config.server.channels,
    });
  });
};

function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}
