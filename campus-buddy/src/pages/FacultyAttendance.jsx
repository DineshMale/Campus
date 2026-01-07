import React, { useState } from "react";
import { NavLink } from "react-router-dom";

export default function FacultyAttendance() {
  const [preview, setPreview] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);

  // 🔑 STATES FOR MANUAL SELECTION
  const [className, setClassName] = useState("");
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState("");
  const [period, setPeriod] = useState("");

  // =========================
  // ANALYZE = OCR ONLY
  // =========================
  const analyzeAttendance = async () => {
    const fileInput = document.getElementById("fileInput");

    if (!fileInput.files[0]) {
      alert("Please upload an attendance image");
      return;
    }

    const formData = new FormData();
    formData.append("image", fileInput.files[0]);

    try {
      const response = await fetch("http://127.0.0.1:5000/ocr/attendance", {
        method: "POST",
        body: formData
      });

      const data = await response.json();
      setAttendanceData(Array.isArray(data) ? data : []);
      setShowResult(true);
    } catch (error) {
      console.error(error);
      alert("Error analyzing attendance");
    }
  };

  // =========================
  // SUBMIT = SAVE TO DATABASE
  // =========================
  const handleSubmitAttendance = async () => {
    if (!className || !subject || !date || !period) {
      alert("Please select Class, Subject, Date and Period");
      return;
    }

    if (attendanceData.length === 0) {
      alert("No attendance data to submit");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/attendance/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          class: className,
          subject: subject,
          date: date,
          period: period,
          attendance: attendanceData
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save attendance");
      }

      alert("Attendance saved successfully ✅");
    } catch (error) {
      console.error("Error saving attendance:", error);
      alert("Error saving attendance");
    }
  };

  return (
    <>
      {/* NAVBAR */}
      <nav className="navbar px-4">
        <span className="navbar-brand">CampusBuddy | Faculty</span>
        <div className="ms-auto d-flex align-items-center gap-4 text-white">
          <i className="bi bi-bell"></i>
          <i className="bi bi-person-circle"></i>
        </div>
      </nav>

      {/* SIDEBAR */}
      <div className="sidebar">
        <NavLink to="/faculty-dashboard" className={({ isActive }) => (isActive ? "active" : "")}>
          <i className="bi bi-speedometer2 me-2"></i> Dashboard
        </NavLink>

        <NavLink to="/faculty-attendance" className={({ isActive }) => (isActive ? "active" : "")}>
          <i className="bi bi-calendar-check me-2"></i> Attendance
        </NavLink>

        <NavLink to="/faculty-marks" className={({ isActive }) => (isActive ? "active" : "")}>
          <i className="bi bi-bar-chart-fill me-2"></i> Marks
        </NavLink>

        <NavLink to="/faculty-seating" className={({ isActive }) => (isActive ? "active" : "")}>
          <i className="bi bi-grid-3x3-gap me-2"></i> Exam Seating
        </NavLink>

        <NavLink to="/login">
          <i className="bi bi-box-arrow-right me-2"></i> Logout
        </NavLink>
      </div>

      {/* MAIN CONTENT */}
      <div className="main-content">
        <h3 className="mb-4">📸 AI-Based Attendance</h3>

        <div className="card p-4 mb-4">
          {/* 🔽 MANUAL SELECTION (SAME UI, NOW EDITABLE) */}
          <div className="row g-3 mb-3">
            <div className="col-md-3">
              <label className="form-label">Class</label>
              <input
                className="form-control"
                placeholder="CSE – II Year"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">Subject</label>
              <input
                className="form-control"
                placeholder="Data Science"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-control"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">Period</label>
              <select
                className="form-select"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                <option value="">Select Period</option>
                <option value="Period 1">Period 1</option>
                <option value="Period 2">Period 2</option>
                <option value="Period 3">Period 3</option>
              </select>
            </div>
          </div>

          {/* UPLOAD */}
          <div
            className="upload-box"
            onClick={() => document.getElementById("fileInput").click()}
          >
            <i className="bi bi-cloud-arrow-up"></i>
            <p className="fw-semibold mt-2 mb-1">Click or Drag Attendance Sheet</p>
            <small className="text-muted">PNG / JPG (AI will auto-detect roll numbers)</small>

            <input
              type="file"
              id="fileInput"
              hidden
              accept="image/*"
              onChange={(e) => setPreview(URL.createObjectURL(e.target.files[0]))}
            />
          </div>

          {preview && (
            <div className="text-center mt-3">
              <p className="fw-semibold mb-2">📷 Preview</p>
              <img src={preview} className="preview-img" alt="preview" />
            </div>
          )}

          <button className="btn btn-primary mt-4 w-100" onClick={analyzeAttendance}>
            Analyze Attendance
          </button>
        </div>

        {showResult && (
          <div className="card p-4">
            <h5 className="mb-3">🧠 AI Extracted Attendance</h5>

            <div className="table-responsive">
              <table className="table table-bordered text-center">
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Student Name</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceData.map((stu, index) => (
                    <tr key={index}>
                      <td>{stu.roll}</td>
                      <td>{stu.name}</td>
                      <td className={stu.status === "P" ? "text-success fw-bold" : "text-danger fw-bold"}>
                        {stu.status === "P" ? "Present" : "Absent"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              className="btn btn-success w-100 mt-3"
              onClick={handleSubmitAttendance}
            >
              Confirm & Submit Attendance
            </button>
          </div>
        )}
      </div>

      {/* STYLES UNCHANGED */}
      <style>{`
        body { background: #f4f6fb; font-family: "Segoe UI", sans-serif; }
        .navbar { background: linear-gradient(90deg, #4b6cb7, #182848); position: fixed; top: 0; width: 100%; height: 60px; z-index: 1000; }
        .navbar-brand { color: white; font-weight: bold; }
        .sidebar { position: fixed; top: 60px; width: 230px; height: calc(100vh - 60px); background: #182848; padding-top: 20px; }
        .sidebar a { display: block; color: #ddd; padding: 12px 20px; text-decoration: none; }
        .sidebar a.active, .sidebar a:hover { background: #4b6cb7; color: white; border-radius: 6px; margin: 0 10px; }
        .main-content { margin-left: 230px; margin-top: 60px; padding: 30px; }
        .card { border-radius: 14px; border: none; box-shadow: 0 8px 20px rgba(0,0,0,0.08); }
        .upload-box { border: 2px dashed #4b6cb7; border-radius: 12px; padding: 20px; text-align: center; cursor: pointer; background: #f8f9ff; }
        .upload-box i { font-size: 30px; color: #4b6cb7; }
        .preview-img { max-height: 200px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
      `}</style>
    </>
  );
}
