import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerTeacher, registerStudent } from "../services/api";

export default function Register() {
  const [role, setRole] = useState("student");
  const [form, setForm] = useState({ name: "", email: "", password: "", roll: "", class: "", section: "", subject: "" });
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setMsg("");
    try {
      const fn = role === "teacher" ? registerTeacher : registerStudent;
      const res = await fn(form);
      setMsg("✅ Registration সফল! Login করুন। " + (res.data.qrToken ? `QR Token: ${res.data.qrToken}` : ""));
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed!");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>📝 নতুন Account</h2>

        <div style={styles.roleToggle}>
          <button style={{ ...styles.roleBtn, ...(role === "student" ? styles.active : {}) }} onClick={() => setRole("student")}>👨‍🎓 Student</button>
          <button style={{ ...styles.roleBtn, ...(role === "teacher" ? styles.active : {}) }} onClick={() => setRole("teacher")}>👨‍🏫 Teacher</button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input style={styles.input} name="name" placeholder="পুরো নাম" onChange={handleChange} required />
          <input style={styles.input} name="email" type="email" placeholder="Email" onChange={handleChange} required />
          <input style={styles.input} name="password" type="password" placeholder="Password" onChange={handleChange} required />

          {role === "student" && <>
            <input style={styles.input} name="roll" placeholder="Roll No" onChange={handleChange} required />
            <input style={styles.input} name="class" placeholder="Class (যেমন: 8)" onChange={handleChange} required />
            <input style={styles.input} name="section" placeholder="Section (যেমন: A)" onChange={handleChange} required />
          </>}

          {role === "teacher" && (
            <input style={styles.input} name="subject" placeholder="Subject" onChange={handleChange} required />
          )}

          {msg && <p style={{ color: "green", fontSize: 13 }}>{msg}</p>}
          {error && <p style={{ color: "red", fontSize: 13 }}>{error}</p>}

          <button style={styles.btn} type="submit">Register করুন</button>
        </form>

        <p style={styles.back} onClick={() => navigate("/")}>← Login এ ফিরে যান</p>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #11998e, #38ef7d)" },
  card: { background: "#fff", borderRadius: 20, padding: 35, width: 380, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" },
  title: { textAlign: "center", marginBottom: 20, color: "#333" },
  roleToggle: { display: "flex", gap: 10, marginBottom: 20 },
  roleBtn: { flex: 1, padding: 10, border: "2px solid #e0e0e0", borderRadius: 10, cursor: "pointer", background: "#f5f5f5" },
  active: { background: "#11998e", color: "#fff", border: "2px solid #11998e" },
  form: { display: "flex", flexDirection: "column", gap: 12 },
  input: { padding: "11px 14px", borderRadius: 8, border: "2px solid #e0e0e0", fontSize: 14 },
  btn: { padding: 13, background: "#11998e", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, cursor: "pointer", fontWeight: "bold" },
  back: { textAlign: "center", marginTop: 18, color: "#11998e", cursor: "pointer", fontSize: 14 },
};
