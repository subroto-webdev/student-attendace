const express = require("express");
const router = express.Router();
const QRCode = require("qrcode");
const Student = require("../models/Student");
const { protect, isTeacher } = require("../middleware/authMiddleware");

// Student নিজের QR Code image পাবে
router.get("/my-qr", protect, async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    // QR Code এ student এর unique token encode করা হবে
    const qrData = JSON.stringify({
      qrToken: student.qrToken,
      studentId: student._id,
      name: student.name,
      roll: student.roll,
    });

    const qrImage = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: { dark: "#1a1a2e", light: "#ffffff" },
    });

    res.json({
      qrImage,
      qrToken: student.qrToken,
      name: student.name,
      roll: student.roll,
      class: student.class,
      section: student.section,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Teacher সব students দেখবে
router.get("/all", protect, isTeacher, async (req, res) => {
  try {
    const students = await Student.find().select("-password");
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Class অনুযায়ী students
router.get("/class/:cls/:section", protect, isTeacher, async (req, res) => {
  try {
    const students = await Student.find({
      class: req.params.cls,
      section: req.params.section,
    }).select("-password");
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
