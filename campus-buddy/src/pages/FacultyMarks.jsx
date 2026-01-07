import React, { useState } from "react";
import { NavLink } from "react-router-dom";

const FacultyMarks = () => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [showTable, setShowTable] = useState(false);
  const [marks, setMarks] = useState([]);

  // ✅ REQUIRED STATES (LOGIC ONLY)
  const [className, setClassName] = useState("");
  const [subject, setSubject] = useState("");
  const [examType, setExamType] = useState("Mid Exam");
  const [maxMarks, setMaxMarks] = useState(100);

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setFileName(uploadedFile.name);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      alert("Please upload a marks file first!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://127.0.0.1:5000/ocr/marks", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!data.marks_data || data.marks_data.length === 0) {
        alert("No marks detected");
        return;
      }

      setMarks(data.marks_data);
      setShowTable(true);
    } catch (err) {
      console.error(err);
      alert("Failed to extract marks");
    }
  };

  const handleSubmitMarks = async () => {
    if (!className || !subject || !examType) {
      alert("Please fill all details");
      return;
    }

    if (marks.length === 0) {
      alert("No marks to submit");
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:5000/marks/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          class: className,
          subject: subject,
          examType: examType,
          maxMarks: maxMarks,
          marks: marks,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert(`Marks published successfully ✅ (${data.count} students)`);
    } catch (err) {
      console.error(err);
      alert("Failed to save marks");
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
        <NavLink to="/faculty-dashboard">
          <i className="bi bi-speedometer2 me-2"></i>Dashboard
        </NavLink>

        <NavLink to="/faculty-attendance">
          <i className="bi bi-calendar-check me-2"></i>Attendance
        </NavLink>

        <NavLink
          to="/faculty-marks"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <i className="bi bi-bar-chart-fill me-2"></i>Marks
        </NavLink>

        <NavLink to="/faculty-seating">
          <i className="bi bi-grid-3x3-gap me-2"></i>Exam Seating
        </NavLink>

        <NavLink to="/login">
          <i className="bi bi-box-arrow-right me-2"></i>Logout
        </NavLink>
      </div>

      {/* MAIN CONTENT */}
      <div className="main-content">
        <h3 className="mb-4">📊 Upload & Manage Marks</h3>

        <div className="card p-4 mb-4">
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
              <label className="form-label">Exam Type</label>
              <select
                className="form-select"
                value={examType}
                onChange={(e) => setExamType(e.target.value)}
              >
                <option>Mid Exam</option>
                <option>Internal</option>
                <option>End Semester</option>
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label">Max Marks</label>
              <input
                type="number"
                className="form-control"
                value={maxMarks}
                onChange={(e) => setMaxMarks(Number(e.target.value))}
              />
            </div>
          </div>

          <div
            className="upload-box"
            onClick={() => document.getElementById("marksInput").click()}
          >
            <i className="bi bi-file-earmark-arrow-up"></i>
            <p className="fw-semibold mt-2 mb-1">Upload Marks Sheet</p>
            <small className="text-muted">
              Image / Excel / CSV supported
            </small>

            <input
              type="file"
              id="marksInput"
              hidden
              onChange={handleFileChange}
            />
          </div>

          {fileName && (
            <div className="mt-3 p-2 rounded bg-light">
              <strong>Uploaded:</strong> {fileName}
            </div>
          )}

          <button
            className="btn btn-primary w-100 mt-4"
            onClick={handleAnalyze}
          >
            Analyze & Extract Marks
          </button>
        </div>

        {showTable && (
          <div className="card p-4">
            <h5 className="mb-3">🧠 AI Extracted Marks</h5>

            <div className="table-responsive">
              <table className="table table-bordered text-center">
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Student Name</th>
                    <th>Marks</th>
                  </tr>
                </thead>
                <tbody>
                  {marks.map((m, index) => (
                    <tr key={index}>
                      <td>{m.roll}</td>
                      <td>{m.name}</td>
                      <td>{m.marks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              className="btn btn-success w-100 mt-3"
              onClick={handleSubmitMarks}
            >
              Confirm & Publish Marks
            </button>
          </div>
        )}
      </div>

      {/* STYLES — EXACTLY AS YOU SENT */}
      <style>{`
        body {
          background: #f4f6fb;
          font-family: "Segoe UI", sans-serif;
        }

        .navbar {
          background: linear-gradient(90deg, #4b6cb7, #182848);
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 60px;
          z-index: 1000;
        }

        .navbar-brand {
          color: white;
          font-weight: bold;
        }

        .sidebar {
          position: fixed;
          top: 60px;
          width: 230px;
          height: calc(100vh - 60px);
          background: #182848;
          padding-top: 20px;
        }

        .sidebar a {
          display: block;
          color: #ddd;
          padding: 12px 20px;
          text-decoration: none;
        }

        .sidebar a.active,
        .sidebar a:hover {
          background: #4b6cb7;
          color: white;
          border-radius: 6px;
          margin: 0 10px;
        }

        .main-content {
          margin-left: 230px;
          margin-top: 60px;
          padding: 30px;
        }

        .card {
          border-radius: 14px;
          border: none;
          box-shadow: 0 8px 20px rgba(0,0,0,0.08);
        }

        .upload-box {
          border: 2px dashed #4b6cb7;
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          cursor: pointer;
          background: #f8f9ff;
        }

        .upload-box i {
          font-size: 30px;
          color: #4b6cb7;
        }
      `}</style>
    </>
  );
};

export default FacultyMarks;
