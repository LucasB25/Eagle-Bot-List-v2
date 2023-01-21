module.exports = {
  bot: {
    token: "TOKEN_HERE", // Bot List Bot Token
    prefix: "PREFIX",
    owners: ["OWNERS_ID", "OWNERS_ID"],
    mongourl: "MONGO_URL", //https://mongodb.com/cloud/atlas/register
    servers: {
      token: "TOKEN_HERE", // Server List Bot Token
      prefix: "PREFIX",
    },
  },

  website: {
    callback: "http://localhost/callback",
    secret: "SECRET_HERE",
    clientID: "BOT_ID_HERE",
    tags: [
      "Moderation",
      "Fun",
      "Minecraft",
      "Economy",
      "Guard",
      "NSFW",
      "Anime",
      "Invite",
      "Music",
      "Logging",
      "Web Dashboard",
      "Reddit",
      "Youtube",
      "Twitch",
      "Crypto",
      "Leveling",
      "Game",
      "Roleplay",
      "Utility",
      "24-7 Music",
      "Multipurpose",
    ],
    languages: [
      { flag: "gb", code: "en", name: "English" },
      { flag: "fr", code: "fr", name: "Frensh" },
      { flag: "tr", code: "tr", name: "Türkçe" },
      { flag: "de", code: "de", name: "Deutsch" },
    ],
    servers: {
      tags: [
        {
          icon: "fal fa-code",
          name: "Development",
        },
        {
          icon: "fal fa-play",
          name: "Stream",
        },
        {
          icon: "fal fa-camera",
          name: "Media",
        },
        {
          icon: "fal fa-building",
          name: "Company",
        },
        {
          icon: "fal fa-gamepad",
          name: "Game",
        },
        {
          icon: "fal fa-icons",
          name: "Emoji",
        },
        {
          icon: "fal fa-robot",
          name: "Bot List",
        },
        {
          icon: "fal fa-server",
          name: "Server List",
        },
        {
          icon: "fal fa-moon-stars",
          name: "Turkish",
        },
        {
          icon: "fab fa-discord",
          name: "Support",
        },
        {
          icon: "fal fa-volume",
          name: "Sound",
        },
        {
          icon: "fal fa-comments",
          name: "Chatting",
        },
        {
          icon: "fal fa-lips",
          name: "NSFW",
        },
        {
          icon: "fal fa-comment-slash",
          name: "Challange",
        },
        {
          icon: "fal fa-hand-rock",
          name: "Protest",
        },
        {
          icon: "fal fa-headphones-alt",
          name: "Roleplay",
        },
        {
          icon: "fal fa-grin-alt",
          name: "Meme",
        },
        {
          icon: "fal fa-shopping-cart",
          name: "Shop",
        },
        {
          icon: "fal fa-desktop",
          name: "Technology",
        },
        {
          icon: "fal fa-laugh",
          name: "Fun",
        },
        {
          icon: "fal fa-share-alt",
          name: "Social",
        },
        {
          icon: "fal fa-laptop",
          name: "E-Spor",
        },
        {
          icon: "fal fa-palette",
          name: "Design",
        },
        {
          icon: "fal fa-users",
          name: "Community",
        },
      ],
    },
  },

  server: {
    id: "SERVER_ID_HERE",
    invite: "https://discord.gg/erfB647CVm",
    roles: {
      administrator: "ADMIN_ID_HERE",
      moderator: "MODERATOR_ID_HERE",
      profile: {
        sitecreator: "OWNER_ID_HERE",
        booster: "BOOSTER_ID_HERE",
        sponsor: "SPONSOR_ID_HERE",
        supporter: "SUPPORT_ID_HERE",
        partnerRole: "PARTNER_ID_HERE",
      },
      botlist: {
        developer: "BOT_DEVELOPPER_ROLE_ID_HERE",
        certified_developer: "CERTIF_USER_ROLE_ID_HERE",
        bot: "BOT_ROLE_ID_HERE",
        certified_bot: "CERTIF_BOT_ROLE_ID_HERE",
      },
    },
    channels: {
      botlog: "WEBSITE__CHANNEL_ID_HERE",
      votes: "VOTE__CHANNEL_ID_HERE",
    },
  },
};
