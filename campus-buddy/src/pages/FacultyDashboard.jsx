import { useEffect } from "react";               // ✅ MISSING IMPORT (FIX)
import "../css/faculty_dashboard.css";
import { NavLink, useNavigate } from "react-router-dom";

const FacultyDashboard = () => {
  const navigate = useNavigate();

  // 🔐 Role protection (correct way)
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("campusUser"));

    if (!user || user.role !== "faculty") {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <>
      {/* NAVBAR */}
      <nav className="navbar faculty-navbar px-4">
        <span className="navbar-brand text-white fw-bold">
          CampusBuddy | Faculty
        </span>

        <div className="ms-auto d-flex align-items-center gap-4 text-white">
          <i className="bi bi-bell"></i>
          <i className="bi bi-person-circle"></i>
        </div>
      </nav>

      {/* SIDEBAR */}
      <div className="faculty-sidebar">
        <NavLink to="/faculty-dashboard" className="nav-link">
          <i className="bi bi-speedometer2 me-2"></i> Dashboard
        </NavLink>

        <NavLink to="/faculty-attendance" className="nav-link">
          <i className="bi bi-calendar-check me-2"></i> Attendance
        </NavLink>

        <NavLink to="/faculty-marks" className="nav-link">
          <i className="bi bi-bar-chart-fill me-2"></i> Marks
        </NavLink>

        <NavLink to="/faculty-seating" className="nav-link">
          <i className="bi bi-grid-3x3-gap me-2"></i> Exam Seating
        </NavLink>

        {/* LOGOUT (better handling) */}
        <button
          className="nav-link logout"
          onClick={() => {
            localStorage.removeItem("campusUser");
            navigate("/login");
          }}
        >
          <i className="bi bi-box-arrow-right me-2"></i> Logout
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="faculty-main">
        <h3 className="mb-4">Welcome, Faculty 👩‍🏫</h3>

        <div className="row g-4">
          <div className="col-md-4 d-flex">
            <div className="card dashboard-card p-4 text-center w-100">
              <i className="bi bi-calendar-check"></i>
              <h5 className="mt-3">Manage Attendance</h5>
              <p className="text-muted">
                Take attendance manually or via image
              </p>
              <button
                className="btn btn-primary mt-3"
                onClick={() => navigate("/faculty-attendance")}
              >
                Go
              </button>
            </div>
          </div>

          <div className="col-md-4 d-flex">
            <div className="card dashboard-card p-4 text-center w-100">
              <i className="bi bi-bar-chart-fill"></i>
              <h5 className="mt-3">Upload Marks</h5>
              <p className="text-muted">
                Upload internal or mid-term marks
              </p>
              <button
                className="btn btn-primary mt-3"
                onClick={() => navigate("/faculty-marks")}
              >
                Go
              </button>
            </div>
          </div>

          <div className="col-md-4 d-flex">
            <div className="card dashboard-card p-4 text-center w-100">
              <i className="bi bi-grid-3x3-gap"></i>
              <h5 className="mt-3">Exam Seating</h5>
              <p className="text-muted">
                Generate seating arrangement
              </p>
              <button
                className="btn btn-primary mt-3"
                onClick={() => navigate("/faculty-seating")}
              >
                Go
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FacultyDashboard;
