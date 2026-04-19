import axios from "axios";

const API = axios.create({ baseURL: process.env.REACT_APP_API_URL });

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export const loginTeacher = (data) => API.post("/auth/teacher/login", data);
export const loginStudent = (data) => API.post("/auth/student/login", data);
export const registerTeacher = (data) => API.post("/auth/teacher/register", data);
export const registerStudent = (data) => API.post("/auth/student/register", data);

export const getMyQR = () => API.get("/students/my-qr");
export const getAllStudents = () => API.get("/students/all");
export const getStudentsByClass = (cls, section) => API.get(`/students/class/${cls}/${section}`);

export const scanQR = (data) => API.post("/attendance/scan-qr", data);
export const manualAttendance = (data) => API.post("/attendance/manual", data);
export const getReport = (params) => API.get("/attendance/report", { params });
export const getMyAttendance = () => API.get("/attendance/my");
export const exportExcel = (params) => API.get("/attendance/export-excel", { params, responseType: "blob" });
