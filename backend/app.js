require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./db");
const User = require("./models/User");
const bcrypt = require("bcrypt");

console.log('MONGO_URI is:', process.env.MONGO_URI);

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

function decodeHtml(str) {
  if (!str) return str;

  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
}

// Test route
app.get("/", (req, res) => {
  res.send("Math Reflex Survival Backend Running 🚀");
});

// REGISTER route
app.post("/register", async (req, res) => {
  try {
    const { username, password, phone } = req.body;

    if (!username || !password || !phone)
      return res.status(400).json({ error: "All fields required" });

    // Strong password validation
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error:
          "Password must be at least 8 characters, include uppercase, lowercase, number, and special character"
      });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser)
      return res.status(400).json({ error: "User already exists" });

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      password: hashedPassword,
      phone
    });

    await newUser.save();

    res.json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// ==========================
// LOGIN route
// ==========================
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user by username only
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    // Compare entered password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    res.json({
      userId: user._id,
      username: user.username
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

const fetch = require("node-fetch"); // npm install node-fetch@2

// Save score route
app.post("/api/saveScore/:game", async (req, res) => {
  try {
    const { userId, score, level } = req.body;
    const game = req.params.game; // "trivia" or "math"

    if (!userId || score == null) {
      return res.status(400).json({ error: "Missing userId or score" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (game === "trivia") {
      user.triviaScores.push({ level, score });
    } else if (game === "math") {
      user.mathScores.push({ level, score });
    } else {
      return res.status(400).json({ error: "Invalid game type" });
    }

    // Update highScore if necessary
    if (score > user.highScore) user.highScore = score;

    await user.save();

    res.json({ message: "Score saved successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ==========================
// GET LEADERBOARD
// ==========================
app.get("/api/leaderboard/:game", async (req, res) => {
  try {
    const { game } = req.params; // "trivia" or "math"
    const limit = parseInt(req.query.limit) || 10; // top N users

    if (!["trivia", "math"].includes(game))
      return res.status(400).json({ error: "Invalid game type" });

    // Fetch all users with their scores for the given game
    const users = await User.find({}, { username: 1, [game + "Scores"]: 1 });

    // Compute highest score per user
    const leaderboard = users.map(u => {
      const scores = u[game + "Scores"];
      const maxScore = scores.length ? Math.max(...scores.map(s => s.score)) : 0;
      return { username: u.username, score: maxScore };
    });

    // Sort descending by score
    leaderboard.sort((a, b) => b.score - a.score);

    // Return top N
    res.json(leaderboard.slice(0, limit));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});


app.get("/api/trivia", async (req, res) => {
  try {
    // You can make this dynamic with query params later
    const amount = req.query.amount || 1;
    const category = req.query.category || 17; // Math/Science
    const difficulty = req.query.difficulty || "easy";

    const response = await fetch(
      `https://opentdb.com/api.php?amount=${amount}&category=${category}&type=multiple&difficulty=${difficulty}`
    );

    if (!response.ok) {
      return res.status(500).json({ error: "Trivia API failed" });
    }

    const data = await response.json();

    // Clean HTML entities
    data.results = data.results.map(q => ({
      ...q,
      question: decodeHtml(q.question),
      category: decodeHtml(q.category),
      correct_answer: decodeHtml(q.correct_answer),
      incorrect_answers: q.incorrect_answers.map(ans => decodeHtml(ans))
    }));
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});



// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
