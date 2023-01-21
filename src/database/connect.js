const config = require("../../config.js");
const mongoose = require("mongoose");

module.exports = async () => {
  mongoose
    .connect(config.bot.mongourl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
      autoIndex: false,
    })
    .then(() => {
      console.log("[localhost]: Mongoose successfully connected.");
    })
    .catch((err) =>
      console.log(
        "[localhost]: An error occurred while connecting mongoose.",
        err
      )
    );
};
