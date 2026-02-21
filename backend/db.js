const mongoose = require("mongoose");

require("dotenv").config(); // MUST be at top

const connectDB = async () => {
  try {
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected 🍃");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};

module.exports = connectDB;