const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");

// Teacher Register
router.post("/teacher/register", async (req, res) => {
  try {
    const { name, email, password, subject } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const teacher = await Teacher.create({ name, email, password: hashed, subject });
    res.status(201).json({ message: "Teacher registered successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Student Register
router.post("/student/register", async (req, res) => {
  try {
    const { name, roll, class: cls, section, email, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const student = await Student.create({
      name, roll, class: cls, section, email, password: hashed,
    });
    res.status(201).json({ message: "Student registered successfully", qrToken: student.qrToken });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Teacher Login
router.post("/teacher/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const teacher = await Teacher.findOne({ email });
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });
    const match = await bcrypt.compare(password, teacher.password);
    if (!match) return res.status(400).json({ message: "Wrong password" });
    const token = jwt.sign(
      { id: teacher._id, role: "teacher", name: teacher.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({ token, name: teacher.name, role: "teacher", subject: teacher.subject });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Student Login
router.post("/student/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const student = await Student.findOne({ email });
    if (!student) return res.status(404).json({ message: "Student not found" });
    const match = await bcrypt.compare(password, student.password);
    if (!match) return res.status(400).json({ message: "Wrong password" });
    const token = jwt.sign(
      { id: student._id, role: "student", name: student.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({
      token,
      name: student.name,
      role: "student",
      qrToken: student.qrToken,
      roll: student.roll,
      class: student.class,
      section: student.section,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
