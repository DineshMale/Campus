import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

export default function StudentMarks() {
  const [marks, setMarks] = useState([]);
  const [avg, setAvg] = useState(0);
  const [result, setResult] = useState("PASS");

  useEffect(() => {
    const fetchMarks = async () => {
      try {
        const rawUser = localStorage.getItem("campusUser");
        if (!rawUser) {
          console.log("❌ No campusUser");
          return;
        }

        const user = JSON.parse(rawUser);
        const roll = user.roll;

        console.log("✅ Roll used:", roll);

        if (!roll) {
          console.log("❌ Roll missing");
          return;
        }

        const res = await fetch(
          `http://127.0.0.1:5000/student/marks/${roll}`
        );

        const data = await res.json();

        console.log("✅ Marks API data:", data);

        let formatted = [];
        let totalSum = 0;
        let hasFail = false;

        data.forEach((d) => {
          const obtained = Number(d.marks);
          const max = Number(d.maxMarks);
          const percentage = Math.round((obtained / max) * 100);

          if (percentage < 40) hasFail = true;
          totalSum += percentage;

          formatted.push({
            subject: d.subject,
            internal: "-",          // old column, kept for UI
            midterm: d.examType,    // exam name
            endsem: obtained,       // marks obtained
            total: percentage,      // percentage
            status: percentage >= 40 ? "Pass" : "Fail",
          });
        });

        console.log("✅ Formatted marks:", formatted);

        setMarks(formatted);

        if (formatted.length > 0) {
          setAvg(Math.round(totalSum / formatted.length));
          setResult(hasFail ? "FAIL" : "PASS");
        } else {
          setAvg(0);
          setResult("PASS");
        }
      } catch (err) {
        console.error("❌ Error fetching marks:", err);
      }
    };

    fetchMarks();
  }, []);

  return (
    <>
      <style>{`
        body {
          margin: 0;
          font-family: "Segoe UI", sans-serif;
          background-color: #f5f7fb;
        }
        .top-navbar {
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
        .sidebar a.active,
        .sidebar a:hover {
          background: #f0ebff;
          color: #6f42c1;
        }
        .main-content {
          margin-left: 230px;
          padding: 100px 30px 30px;
        }
        .summary-card {
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          color: white;
          border-radius: 14px;
          padding: 20px;
        }
        .card-box {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .badge-pass {
          background-color: #d1fae5;
          color: #065f46;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 13px;
        }
        .badge-fail {
          background-color: #fee2e2;
          color: #991b1b;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 13px;
        }
      `}</style>

      <div className="top-navbar">
        <span>🧠 CampusBuddy</span>
        <div>
          <span className="fw-semibold">Student</span>
        </div>
      </div>

      <div className="sidebar">
        <Link to="/student-dashboard">Dashboard</Link>
        <Link to="/student-attendance">Attendance</Link>
        <Link to="/student-marks" className="active">Marks</Link>
        <Link to="/login" className="text-danger">Logout</Link>
      </div>

      <div className="main-content">
        <h3 className="mb-4">📊 Marks Overview</h3>

        <div className="row mb-4">
          <div className="col-md-4">
            <div className="summary-card">
              <p>Total Subjects</p>
              <h4>{marks.length}</h4>
            </div>
          </div>
          <div className="col-md-4">
            <div className="summary-card">
              <p>Average Percentage</p>
              <h4>{avg}%</h4>
            </div>
          </div>
          <div className="col-md-4">
            <div className="summary-card">
              <p>Result Status</p>
              <h4>{result}</h4>
            </div>
          </div>
        </div>

        <div className="card-box">
          <h5 className="mb-3">Subject-wise Marks</h5>

          <table className="table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Internal</th>
                <th>Midterm</th>
                <th>End Sem</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {marks.length === 0 ? (
                <tr>
                  <td colSpan="6">No marks published yet</td>
                </tr>
              ) : (
                marks.map((m, i) => (
                  <tr key={i}>
                    <td>{m.subject}</td>
                    <td>{m.internal}</td>
                    <td>{m.midterm}</td>
                    <td>{m.endsem}</td>
                    <td>{m.total}%</td>
                    <td>
                      {m.status === "Pass" ? (
                        <span className="badge-pass">Pass</span>
                      ) : (
                        <span className="badge-fail">Fail</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
