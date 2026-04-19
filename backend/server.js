const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

// .env ফাইল লোড করার জন্য
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// URI চেক করার জন্য
console.log("Connecting to:", process.env.MONGO_URI ? "URI Found ✅" : "URI Missing ❌");

// MongoDB connect settings
mongoose.set('strictQuery', false);

mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000, // ৫ সেকেন্ড পর টাইম-আউট হবে
  })
  .then(() => console.log("✅ MongoDB Connected Successfully to Atlas!"))
  .catch((err) => {
    console.log("❌ MongoDB Connection Error:");
    console.error(err.message);
    console.log("\n--- সমাধান না হলে এগুলো চেক করুন ---");
    console.log("১. আপনার পিসির ইন্টারনেট কানেকশন কি স্ট্যাবল?");
    console.log("২. .env ফাইলে পাসওয়ার্ডে কোনো স্পেস বা ভুল নেই তো?");
  });

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/students", require("./routes/studentRoutes"));
app.use("/api/attendance", require("./routes/attendanceRoutes"));

// Root Route
app.get("/", (req, res) => {
  res.send("School Attendance Server is Running...");
});

// Port settings
const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});