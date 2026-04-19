import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginTeacher, loginStudent } from "../services/api";

export default function Login() {
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const fn = role === "teacher" ? loginTeacher : loginStudent;
      const res = await fn({ email, password });
      login({ ...res.data, role });
      navigate(role === "teacher" ? "/teacher" : "/student");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🏫 School Attendance</h1>
        <p style={styles.subtitle}>QR Code Attendance System</p>

        <div style={styles.roleToggle}>
          <button
            style={{ ...styles.roleBtn, ...(role === "student" ? styles.activeRole : {}) }}
            onClick={() => setRole("student")}
          >👨‍🎓 Student</button>
          <button
            style={{ ...styles.roleBtn, ...(role === "teacher" ? styles.activeRole : {}) }}
            onClick={() => setRole("teacher")}
          >👨‍🏫 Teacher</button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            style={styles.input}
            type="email"
            placeholder="📧 Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            style={styles.input}
            type="password"
            placeholder="🔒 Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p style={styles.error}>{error}</p>}
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? "Loading..." : "Login করুন"}
          </button>
        </form>

        <p style={styles.register}>
          নতুন account?{" "}
          <span style={styles.link} onClick={() => navigate("/register")}>
            Register করুন
          </span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
  card: { background: "#fff", borderRadius: 20, padding: 40, width: 380, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" },
  title: { textAlign: "center", color: "#333", fontSize: 26, marginBottom: 5 },
  subtitle: { textAlign: "center", color: "#888", marginBottom: 25, fontSize: 14 },
  roleToggle: { display: "flex", gap: 10, marginBottom: 20 },
  roleBtn: { flex: 1, padding: "10px", border: "2px solid #e0e0e0", borderRadius: 10, cursor: "pointer", background: "#f5f5f5", fontSize: 14 },
  activeRole: { background: "#667eea", color: "#fff", border: "2px solid #667eea" },
  form: { display: "flex", flexDirection: "column", gap: 15 },
  input: { padding: "12px 15px", borderRadius: 10, border: "2px solid #e0e0e0", fontSize: 15, outline: "none" },
  error: { color: "red", fontSize: 13, textAlign: "center" },
  btn: { padding: "13px", background: "#667eea", color: "#fff", border: "none", borderRadius: 10, fontSize: 16, cursor: "pointer", fontWeight: "bold" },
  register: { textAlign: "center", marginTop: 20, color: "#666", fontSize: 14 },
  link: { color: "#667eea", cursor: "pointer", fontWeight: "bold" },
};
