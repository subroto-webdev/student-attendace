import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getMyQR, getMyAttendance } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [qrData, setQrData] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [activeTab, setActiveTab] = useState("qr");

  useEffect(() => {
    fetchQR();
    fetchAttendance();
  }, []);

  const fetchQR = async () => {
    try {
      const res = await getMyQR();
      setQrData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAttendance = async () => {
    try {
      const res = await getMyAttendance();
      setAttendance(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.headerTitle}>👨‍🎓 {user?.name}</h2>
          <p style={styles.headerSub}>Class: {user?.class} | Section: {user?.section} | Roll: {user?.roll}</p>
        </div>
        <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button style={{ ...styles.tab, ...(activeTab === "qr" ? styles.activeTab : {}) }} onClick={() => setActiveTab("qr")}>
          📱 আমার QR Code
        </button>
        <button style={{ ...styles.tab, ...(activeTab === "attendance" ? styles.activeTab : {}) }} onClick={() => setActiveTab("attendance")}>
          📊 Attendance Record
        </button>
      </div>

      {/* QR Code Tab */}
      {activeTab === "qr" && (
        <div style={styles.content}>
          <div style={styles.qrCard}>
            <h3 style={styles.qrTitle}>আমার Unique QR Code</h3>
            <p style={styles.qrSub}>এই QR Code টা শুধু আপনার — Teacher scan করলেই attendance হবে</p>

            {qrData ? (
              <>
                <div style={styles.qrWrapper}>
                  <img src={qrData.qrImage} alt="QR Code" style={styles.qrImage} />
                </div>
                <div style={styles.studentInfo}>
                  <div style={styles.infoRow}><span>👤 নাম:</span><strong>{qrData.name}</strong></div>
                  <div style={styles.infoRow}><span>📋 রোল:</span><strong>{qrData.roll}</strong></div>
                  <div style={styles.infoRow}><span>🏫 ক্লাস:</span><strong>{qrData.class} - {qrData.section}</strong></div>
                </div>
                <p style={styles.tokenNote}>🔑 Token: {qrData.qrToken?.substring(0, 20)}...</p>
                <button style={styles.downloadBtn} onClick={() => {
                  const link = document.createElement("a");
                  link.href = qrData.qrImage;
                  link.download = `QR_${qrData.name}_${qrData.roll}.png`;
                  link.click();
                }}>
                  ⬇️ QR Code Download করুন
                </button>
              </>
            ) : (
              <p style={styles.loading}>Loading QR Code...</p>
            )}
          </div>
        </div>
      )}

      {/* Attendance Tab */}
      {activeTab === "attendance" && attendance && (
        <div style={styles.content}>
          {/* Summary */}
          <div style={styles.summaryRow}>
            <div style={{ ...styles.summaryCard, background: "#4CAF50" }}>
              <h2>{attendance.present}</h2><p>উপস্থিত</p>
            </div>
            <div style={{ ...styles.summaryCard, background: "#f44336" }}>
              <h2>{attendance.absent}</h2><p>অনুপস্থিত</p>
            </div>
            <div style={{ ...styles.summaryCard, background: "#2196F3" }}>
              <h2>{attendance.percentage}%</h2><p>হার</p>
            </div>
          </div>

          {/* Records */}
          <div style={styles.tableCard}>
            <h3 style={{ marginBottom: 15 }}>📅 Attendance Records</h3>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHead}>
                  <th style={styles.th}>তারিখ</th>
                  <th style={styles.th}>বিষয়</th>
                  <th style={styles.th}>উপস্থিতি</th>
                  <th style={styles.th}>পদ্ধতি</th>
                </tr>
              </thead>
              <tbody>
                {attendance.records.map((r, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "#f9f9f9" : "#fff" }}>
                    <td style={styles.td}>{r.date}</td>
                    <td style={styles.td}>{r.subject}</td>
                    <td style={styles.td}>
                      <span style={{ color: r.status === "present" ? "#4CAF50" : "#f44336", fontWeight: "bold" }}>
                        {r.status === "present" ? "✅ উপস্থিত" : "❌ অনুপস্থিত"}
                      </span>
                    </td>
                    <td style={styles.td}>{r.method === "qr" ? "📱 QR" : "✋ Manual"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", background: "#f0f2f5" },
  header: { background: "linear-gradient(135deg, #667eea, #764ba2)", padding: "20px 30px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  headerTitle: { color: "#fff", fontSize: 22 },
  headerSub: { color: "rgba(255,255,255,0.8)", fontSize: 13, marginTop: 4 },
  logoutBtn: { background: "rgba(255,255,255,0.2)", color: "#fff", border: "1px solid rgba(255,255,255,0.5)", padding: "8px 18px", borderRadius: 8, cursor: "pointer" },
  tabs: { display: "flex", gap: 0, padding: "20px 20px 0", maxWidth: 700, margin: "0 auto" },
  tab: { flex: 1, padding: "12px", border: "none", background: "#e0e0e0", cursor: "pointer", fontSize: 15 },
  activeTab: { background: "#667eea", color: "#fff", fontWeight: "bold" },
  content: { maxWidth: 700, margin: "0 auto", padding: 20 },
  qrCard: { background: "#fff", borderRadius: 15, padding: 30, textAlign: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" },
  qrTitle: { fontSize: 22, color: "#333", marginBottom: 8 },
  qrSub: { color: "#888", fontSize: 14, marginBottom: 25 },
  qrWrapper: { display: "inline-block", padding: 15, background: "#f8f8f8", borderRadius: 15, marginBottom: 20, border: "3px solid #667eea" },
  qrImage: { width: 220, height: 220, display: "block" },
  studentInfo: { background: "#f5f5f5", borderRadius: 10, padding: "15px 20px", marginBottom: 15, textAlign: "left" },
  infoRow: { display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #e0e0e0", fontSize: 15 },
  tokenNote: { color: "#aaa", fontSize: 12, marginBottom: 15 },
  downloadBtn: { background: "#4CAF50", color: "#fff", border: "none", padding: "12px 25px", borderRadius: 10, cursor: "pointer", fontSize: 15, fontWeight: "bold" },
  loading: { color: "#888", padding: 40 },
  summaryRow: { display: "flex", gap: 15, marginBottom: 20 },
  summaryCard: { flex: 1, color: "#fff", borderRadius: 12, padding: "20px", textAlign: "center", boxShadow: "0 4px 15px rgba(0,0,0,0.1)" },
  tableCard: { background: "#fff", borderRadius: 15, padding: 25, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" },
  table: { width: "100%", borderCollapse: "collapse" },
  tableHead: { background: "#667eea", color: "#fff" },
  th: { padding: "12px", textAlign: "left", fontSize: 14 },
  td: { padding: "10px 12px", fontSize: 14, borderBottom: "1px solid #f0f0f0" },
};
