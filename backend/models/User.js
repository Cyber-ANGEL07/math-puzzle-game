// This code was developed with assistance from a large language model (OpenAI ChatGPT / DeepSeek)

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    level: { type: Number, default: 1 },
    score: { type: Number, default: 0 },
    highScore: { type: Number, default: 0 },
    triviaScores: [
        {
            level: { type: Number, required: true },
            score: { type: Number, required: true },
            date: { type: Date, default: Date.now }
        }
    ],
    triviaTotalScore : { type: Number, default: 0 },

    mathScores: [
        {
            level: { type: Number, required: true },
            score: { type: Number, required: true },
            date: { type: Date, default: Date.now }
        }
    ], 
    mathTotalScore: { type: Number, default: 0 },
});

module.exports = mongoose.model("User", userSchema);