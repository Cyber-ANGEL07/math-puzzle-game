const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true }, // new field
    level: { type: Number, default: 1 },
    score: { type: Number, default: 0 },
    highScore: { type: Number, default: 0 }
  });
  

module.exports = mongoose.model("User", userSchema);
