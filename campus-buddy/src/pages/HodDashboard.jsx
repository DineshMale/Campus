import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useNavigate } from "react-router-dom";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc
} from "firebase/firestore";
import { db } from "../firebase";

const HodDashboard = () => {
  const navigate = useNavigate();

  const [hod, setHod] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [avgAttendance, setAvgAttendance] = useState(0);
  const [recentActivity, setRecentActivity] = useState(0);

  // 🔐 AUTH + LOAD
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("campusUser"));

    if (!user || user.role !== "hod") {
      navigate("/login");
      return;
    }

    setHod(user);
    loadDashboardData(user.department || null);
  }, [navigate]);

  // 🔥 LOAD DASHBOARD DATA
  const loadDashboardData = async (department) => {
    try {
      /* ======================
         📝 PENDING LEAVES
      ====================== */
      let leaveList = [];

      if (department) {
        const leaveSnap = await getDocs(
          query(
            collection(db, "leaveRequests"),
            where("status", "==", "pending"),
            where("department", "==", department)
          )
        );

        leaveList = leaveSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
      }

      setLeaves(leaveList);

      /* ======================
         👨‍🎓 TOTAL STUDENTS (FIXED)
      ====================== */
      let studentCount = 0;

      const studentSnap = await getDocs(
        query(collection(db, "USERS"), where("role", "==", "student"))
      );

      studentSnap.forEach((doc) => {
        const s = doc.data();
        if (!department || s.department === department) {
          studentCount++;
        }
      });

      setTotalStudents(studentCount);

      /* ======================
         📊 AVG ATTENDANCE (FIXED)
      ====================== */
      const attendanceSnap = await getDocs(
        collection(db, "attendance_records")
      );

      let present = 0;
      let total = 0;

      attendanceSnap.forEach((doc) => {
        const records = doc.data().records || {};
        Object.values(records).forEach((r) => {
          total++;
          if (r.status === "P") present++;
        });
      });

      setAvgAttendance(total ? Math.round((present / total) * 100) : 0);

      /* ======================
         ⏱ RECENT ACTIVITY
      ====================== */
      let activityCount = 0;

      if (department) {
        const activitySnap = await getDocs(
          query(
            collection(db, "leaveRequests"),
            where("department", "==", department)
          )
        );
        activityCount = activitySnap.size;
      }

      setRecentActivity(activityCount);

    } catch (err) {
      console.error("HOD dashboard error:", err);
    }
  };

  /* ======================
     ✅ APPROVE / REJECT LEAVE
  ====================== */
  const updateLeaveStatus = async (id, status) => {
    try {
      await updateDoc(doc(db, "leaveRequests", id), { status });
      setLeaves(leaves.filter((l) => l.id !== id));
    } catch (err) {
      console.error("Leave update failed:", err);
    }
  };

  if (!hod) return null;

  return (
    <div style={{ fontFamily: '"Segoe UI", sans-serif', background: "#f4f6fb" }}>
      {/* NAVBAR */}
      <nav
        className="navbar px-4 d-flex align-items-center"
        style={{
          background: "linear-gradient(90deg, #4b6cb7, #182848)",
          position: "fixed",
          top: 0,
          width: "100%",
          height: "60px",
          zIndex: 1000,
        }}
      >
        <span className="navbar-brand text-white fw-bold">
          CampusBuddy | HOD
        </span>
      </nav>

      {/* SIDEBAR */}
      <div
        className="sidebar d-flex flex-column"
        style={{
          position: "fixed",
          top: "60px",
          width: "230px",
          height: "calc(100vh - 60px)",
          background: "#182848",
          paddingTop: "20px",
        }}
      >
        {[
          ["Dashboard", "bi-speedometer2", "/hod-dashboard"],
          ["Leave Approvals", "bi-envelope-check", "/hod-leave"],
          ["Attendance", "bi-calendar-check", "/hod-attendance"],
          ["Marks", "bi-bar-chart-fill", "/hod-marks"],
          ["Exam Seating", "bi-grid-3x3-gap", "/hod-seating"],
        ].map(([name, icon, path], i) => (
          <a
            key={i}
            href={path}
            className="text-decoration-none px-3 py-2"
            style={{ color: "#ddd", margin: "0 10px", borderRadius: "6px" }}
          >
            <i className={`bi ${icon} me-2`}></i> {name}
          </a>
        ))}

        <button
          className="text-danger mt-auto px-3 py-2"
          onClick={() => {
            localStorage.removeItem("campusUser");
            navigate("/login");
          }}
        >
          <i className="bi bi-box-arrow-right me-2"></i> Logout
        </button>

        {/* PROFILE */}
        <div
          className="text-center text-white"
          style={{
            padding: "18px",
            borderTop: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          <i
            className="bi bi-person-circle"
            style={{ fontSize: "36px", color: "#9db4ff" }}
          ></i>
          <div>{hod.name}</div>
          <div>{hod.loginId}</div>
          <div>{hod.department} Department</div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ marginLeft: "230px", marginTop: "60px", padding: "30px" }}>
        <h3 className="mb-4">👋 Welcome, HOD</h3>

        {/* SUMMARY CARDS */}
        <div className="row g-4 mb-4">
          {[
            ["Pending Leaves", leaves.length],
            ["Total Students", totalStudents],
            ["Avg Attendance", `${avgAttendance}%`],
            ["Recent Activity", recentActivity],
          ].map(([title, value], i) => (
            <div key={i} className="col-md-3">
              <div className="card p-3 text-center">
                <h6>{title}</h6>
                <h4 className="fw-bold">{value}</h4>
              </div>
            </div>
          ))}
        </div>

        {/* LEAVE TABLE */}
        <div className="card p-4">
          <h5 className="mb-3">📝 Recent Leave Requests</h5>
          <table className="table table-bordered text-center">
            <thead>
              <tr>
                <th>Roll No</th>
                <th>From</th>
                <th>To</th>
                <th>Reason</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {leaves.length === 0 ? (
                <tr>
                  <td colSpan={5}>No pending leaves 🎉</td>
                </tr>
              ) : (
                leaves.map((l) => (
                  <tr key={l.id}>
                    <td>{l.loginId}</td>
                    <td>{l.from}</td>
                    <td>{l.to}</td>
                    <td>{l.reason}</td>
                    <td>
                      <button
                        className="btn btn-success btn-sm me-2"
                        onClick={() => updateLeaveStatus(l.id, "approved")}
                      >
                        Approve
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => updateLeaveStatus(l.id, "rejected")}
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
    </div>
  );
};

export default HodDashboard;
