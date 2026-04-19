const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    roll: { type: String, required: true, unique: true },
    class: { type: String, required: true },
    section: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // প্রতিটা student এর unique QR token
    qrToken: {
      type: String,
      default: () => uuidv4(),
      unique: true,
    },
    role: { type: String, default: "student" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);
