import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

export default function StudentLeave() {
  const user = JSON.parse(localStorage.getItem("campusUser"));

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [leaves, setLeaves] = useState([]);

  if (!user || !user.loginId) {
    return null; // DO NOT LOGOUT, DO NOT REDIRECT
  }

  const fetchLeaves = async () => {
    const q = query(
      collection(db, "leaves"),
      where("studentLoginId", "==", user.loginId)
    );
    const snap = await getDocs(q);
    setLeaves(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const submitLeave = async () => {
    if (!from || !to || !reason) return;

    await addDoc(collection(db, "leaves"), {
      studentLoginId: user.loginId,
      studentName: user.name,
      department: user.department,
      from,
      to,
      reason,
      notes,
      status: "Pending",
      createdAt: serverTimestamp(),
    });

    setFrom("");
    setTo("");
    setReason("");
    setNotes("");

    fetchLeaves();
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  return (
    <>
      {/* INLINE CSS – ORIGINAL */}
      <style>{`
        body {
          background: #f4f6fb;
          font-family: "Segoe UI", sans-serif;
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

        .sidebar a:hover,
        .sidebar a.active {
          background: #f0ebff;
          color: #6f42c1;
          border-left: 4px solid #6f42c1;
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
      `}</style>

      {/* NAVBAR – ORIGINAL */}
      <div className="top-navbar">
        <span>🧠 CampusBuddy</span>
        <span>Student</span>
      </div>

      {/* SIDEBAR – ORIGINAL */}
      <div className="sidebar">
        <a href="/student-dashboard">Dashboard</a>
        <a href="/student-attendance">Attendance</a>
        <a href="/student-marks">Marks</a>
        <a className="active" href="/student-leave">Leave</a>
        <a href="/student-exam-seating">Exam Seating</a>
        <a href="/login" className="text-danger">
          <i className="bi bi-box-arrow-right me-2"></i>Logout
        </a>
      </div>

      {/* MAIN CONTENT – ORIGINAL */}
      <div className="main-content">
        <div className="card p-4 mb-4">
          <h4>📩 Apply for Leave</h4>

          <div className="row mb-3">
            <div className="col">
              <label>From</label>
              <input type="date" className="form-control" value={from} onChange={e => setFrom(e.target.value)} />
            </div>
            <div className="col">
              <label>To</label>
              <input type="date" className="form-control" value={to} onChange={e => setTo(e.target.value)} />
            </div>
          </div>

          <div className="mb-3">
            <label>Reason</label>
            <select className="form-control" value={reason} onChange={e => setReason(e.target.value)}>
              <option>Select</option>
              <option>Medical</option>
              <option>Personal</option>
              <option>Emergency</option>
            </select>
          </div>

          <div className="mb-3">
            <label>Notes</label>
            <textarea className="form-control" value={notes} onChange={e => setNotes(e.target.value)} />
          </div>

          <button className="btn btn-primary" type="button" onClick={submitLeave}>
            Submit Leave
          </button>
        </div>

        <div className="card p-4">
          <h4>📜 My Leave History</h4>

          <table className="table table-bordered text-center">
            <thead className="table-dark">
              <tr>
                <th>From</th>
                <th>To</th>
                <th>Reason</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {leaves.length === 0 ? (
                <tr><td colSpan="4">No leave records</td></tr>
              ) : (
                leaves.map(l => (
                  <tr key={l.id}>
                    <td>{l.from}</td>
                    <td>{l.to}</td>
                    <td>{l.reason}</td>
                    <td>{l.status}</td>
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
