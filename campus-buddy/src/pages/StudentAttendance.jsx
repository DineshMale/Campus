import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

export default function StudentAttendance() {
  const [attendance, setAttendance] = useState([]);
  const [overall, setOverall] = useState(0);

  useEffect(() => {
    const fetchAttendance = async () => {
      // 🔴 TEMP: use roll number
      // Later this should come from login/profile
      const roll = "23241A67G6";

      try {
        const res = await fetch(
          `http://127.0.0.1:5000/student/attendance/${roll}`
        );
        const data = await res.json();

        console.log("✅ Student attendance:", data);
        setAttendance(data);

        // calculate overall %
        if (data.length === 0) {
          setOverall(0);
          return;
        }

        const total = data.length;
        const present = data.filter(d => d.status === "P").length;
        setOverall(Math.round((present / total) * 100));
      } catch (err) {
        console.error("Attendance fetch error:", err);
      }
    };

    fetchAttendance();
  }, []);

  return (
    <>
      {/* STYLES — UNCHANGED */}
      <style>{`
        body {
          margin: 0;
          font-family: "Segoe UI", sans-serif;
          background: #f5f7fb;
        }
        .navbar-custom {
          height: 60px;
          background: linear-gradient(135deg, #6f42c1, #4c6ef5);
          color: white;
          padding: 0 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: fixed;
          width: 100%;
          top: 0;
          z-index: 1000;
        }
        .sidebar {
          position: fixed;
          top: 60px;
          left: 0;
          width: 230px;
          height: calc(100vh - 60px);
          background: white;
          padding-top: 20px;
          box-shadow: 2px 0 10px rgba(0,0,0,0.05);
        }
        .sidebar a {
          display: block;
          padding: 12px 20px;
          color: #333;
          text-decoration: none;
          font-weight: 500;
        }
        .sidebar a.active,
        .sidebar a:hover {
          background: #eef2ff;
          color: #4c6ef5;
          border-left: 4px solid #4c6ef5;
        }
        .content {
          margin-left: 230px;
          padding: 90px 30px 30px;
        }
        .summary-card {
          background: white;
          border-radius: 16px;
          padding: 25px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.08);
          text-align: center;
        }
        .summary-card h3 {
          color: #4c6ef5;
          font-size: 36px;
          margin-bottom: 10px;
        }
        table {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 25px rgba(0,0,0,0.08);
        }
        th {
          background: #f1f3ff;
        }
      `}</style>

      {/* NAVBAR */}
      <div className="navbar-custom">
        <span>🧠 CampusBuddy</span>
        <div>
          <i className="bi bi-bell me-3"></i>
          <span className="fw-semibold">Student</span>
        </div>
      </div>

      {/* SIDEBAR */}
      <div className="sidebar">
        <Link to="/student-dashboard">Dashboard</Link>
        <Link to="/student-attendance" className="active">Attendance</Link>
        <Link to="/student-marks">Marks</Link>
        <Link to="/student-leave">Leave</Link>
        <Link to="/student-exam-seating">Exam Seating</Link>
        <Link to="/login" className="text-danger">
          <i className="bi bi-box-arrow-right me-2"></i>Logout
        </Link>
      </div>

      {/* CONTENT */}
      <div className="content">
        <h2>Attendance Overview</h2>

        <div className="row mb-4">
          <div className="col-md-4">
            <div className="summary-card">
              <h3>{overall}%</h3>
              <p>Overall Attendance</p>
            </div>
          </div>
        </div>

        <table className="table table-borderless mt-4">
          <thead>
            <tr>
              <th>Date</th>
              <th>Subject</th>
              <th>Period</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {attendance.map((a, i) => (
              <tr key={i}>
                <td>{a.date}</td>
                <td>{a.subject}</td>
                <td>{a.period}</td>
                <td
                  className={`fw-bold ${
                    a.status === "P" ? "text-success" : "text-danger"
                  }`}
                >
                  {a.status === "P" ? "Present" : "Absent"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
