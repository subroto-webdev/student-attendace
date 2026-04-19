const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    subject: { type: String, required: true },
    class: { type: String, required: true },
    section: { type: String, required: true },
    date: { type: String, required: true }, // "2024-01-15"
    status: {
      type: String,
      enum: ["present", "absent"],
      default: "present",
    },
    // QR দিয়ে দিয়েছে নাকি manually
    method: {
      type: String,
      enum: ["qr", "manual"],
      default: "qr",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Attendance", attendanceSchema);
