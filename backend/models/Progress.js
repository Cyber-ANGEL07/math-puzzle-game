const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  mode: {
    type: String,
    required: true // "trivia" or "math"
  },

  level: {
    type: Number,
    required: true
  },

  score: Number,
  stars: Number,

  completed: {
    type: Boolean,
    default: false
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Progress", progressSchema);