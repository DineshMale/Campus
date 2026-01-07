import { useState } from "react";
import { NavLink } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

export default function StudentExamSeating() {
  const [rollNo, setRollNo] = useState("");
  const [result, setResult] = useState(null);
  const [searched, setSearched] = useState(false);

  const checkSeating = async () => {
    if (!rollNo.trim()) {
      alert("Please enter roll number");
      return;
    }

    try {
      const snapshot = await getDocs(collection(db, "seating_records"));

      let found = null;

      // IMPORTANT: controlled loops so we can BREAK
      for (const doc of snapshot.docs) {
        const data = doc.data();

        if (!Array.isArray(data.seating)) continue;

        for (const seat of data.seating) {
          if (
            rollNo.trim() >= seat.from &&
            rollNo.trim() <= seat.to
          ) {
            found = {
              examName: data.examName,
              examDate: data.examDate,
              room: seat.room,
              rollFrom: seat.from,
              rollTo: seat.to,
            };
            break; // stop seating loop
          }
        }

        if (found) break; // stop exam loop
      }

      if (!found) {
        setResult(null);
        setSearched(true);
        return;
      }

      setResult(found);
      setSearched(true);

    } catch (error) {
      console.error(error);
      alert("Error fetching seating");
    }
  };

  return (
    <>
      <style>{`
        body {
          margin: 0;
          font-family: "Segoe UI", sans-serif;
          background-color: #f5f7fb;
        }

        .top-navbar {
          height: 64px;
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 30px;
          color: white;
          position: fixed;
          width: 100%;
          top: 0;
          z-index: 1000;
        }

        .sidebar {
          position: fixed;
          top: 64px;
          left: 0;
          width: 230px;
          height: 100%;
          background: #fff;
          padding-top: 20px;
          border-right: 1px solid #eee;
        }

        .sidebar a {
          display: block;
          padding: 12px 20px;
          color: #333;
          text-decoration: none;
          font-weight: 500;
        }

        .sidebar a.active {
          background: #f0ebff;
          color: #6f42c1;
        }

        .main-content {
          margin-left: 230px;
          padding: 100px 30px 30px;
        }

        .card-box {
          background: white;
          border-radius: 14px;
          padding: 30px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          max-width: 600px;
        }

        .result-card {
          background: #eef2ff;
          border-radius: 12px;
          padding: 20px;
          margin-top: 20px;
        }

        @media (max-width: 768px) {
          .sidebar {
            display: none;
          }
          .main-content {
            margin-left: 0;
            padding: 100px 20px;
          }
        }
      `}</style>

      {/* NAVBAR */}
      <div className="top-navbar">
        <span className="fw-bold">🧠 CampusBuddy</span>
        <span>Student</span>
      </div>

      {/* SIDEBAR */}
      <div className="sidebar">
        <NavLink to="/student-dashboard">Dashboard</NavLink>
        <NavLink to="/student-attendance">Attendance</NavLink>
        <NavLink to="/student-marks">Marks</NavLink>
        <NavLink to="/student-leave">Leave</NavLink>
        <NavLink to="/student-exam-seating" className="active">
          Exam Seating
        </NavLink>
        <a href="/login" className="text-danger">
          <i className="bi bi-box-arrow-right me-2"></i>Logout
        </a>
      </div>

      {/* MAIN */}
      <div className="main-content">
        <h3 className="mb-4">🪑 Exam Seating Allocation</h3>

        <div className="card-box">
          <label className="form-label">Enter Roll Number</label>
          <input
            type="text"
            className="form-control mb-3"
            placeholder="e.g. 23241A67D5"
            value={rollNo}
            onChange={(e) => setRollNo(e.target.value)}
          />

          <button className="btn btn-primary w-100" onClick={checkSeating}>
            Check Seating
          </button>

          {searched && !result && (
            <div className="result-card text-danger">
              ❌ Seating not found for this roll number
            </div>
          )}

          {result && (
            <div className="result-card">
              <h5>✅ Seating Details</h5>
              <p><strong>Exam:</strong> {result.examName}</p>
              <p><strong>Date:</strong> {result.examDate}</p>
              <p><strong>Classroom:</strong> {result.room}</p>
              <p>
                <strong>Roll Range:</strong>{" "}
                {result.rollFrom} – {result.rollTo}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
