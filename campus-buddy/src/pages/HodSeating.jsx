import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { NavLink, useNavigate } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";

const HodSeating = () => {
  const navigate = useNavigate();
  const [hod, setHod] = useState(null);
  const [exams, setExams] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    completed: 0,
    pending: 0,
  });

  // 🔐 AUTH + LOAD DATA
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("campusUser"));

    if (!user || user.role !== "hod") {
      navigate("/login");
      return;
    }

    setHod(user);
    loadSeating(user.department);
  }, [navigate]);

  // 🔥 LOAD SEATING DATA
  const loadSeating = async (department) => {
    try {
      const snap = await getDocs(
        query(
          collection(db, "seating_records"),
          where("department", "==", department)
        )
      );

      let completed = 0;
      let pending = 0;
      const rows = [];

      snap.forEach((doc) => {
        const d = doc.data();

        if (d.status === "completed") completed++;
        else pending++;

        rows.push({
          exam: d.exam,
          cls: d.class,
          date: d.date,
          rooms: d.rooms?.join(", ") || "—",
          status: d.status === "completed" ? "Completed" : "Pending",
        });
      });

      setExams(rows);
      setSummary({
        total: rows.length,
        completed,
        pending,
      });
    } catch (err) {
      console.error("Seating load failed:", err);
    }
  };

  if (!hod) return null;

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
        <SidebarLink to="/hod-attendance" icon="bi-calendar-check" label="Attendance Analytics" />
        <SidebarLink to="/hod-marks" icon="bi-bar-chart-fill" label="Marks Analytics" />
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
      <div style={mainStyle}>
        <h3 className="mb-4">🪑 Exam Seating Status</h3>

        {/* SUMMARY */}
        <div className="row g-4 mb-4">
          <SummaryCard title="Total Exams" value={summary.total} />
          <SummaryCard title="Seating Completed" value={summary.completed} color="text-success" />
          <SummaryCard title="Pending" value={summary.pending} color="text-warning" />
        </div>

        {/* TABLE */}
        <div className="card p-4" style={cardStyle}>
          <h5 className="mb-3">📋 Exam Seating Overview</h5>
          <table className="table table-bordered text-center">
            <thead style={{ background: "#4b6cb7", color: "white" }}>
              <tr>
                <th>Exam</th>
                <th>Class</th>
                <th>Date</th>
                <th>Rooms Used</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {exams.length === 0 ? (
                <tr>
                  <td colSpan="5">No seating records found</td>
                </tr>
              ) : (
                exams.map((e, i) => (
                  <tr key={i}>
                    <td>{e.exam}</td>
                    <td>{e.cls}</td>
                    <td>{e.date}</td>
                    <td>{e.rooms}</td>
                    <td>
                      <span
                        style={{
                          padding: "6px 12px",
                          borderRadius: "20px",
                          background: e.status === "Completed" ? "#d4edda" : "#fff3cd",
                          color: e.status === "Completed" ? "#155724" : "#856404",
                          fontWeight: 600,
                        }}
                      >
                        {e.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HodSeating;

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

const SummaryCard = ({ title, value, color }) => (
  <div className="col-md-4">
    <div className="card p-3 text-center" style={cardStyle}>
      <h6>{title}</h6>
      <h3 className={`fw-bold ${color || ""}`}>{value}</h3>
    </div>
  </div>
);
