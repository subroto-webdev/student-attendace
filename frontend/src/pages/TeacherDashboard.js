import React, { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { scanQR, getReport, exportExcel, getAllStudents, manualAttendance } from "../services/api";
import { useNavigate } from "react-router-dom";
import QrScanner from "react-qr-scanner";

export default function TeacherDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("scan");
  const [scanning, setScanning] = useState(false);
  const [subject, setSubject] = useState("");
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState("");
  const [report, setReport] = useState([]);
  const [filter, setFilter] = useState({ class: "", section: "", subject: "", date: new Date().toISOString().split("T")[0] });
  const [exporting, setExporting] = useState(false);
  const [students, setStudents] = useState([]);
  const [manualMsg, setManualMsg] = useState("");

  const handleLogout = () => { logout(); navigate("/"); };

  // QR Scan handler
  const handleScan = async (data) => {
    if (!data || !subject) return;
    setScanning(false);
    try {
      const qrContent = typeof data === "string" ? data : data.text;
      const parsed = JSON.parse(qrContent);
      const res = await scanQR({ qrToken: parsed.qrToken, subject, date: filter.date });
      setScanResult({ success: true, message: res.data.message, student: res.data.student });
      setScanError("");
    } catch (err) {
      setScanResult(null);
      setScanError(err.response?.data?.message || "❌ QR Scan failed!");
    }
  };

  // Report fetch
  const fetchReport = async () => {
    try {
      const res = await getReport(filter);
      setReport(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Excel export
  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await exportExcel(filter);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `attendance_report_${filter.class || "all"}_${filter.date}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  // Load students for manual
  const loadStudents = async () => {
    const res = await getAllStudents();
    setStudents(res.data);
  };

  const handleManual = async (studentId, status) => {
    try {
      await manualAttendance({ studentId, subject: filter.subject || "General", date: filter.date, status });
      setManualMsg(`✅ Attendance saved!`);
      setTimeout(() => setManualMsg(""), 2000);
    } catch (err) {
      setManualMsg(err.response?.data?.message || "Error!");
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.headerTitle}>👨‍🏫 {user?.name}</h2>
          <p style={styles.headerSub}>Subject: {user?.subject}</p>
        </div>
        <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {["scan", "manual", "report"].map((t) => (
          <button key={t} style={{ ...styles.tab, ...(activeTab === t ? styles.activeTab : {}) }} onClick={() => { setActiveTab(t); if (t === "manual") loadStudents(); }}>
            {t === "scan" ? "📱 QR Scan" : t === "manual" ? "✋ Manual" : "📊 Report"}
          </button>
        ))}
      </div>

      <div style={styles.content}>

        {/* QR Scan Tab */}
        {activeTab === "scan" && (
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>📱 QR Code দিয়ে Attendance নিন</h3>

            <div style={styles.formRow}>
              <input style={styles.input} placeholder="📚 বিষয়ের নাম লিখুন" value={subject} onChange={(e) => setSubject(e.target.value)} />
              <input style={styles.input} type="date" value={filter.date} onChange={(e) => setFilter({ ...filter, date: e.target.value })} />
            </div>

            {!scanning ? (
              <button style={styles.scanBtn} onClick={() => { setScanResult(null); setScanError(""); setScanning(true); }} disabled={!subject}>
                📷 QR Scanner চালু করুন
              </button>
            ) : (
              <div style={styles.scannerBox}>
                <QrScanner
                  delay={300}
                  onError={(err) => setScanError("Camera error: " + err)}
                  onScan={handleScan}
                  style={{ width: "100%" }}
                  constraints={{ video: { facingMode: "environment" } }}
                />
                <button style={styles.stopBtn} onClick={() => setScanning(false)}>⏹ বন্ধ করুন</button>
              </div>
            )}

            {scanResult && (
              <div style={styles.successBox}>
                <h3>✅ সফল!</h3>
                <p>{scanResult.message}</p>
                {scanResult.student && (
                  <p>👤 {scanResult.student.name} | Roll: {scanResult.student.roll}</p>
                )}
              </div>
            )}
            {scanError && <div style={styles.errorBox}>{scanError}</div>}
          </div>
        )}

        {/* Manual Tab */}
        {activeTab === "manual" && (
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>✋ Manual Attendance</h3>
            <div style={styles.formRow}>
              <input style={styles.input} placeholder="📚 বিষয়" value={filter.subject} onChange={(e) => setFilter({ ...filter, subject: e.target.value })} />
              <input style={styles.input} type="date" value={filter.date} onChange={(e) => setFilter({ ...filter, date: e.target.value })} />
            </div>
            {manualMsg && <div style={styles.successBox}>{manualMsg}</div>}
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHead}>
                  <th style={styles.th}>নাম</th>
                  <th style={styles.th}>রোল</th>
                  <th style={styles.th}>ক্লাস</th>
                  <th style={styles.th}>উপস্থিতি</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "#f9f9f9" : "#fff" }}>
                    <td style={styles.td}>{s.name}</td>
                    <td style={styles.td}>{s.roll}</td>
                    <td style={styles.td}>{s.class}-{s.section}</td>
                    <td style={styles.td}>
                      <button style={styles.presentBtn} onClick={() => handleManual(s._id, "present")}>✅ Present</button>
                      <button style={styles.absentBtn} onClick={() => handleManual(s._id, "absent")}>❌ Absent</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Report Tab */}
        {activeTab === "report" && (
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>📊 Attendance Report</h3>
            <div style={styles.filterRow}>
              <input style={styles.input} placeholder="ক্লাস" value={filter.class} onChange={(e) => setFilter({ ...filter, class: e.target.value })} />
              <input style={styles.input} placeholder="সেকশন" value={filter.section} onChange={(e) => setFilter({ ...filter, section: e.target.value })} />
              <input style={styles.input} placeholder="বিষয়" value={filter.subject} onChange={(e) => setFilter({ ...filter, subject: e.target.value })} />
              <input style={styles.input} type="date" value={filter.date} onChange={(e) => setFilter({ ...filter, date: e.target.value })} />
            </div>
            <div style={styles.btnRow}>
              <button style={styles.fetchBtn} onClick={fetchReport}>🔍 Report দেখুন</button>
              <button style={styles.excelBtn} onClick={handleExport} disabled={exporting}>
                {exporting ? "Downloading..." : "📥 Excel Download"}
              </button>
            </div>

            {report.length > 0 && (
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHead}>
                    <th style={styles.th}>তারিখ</th>
                    <th style={styles.th}>নাম</th>
                    <th style={styles.th}>রোল</th>
                    <th style={styles.th}>বিষয়</th>
                    <th style={styles.th}>উপস্থিতি</th>
                    <th style={styles.th}>পদ্ধতি</th>
                  </tr>
                </thead>
                <tbody>
                  {report.map((r, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? "#f9f9f9" : "#fff" }}>
                      <td style={styles.td}>{r.date}</td>
                      <td style={styles.td}>{r.student?.name}</td>
                      <td style={styles.td}>{r.student?.roll}</td>
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
            )}
            {report.length === 0 && <p style={{ textAlign: "center", color: "#888", padding: 30 }}>Report দেখতে উপরে Filter দিয়ে Search করুন</p>}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", background: "#f0f2f5" },
  header: { background: "linear-gradient(135deg, #11998e, #38ef7d)", padding: "20px 30px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  headerTitle: { color: "#fff", fontSize: 22 },
  headerSub: { color: "rgba(255,255,255,0.85)", fontSize: 13, marginTop: 4 },
  logoutBtn: { background: "rgba(255,255,255,0.2)", color: "#fff", border: "1px solid rgba(255,255,255,0.5)", padding: "8px 18px", borderRadius: 8, cursor: "pointer" },
  tabs: { display: "flex", maxWidth: 800, margin: "20px auto 0", padding: "0 20px", gap: 5 },
  tab: { flex: 1, padding: "12px", border: "none", background: "#e0e0e0", cursor: "pointer", fontSize: 14, borderRadius: "8px 8px 0 0" },
  activeTab: { background: "#11998e", color: "#fff", fontWeight: "bold" },
  content: { maxWidth: 800, margin: "0 auto", padding: "0 20px 20px" },
  card: { background: "#fff", borderRadius: "0 0 15px 15px", padding: 25, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" },
  cardTitle: { fontSize: 18, color: "#333", marginBottom: 20 },
  formRow: { display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" },
  filterRow: { display: "flex", gap: 10, marginBottom: 15, flexWrap: "wrap" },
  input: { flex: 1, minWidth: 150, padding: "10px 12px", borderRadius: 8, border: "2px solid #e0e0e0", fontSize: 14 },
  scanBtn: { width: "100%", padding: "15px", background: "#11998e", color: "#fff", border: "none", borderRadius: 10, fontSize: 16, cursor: "pointer", fontWeight: "bold" },
  scannerBox: { marginTop: 15 },
  stopBtn: { width: "100%", padding: "10px", background: "#f44336", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", marginTop: 10, fontSize: 15 },
  successBox: { background: "#e8f5e9", border: "1px solid #4CAF50", borderRadius: 10, padding: 15, marginTop: 15, color: "#2e7d32" },
  errorBox: { background: "#ffebee", border: "1px solid #f44336", borderRadius: 10, padding: 15, marginTop: 15, color: "#c62828" },
  table: { width: "100%", borderCollapse: "collapse", marginTop: 15 },
  tableHead: { background: "#11998e", color: "#fff" },
  th: { padding: "12px", textAlign: "left", fontSize: 13 },
  td: { padding: "10px 12px", fontSize: 13, borderBottom: "1px solid #f0f0f0" },
  presentBtn: { background: "#4CAF50", color: "#fff", border: "none", padding: "6px 12px", borderRadius: 6, cursor: "pointer", marginRight: 5, fontSize: 12 },
  absentBtn: { background: "#f44336", color: "#fff", border: "none", padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12 },
  btnRow: { display: "flex", gap: 10, marginBottom: 15 },
  fetchBtn: { flex: 1, padding: "11px", background: "#667eea", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: "bold" },
  excelBtn: { flex: 1, padding: "11px", background: "#217346", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: "bold" },
};
