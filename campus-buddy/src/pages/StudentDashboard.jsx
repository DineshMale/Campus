import { useEffect, useState } from "react";
import "../css/student_dashboard.css";
import { NavLink, useNavigate } from "react-router-dom";

export default function StudentDashboard() {
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [attendance, setAttendance] = useState(0);
  const [leavesUsed, setLeavesUsed] = useState(0);
  const [internalAvg, setInternalAvg] = useState(0);
  const [notifications, setNotifications] = useState(0);

  // 🔐 AUTH CHECK
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("campusUser"));

    if (!user || user.role !== "student") {
      navigate("/login");
      return;
    }

    setStudent(user);
    loadDashboardData(user.loginId); // loginId = roll number
  }, [navigate]);

  // 🔥 LOAD DASHBOARD DATA
  const loadDashboardData = async (roll) => {
    try {
      // ============================
      // 📊 ATTENDANCE % (BACKEND)
      // ============================
      const attRes = await fetch(
        `http://127.0.0.1:5000/student/attendance/${roll}`
      );
      const attData = await attRes.json();

      if (attData.length === 0) {
        setAttendance(0);
      } else {
        const total = attData.length;
        const present = attData.filter(a => a.status === "P").length;
        setAttendance(Math.round((present / total) * 100));
      }

      // ============================
      // 📄 LEAVES USED (Firestore)
      // ============================
      const leaveSnap = await fetchLeaves(roll);
      setLeavesUsed(leaveSnap);

      // ============================
      // 🧠 INTERNAL AVERAGE (Firestore)
      // ============================
      const marksAvg = await fetchMarksAvg(roll);
      setInternalAvg(marksAvg);

      // ============================
      // 🔔 NOTIFICATIONS (Firestore)
      // ============================
      const pendingLeaves = await fetchPendingLeaves(roll);
      setNotifications(pendingLeaves);

    } catch (err) {
      console.error("Dashboard load error:", err);
    }
  };

  // ===== MOCK HELPERS (KEEP YOUR EXISTING FIRESTORE LOGIC IF ANY) =====
  const fetchLeaves = async () => 0;
  const fetchMarksAvg = async () => 0;
  const fetchPendingLeaves = async () => 0;

  if (!student) return null;

  return (
    <>
      {/* NAVBAR */}
      <nav className="navbar navbar-expand-lg navbar-dark fixed-top dashboard-navbar">
        <div className="container-fluid">
          <span className="navbar-brand fw-bold"> 🧠 CampusBuddy </span>
          <div className="ms-auto text-white">
            <i className="bi bi-bell me-3"></i>
            <span className="fw-semibold">Student</span>
          </div>
        </div>
      </nav>

      {/* SIDEBAR */}
      <div className="sidebar">
        <NavLink to="/student-dashboard">Dashboard</NavLink>
        <NavLink to="/student-attendance">Attendance</NavLink>
        <NavLink to="/student-marks">Marks</NavLink>
        <NavLink to="/student-leave">Leave</NavLink>
        <NavLink to="/student-exam-seating">Exam Seating</NavLink>

        <button
          className="text-danger logout-btn"
          onClick={() => {
            localStorage.removeItem("campusUser");
            navigate("/login");
          }}
        >
          <i className="bi bi-box-arrow-right me-2"></i> Logout
        </button>

        {/* PROFILE */}
        <div className="sidebar-profile">
          <div className="profile-avatar">👤</div>
          <div className="profile-info">
            <div className="profile-name">{student.name}</div>
            <div className="profile-roll">{student.loginId}</div>
            <div className="profile-dept">{student.department}</div>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="content">
        <h2 className="mb-4">Welcome Back 👋</h2>

        {/* STATS */}
        <div className="row g-4">
          <div className="col-md-3">
            <div className="card stat-card">
              <h6>Attendance</h6>
              <h3>{attendance}%</h3>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card stat-card">
              <h6>Leaves Used</h6>
              <h3>{leavesUsed}</h3>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card stat-card">
              <h6>Internal Avg</h6>
              <h3>{internalAvg}%</h3>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card stat-card">
              <h6>Notifications</h6>
              <h3>{notifications}</h3>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
