const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullname: { type: String },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  token: { type: String, default: null },
  role: { type: String, default: null }
});

module.exports = mongoose.model("User", userSchema);
