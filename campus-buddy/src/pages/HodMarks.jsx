import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { NavLink, useNavigate } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";

const HodMarks = () => {
  const navigate = useNavigate();

  const [hod, setHod] = useState(null);
  const [summary, setSummary] = useState({
    evaluated: 0,
    avg: 0,
    below40: 0,
    top: 0,
  });
  const [classWise, setClassWise] = useState([]);
  const [lowPerformers, setLowPerformers] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("campusUser"));

    if (!user || user.role !== "hod") {
      navigate("/login");
      return;
    }

    setHod(user);
    loadMarksData(user.department || null);
  }, [navigate]);

  const loadMarksData = async (department) => {
    try {
      /* =========================
         👨‍🎓 LOAD STUDENTS (for dept filter)
      ========================= */
      const studentSnap = await getDocs(
        query(collection(db, "USERS"), where("role", "==", "student"))
      );

      const studentDept = {};
      studentSnap.forEach((doc) => {
        const s = doc.data();
        if (!department || s.department === department) {
          studentDept[s.loginId] = {
            name: s.name,
            class: s.class || "Unknown",
          };
        }
      });

      /* =========================
         📊 LOAD MARKS
      ========================= */
      const marksSnap = await getDocs(collection(db, "marks_records"));

      let total = 0;
      let sum = 0;
      let below40 = 0;
      let top = 0;

      const classMap = {};
      const lowList = [];

      marksSnap.forEach((doc) => {
        const d = doc.data();
        const max = Number(d.maxMarks || 100);

        (d.marks || []).forEach((m) => {
          if (!studentDept[m.roll]) return;

          const percent = Math.round((Number(m.marks) / max) * 100);
          total++;
          sum += percent;

          const cls = studentDept[m.roll].class;

          if (!classMap[cls]) {
            classMap[cls] = { sum: 0, count: 0, exam: d.examType };
          }

          classMap[cls].sum += percent;
          classMap[cls].count++;

          if (percent < 40) {
            below40++;
            lowList.push({
              roll: m.roll,
              name: m.name,
              className: cls,
              marks: percent,
            });
          }

          if (percent >= 85) top++;
        });
      });

      setSummary({
        evaluated: total,
        avg: total ? Math.round(sum / total) : 0,
        below40,
        top,
      });

      setLowPerformers(lowList);

      setClassWise(
        Object.entries(classMap).map(([cls, val]) => {
          const avg = Math.round(val.sum / val.count);
          return {
            className: cls,
            exam: val.exam,
            avg,
            color:
              avg >= 75 ? "bg-success" : avg >= 60 ? "bg-warning" : "bg-danger",
          };
        })
      );
    } catch (err) {
      console.error("Marks load failed:", err);
    }
  };

  if (!hod) return null;

  const summaryCards = [
    { icon: "bi-people", title: "Students Evaluated", value: summary.evaluated },
    {
      icon: "bi-graph-up-arrow",
      title: "Class Average",
      value: `${summary.avg}%`,
      color: "text-success",
    },
    {
      icon: "bi-emoji-frown",
      title: "Below 40%",
      value: summary.below40,
      color: "text-danger",
    },
    {
      icon: "bi-award",
      title: "Top Performers",
      value: summary.top,
      color: "text-primary",
    },
  ];

  return (
    <div style={{ fontFamily: '"Segoe UI", sans-serif', background: "#f4f6fb" }}>
      {/* NAVBAR */}
      <nav className="navbar px-4 d-flex align-items-center" style={navStyle}>
        <span className="navbar-brand text-white fw-bold">
          CampusBuddy | HOD
        </span>
      </nav>

      {/* SIDEBAR */}
      <div style={sidebarStyle}>
        <SidebarLink to="/hod-dashboard" icon="bi-speedometer2" label="Dashboard" />
        <SidebarLink to="/hod-leave" icon="bi-envelope-check" label="Leave Approvals" />
        <SidebarLink to="/hod-attendance" icon="bi-calendar-check" label="Attendance" />
        <SidebarLink to="/hod-marks" icon="bi-bar-chart-fill" label="Marks" />
        <SidebarLink to="/hod-seating" icon="bi-grid-3x3-gap" label="Exam Seating" />
        <SidebarLink to="/login" icon="bi-box-arrow-right" label="Logout" />

        <div className="mt-auto text-center text-white" style={{ padding: 18 }}>
          <i className="bi bi-person-circle" style={{ fontSize: 36 }}></i>
          <div className="fw-bold">{hod.name}</div>
          <div>{hod.loginId}</div>
          <div>{hod.department} Department</div>
        </div>
      </div>

      {/* MAIN */}
      <main style={mainStyle}>
        <h3 className="mb-4">📈 Marks Analytics</h3>

        {/* SUMMARY */}
        <div className="row g-4 mb-4">
          {summaryCards.map((c, i) => (
            <div key={i} className="col-md-3">
              <div className="card text-center p-3" style={cardStyle}>
                <i className={`bi ${c.icon}`} style={{ fontSize: 32 }}></i>
                <h6 className="mt-2">{c.title}</h6>
                <h4 className={`fw-bold ${c.color || ""}`}>{c.value}</h4>
              </div>
            </div>
          ))}
        </div>

        {/* CLASS WISE */}
        <div className="card p-4 mb-4" style={cardStyle}>
          <h5>🏫 Class-wise Performance</h5>
          <table className="table table-bordered text-center mt-3">
            <thead style={{ background: "#4b6cb7", color: "#fff" }}>
              <tr>
                <th>Class</th>
                <th>Exam</th>
                <th>Avg %</th>
                <th>Performance</th>
              </tr>
            </thead>
            <tbody>
              {classWise.map((c, i) => (
                <tr key={i}>
                  <td>{c.className}</td>
                  <td>{c.exam}</td>
                  <td>{c.avg}%</td>
                  <td>
                    <div className="progress">
                      <div
                        className={`progress-bar ${c.color}`}
                        style={{ width: `${c.avg}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* LOW PERFORMERS */}
        <div className="card p-4" style={cardStyle}>
          <h5>🚨 Students Below 40%</h5>
          <table className="table table-bordered text-center mt-3">
            <thead style={{ background: "#4b6cb7", color: "#fff" }}>
              <tr>
                <th>Roll No</th>
                <th>Name</th>
                <th>Class</th>
                <th>Marks</th>
              </tr>
            </thead>
            <tbody>
              {lowPerformers.map((s, i) => (
                <tr key={i}>
                  <td>{s.roll}</td>
                  <td>{s.name}</td>
                  <td>{s.className}</td>
                  <td className="text-danger fw-bold">{s.marks}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default HodMarks;

/* ===== STYLES ===== */
const navStyle = {
  background: "linear-gradient(90deg,#4b6cb7,#182848)",
  position: "fixed",
  top: 0,
  width: "100%",
  height: "60px",
  zIndex: 1000,
};

const sidebarStyle = {
  position: "fixed",
  top: "60px",
  width: "230px",
  height: "calc(100vh - 60px)",
  background: "#182848",
  paddingTop: "20px",
  display: "flex",
  flexDirection: "column",
};

const mainStyle = {
  marginLeft: "230px",
  marginTop: "60px",
  padding: "30px",
};

const cardStyle = {
  borderRadius: "14px",
  boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
};

const SidebarLink = ({ to, icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `text-decoration-none px-3 py-2 mx-2 rounded ${
        isActive ? "bg-primary text-white" : "text-light"
      }`
    }
  >
    <i className={`bi ${icon} me-2`} />
    {label}
  </NavLink>
);
