const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token, unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

const isTeacher = (req, res, next) => {
  if (req.user.role !== "teacher")
    return res.status(403).json({ message: "Only teachers allowed" });
  next();
};

const isStudent = (req, res, next) => {
  if (req.user.role !== "student")
    return res.status(403).json({ message: "Only students allowed" });
  next();
};

module.exports = { protect, isTeacher, isStudent };
