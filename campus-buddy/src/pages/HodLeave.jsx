import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { NavLink } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
} from "firebase/firestore";

const HodLeave = () => {
  const user = JSON.parse(localStorage.getItem("campusUser"));
  const [leaves, setLeaves] = useState([]);

  // DO NOT LOGOUT / DO NOT REDIRECT
  if (!user || user.role !== "hod") {
    return null;
  }

  // FETCH PENDING LEAVES
  const fetchLeaves = async () => {
    const q = query(
      collection(db, "leaves"),
      where("status", "==", "Pending")
    );

    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    setLeaves(data);
  };

  // APPROVE / REJECT
  const handleAction = async (id, status) => {
    await updateDoc(doc(db, "leaves", id), { status });
    fetchLeaves();
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  return (
    <div style={{ fontFamily: '"Segoe UI", sans-serif', background: "#f4f6fb" }}>
      {/* NAVBAR */}
      <nav className="navbar px-4 d-flex align-items-center" style={navStyle}>
        <span className="navbar-brand text-white fw-bold">CampusBuddy | HOD</span>
      </nav>

      {/* SIDEBAR */}
      <div style={sidebarStyle}>
        <SidebarLink to="/hod-dashboard" icon="bi-speedometer2" label="Dashboard" />
        <SidebarLink to="/hod-leave" icon="bi-envelope-check" label="Leave Approvals" />
        <SidebarLink to="/hod-attendance" icon="bi-calendar-check" label="Attendance" />
        <SidebarLink to="/hod-marks" icon="bi-bar-chart-fill" label="Marks" />
        <SidebarLink to="/hod-seating" icon="bi-grid-3x3-gap" label="Exam Seating" />
        <SidebarLink to="/login" icon="bi-box-arrow-right" label="Logout" />

        {/* PROFILE */}
        <div
          className="mt-auto text-center text-white"
          style={{
            padding: "18px",
            borderTop: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          <i className="bi bi-person-circle" style={{ fontSize: "36px", color: "#9db4ff" }}></i>
          <div className="fw-bold mt-2">{user.name}</div>
          <div style={{ fontSize: "13px", opacity: 0.85 }}>{user.department}</div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main style={mainStyle}>
        <h3 className="mb-4">📨 Leave Approvals</h3>

        <div className="card p-4" style={cardStyle}>
          <h5 className="mb-3">📝 Pending Leave Requests</h5>

          <div className="table-responsive">
            <table className="table table-bordered text-center align-middle">
              <thead style={{ background: "#4b6cb7", color: "#fff" }}>
                <tr>
                  <th>Roll No</th>
                  <th>Name</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Reason</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {leaves.length === 0 ? (
                  <tr>
                    <td colSpan="6">No pending leave requests 🎉</td>
                  </tr>
                ) : (
                  leaves.map((l) => (
                    <tr key={l.id}>
                      <td>{l.studentLoginId}</td>
                      <td>{l.studentName}</td>
                      <td>{l.from}</td>
                      <td>{l.to}</td>
                      <td>{l.reason}</td>
                      <td>
                        <button
                          className="btn btn-success btn-sm me-2"
                          onClick={() => handleAction(l.id, "Approved")}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleAction(l.id, "Rejected")}
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HodLeave;

/* ===== STYLES (UNCHANGED) ===== */
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
