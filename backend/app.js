require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./db");
const User = require("./models/User");

console.log('MONGO_URI is:', process.env.MONGO_URI);


const app = express();
connectDB();

app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Math Reflex Survival Backend Running 🚀");
});

// REGISTER route
app.post("/register", async (req, res) => {
  try {
    
    console.log("BODY RECEIVED:", req.body);
    
    const { username, password, phone } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ error: "User already exists" });

    const newUser = new User({ username, password, phone });
    await newUser.save();

    res.json({ message: "User registered successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// LOGIN route
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    res.json({
      userId: user._id,
      username: user.username
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/register", async (req, res) => {
  try {
    const { username, password, phone } = req.body;
    if (!username || !password || !phone) {
      return res.status(400).json({ error: "All fields required" });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ error: "User already exists" });

    const newUser = new User({ username, password, phone });
    await newUser.save();

    res.json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
