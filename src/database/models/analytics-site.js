const mongoose = require("mongoose");
let hm = new mongoose.Schema({
id: String,
});

module.exports = mongoose.model("analytics", hm);
