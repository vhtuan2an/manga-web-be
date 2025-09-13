const mongoose = require("mongoose");
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose
      .connect(process.env.MONGO_URI || "")
      .then(() => {
        console.log("Connected to MongoDB");
      })
      .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
      });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};

module.exports = connectDB;
