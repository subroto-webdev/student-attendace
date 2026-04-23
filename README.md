# 🏫 School Attendance System
### QR Code + Excel Export | MERN Stack

--- School Attendance System Live demo :https://student-attendance-system10.netlify.app/)](https://student-attendance2026.netlify.app/

## ✨ Features

- 📱 **Unique QR Code** — প্রতিটা Student এর আলাদা QR Code
- 📷 **QR Scanner** — Teacher camera দিয়ে scan করে attendance নেয়
- ✋ **Manual Attendance** — Teacher চাইলে manually ও দিতে পারে
- 📊 **Excel Export** — যেকোনো date range এর report download
- 🔐 **JWT Auth** — Secure login system
- 👥 **3 Roles** — Admin, Teacher, Student
- 📅 **Attendance History** — Student নিজের record দেখতে পারে
- 📈 **Percentage** — Attendance % automatically calculate হয়

---

## 🚀 Installation (Step by Step)

### Step 1 — Clone করুন
\`\`\`bash
git clone <your-repo-url>
cd school-attendance
\`\`\`

### Step 2 — Backend Setup
\`\`\`bash
cd backend
npm install
\`\`\`

`.env` file তৈরি করুন:
\`\`\`env
MONGO_URI=mongodb://127.0.0.1:27017/school_attendance
JWT_SECRET=school_attendance_secret_key_2024
PORT=5000
\`\`\`

Backend চালু করুন:
\`\`\`bash
npm start
\`\`\`

### Step 3 — Frontend Setup
\`\`\`bash
cd ../frontend
npm install
\`\`\`

`.env` file তৈরি করুন:
\`\`\`env
REACT_APP_API_URL=http://localhost:5000/api
\`\`\`

Frontend চালু করুন:
\`\`\`bash
npm start
\`\`\`

### Step 4 — Browser এ দেখুন
\`\`\`
http://localhost:3000
\`\`\`

---

## 📖 কীভাবে ব্যবহার করবেন

### 👨‍🎓 Student
1. Register করুন (name, email, password, roll, class, section)
2. Login করুন
3. **"আমার QR Code"** tab এ নিজের unique QR দেখুন
4. QR Code download করুন বা Teacher কে দেখান
5. **"Attendance Record"** tab এ নিজের history দেখুন

### 👨‍🏫 Teacher
1. Register করুন (name, email, password, subject)
2. Login করুন
3. **"QR Scan"** tab এ বিষয় লিখে Scanner চালু করুন
4. Student এর QR Code scan করুন → attendance হয়ে যাবে
5. **"Report"** tab এ filter দিয়ে attendance দেখুন
6. **"Excel Download"** button এ click করে Excel পান

---

## 🛠️ Tech Stack

| Part | Technology |
|------|-----------|
| Frontend | React.js, React Router |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcryptjs |
| QR Code | qrcode (generate), react-qr-scanner (scan) |
| Excel | xlsx (SheetJS) |

---

## 📁 Project Structure

\`\`\`
school-attendance/
├── backend/
│   ├── models/
│   │   ├── Student.js      ← Unique QR token আছে
│   │   ├── Teacher.js
│   │   └── Attendance.js
│   ├── routes/
│   │   ├── authRoutes.js   ← Login/Register
│   │   ├── studentRoutes.js ← QR Code generate
│   │   └── attendanceRoutes.js ← Scan + Excel
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── .env
│   └── server.js
└── frontend/
    └── src/
        ├── pages/
        │   ├── Login.js
        │   ├── Register.js
        │   ├── StudentDashboard.js  ← QR দেখায়
        │   └── TeacherDashboard.js  ← Scan + Excel
        ├── context/AuthContext.js
        ├── services/api.js
        └── App.js
\`\`\`

---

## 🔑 API Endpoints

| Method | URL | কাজ |
|--------|-----|-----|
| POST | /api/auth/student/register | Student register |
| POST | /api/auth/teacher/register | Teacher register |
| POST | /api/auth/student/login | Student login |
| POST | /api/auth/teacher/login | Teacher login |
| GET | /api/students/my-qr | Student এর QR Code |
| GET | /api/students/all | সব students |
| POST | /api/attendance/scan-qr | QR scan করে attendance |
| POST | /api/attendance/manual | Manual attendance |
| GET | /api/attendance/report | Report দেখা |
| GET | /api/attendance/my | Student এর নিজের record |
| GET | /api/attendance/export-excel | Excel download |

---

Made with ❤️ | MERN Stack | QR Attendance System |MY_TEACHER_2026_KEY_ABC

