const express = require("express");
const router = express.Router();
const XLSX = require("xlsx");
const Student = require("../models/Student");
const Attendance = require("../models/Attendance");
const { protect, isTeacher, isStudent } = require("../middleware/authMiddleware");

// ✅ Student QR scan করে attendance দেবে
router.post("/scan-qr", protect, isTeacher, async (req, res) => {
  try {
    const { qrToken, subject, date } = req.body;

    // QR token দিয়ে student খোঁজো
    const student = await Student.findOne({ qrToken });
    if (!student) return res.status(404).json({ message: "❌ Invalid QR Code! Student not found" });

    const today = date || new Date().toISOString().split("T")[0];

    // আগে দিয়েছে কিনা check করো
    const existing = await Attendance.findOne({
      student: student._id,
      subject,
      date: today,
    });

    if (existing) {
      return res.status(400).json({
        message: `⚠️ ${student.name} এর attendance আজকে already নেওয়া হয়েছে!`,
      });
    }

    // Attendance save করো
    const attendance = await Attendance.create({
      student: student._id,
      teacher: req.user.id,
      subject,
      class: student.class,
      section: student.section,
      date: today,
      status: "present",
      method: "qr",
    });

    res.status(201).json({
      message: `✅ ${student.name} (Roll: ${student.roll}) এর attendance সফলভাবে নেওয়া হয়েছে!`,
      student: { name: student.name, roll: student.roll, class: student.class },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Teacher manually attendance দিতে পারবে
router.post("/manual", protect, isTeacher, async (req, res) => {
  try {
    const { studentId, subject, date, status } = req.body;
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const today = date || new Date().toISOString().split("T")[0];

    const existing = await Attendance.findOne({
      student: studentId,
      subject,
      date: today,
    });

    if (existing) {
      existing.status = status;
      await existing.save();
      return res.json({ message: "Attendance updated!" });
    }

    await Attendance.create({
      student: studentId,
      teacher: req.user.id,
      subject,
      class: student.class,
      section: student.section,
      date: today,
      status,
      method: "manual",
    });

    res.status(201).json({ message: "Attendance saved!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Teacher attendance report দেখবে
router.get("/report", protect, isTeacher, async (req, res) => {
  try {
    const { class: cls, section, subject, date } = req.query;
    const filter = {};
    if (cls) filter.class = cls;
    if (section) filter.section = section;
    if (subject) filter.subject = subject;
    if (date) filter.date = date;

    const records = await Attendance.find(filter)
      .populate("student", "name roll class section")
      .sort({ date: -1 });

    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Student নিজের attendance দেখবে
router.get("/my", protect, isStudent, async (req, res) => {
  try {
    const records = await Attendance.find({ student: req.user.id }).sort({ date: -1 });
    const total = records.length;
    const present = records.filter((r) => r.status === "present").length;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : 0;
    res.json({ records, total, present, absent: total - present, percentage });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Excel Export — Teacher এর জন্য
router.get("/export-excel", protect, isTeacher, async (req, res) => {
  try {
    const { class: cls, section, subject, startDate, endDate } = req.query;
    const filter = {};
    if (cls) filter.class = cls;
    if (section) filter.section = section;
    if (subject) filter.subject = subject;
    if (startDate && endDate) {
      filter.date = { $gte: startDate, $lte: endDate };
    }

    const records = await Attendance.find(filter)
      .populate("student", "name roll class section")
      .sort({ date: 1 });

    // Excel data তৈরি করো
    const data = records.map((r, i) => ({
      "ক্রমিক নং": i + 1,
      "তারিখ": r.date,
      "ছাত্রের নাম": r.student?.name || "N/A",
      "রোল নং": r.student?.roll || "N/A",
      "ক্লাস": r.class,
      "সেকশন": r.section,
      "বিষয়": r.subject,
      "উপস্থিতি": r.status === "present" ? "✅ উপস্থিত" : "❌ অনুপস্থিত",
      "পদ্ধতি": r.method === "qr" ? "QR Code" : "Manual",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);

    // Column width সেট করো
    worksheet["!cols"] = [
      { wch: 10 }, { wch: 12 }, { wch: 20 }, { wch: 10 },
      { wch: 8 }, { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 12 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Report");

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    res.setHeader("Content-Disposition", `attachment; filename=attendance_report_${cls || "all"}_${new Date().toISOString().split("T")[0]}.xlsx`);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
