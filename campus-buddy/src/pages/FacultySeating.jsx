import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

import { db } from "../firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

const FacultySeating = () => {
  const [showSeating, setShowSeating] = useState(false);

  // REAL STATES
  const [examName, setExamName] = useState("");
  const [cls, setCls] = useState("");
  const [examDate, setExamDate] = useState("");
  const [totalStudents, setTotalStudents] = useState(0);
  const [rooms, setRooms] = useState("");
  const [capacity, setCapacity] = useState(0);

  const [generatedSeating, setGeneratedSeating] = useState([]);

  // GENERATE SEATING (LOGIC ONLY)
  const generateSeating = () => {
    const roomList = rooms.split(",").map(r => r.trim());
    let start = 1;

    const seating = roomList.map(room => {
      const from = `23241A67D${start}`;
      const to = `23241A67D${Math.min(start + capacity - 1, totalStudents)}`;
      start += capacity;
      return { room, from, to };
    });

    setGeneratedSeating(seating);
    setShowSeating(true);
  };

  // PUBLISH TO FIRESTORE
  const publishSeating = async () => {
    await addDoc(collection(db, "seating_records"), {
      examName,
      class: cls,
      examDate,
      totalStudents,
      rooms: rooms.split(",").map(r => r.trim()),
      roomCapacity: capacity,
      seating: generatedSeating,
      status: "published",
      createdAt: serverTimestamp(),
    });

    alert("Seating published successfully ✅");
  };

  return (
    <>
      {/* NAVBAR */}
      <nav className="navbar px-4">
        <span className="navbar-brand">CampusBuddy | Faculty</span>
        <div className="ms-auto d-flex align-items-center gap-4 text-white">
          <i className="bi bi-bell"></i>
          <i className="bi bi-person-circle"></i>
        </div>
      </nav>

      {/* SIDEBAR */}
      <div className="sidebar">
        <NavLink to="/faculty-dashboard">
          <i className="bi bi-speedometer2 me-2"></i>Dashboard
        </NavLink>

        <NavLink to="/faculty-attendance">
          <i className="bi bi-calendar-check me-2"></i>Attendance
        </NavLink>

        <NavLink to="/faculty-marks">
          <i className="bi bi-bar-chart-fill me-2"></i>Marks
        </NavLink>

        <NavLink
          to="/faculty-seating"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <i className="bi bi-grid-3x3-gap me-2"></i>Exam Seating
        </NavLink>

        <NavLink to="/login">
          <i className="bi bi-box-arrow-right me-2"></i>Logout
        </NavLink>
      </div>

      {/* MAIN CONTENT */}
      <div className="main-content">
        <h3 className="mb-4">🪑 Exam Seating Arrangement</h3>

        {/* INPUT CARD */}
        <div className="card p-4 mb-4">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label">Exam Name</label>
              <input
                className="form-control"
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">Class</label>
              <input
                className="form-control"
                value={cls}
                onChange={(e) => setCls(e.target.value)}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">Exam Date</label>
              <input
                type="date"
                className="form-control"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">Total Students</label>
              <input
                type="number"
                className="form-control"
                value={totalStudents}
                onChange={(e) => setTotalStudents(Number(e.target.value))}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Available Rooms</label>
              <input
                className="form-control"
                value={rooms}
                onChange={(e) => setRooms(e.target.value)}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Room Capacity</label>
              <input
                type="number"
                className="form-control"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Seating Pattern</label>
              <select className="form-select">
                <option>Alternate Seating</option>
                <option>Continuous Seating</option>
              </select>
            </div>
          </div>

          <button
            className="btn btn-primary w-100 mt-4"
            onClick={generateSeating}
          >
            Generate Seating Arrangement
          </button>
        </div>

        {/* OUTPUT */}
        {showSeating && (
          <div className="card p-4">
            <h5 className="mb-3">📋 Generated Seating</h5>

            <div className="table-responsive">
              <table className="table table-bordered text-center">
                <thead>
                  <tr>
                    <th>Room</th>
                    <th>Roll No From</th>
                    <th>Roll No To</th>
                  </tr>
                </thead>
                <tbody>
                  {generatedSeating.map((s, i) => (
                    <tr key={i}>
                      <td>{s.room}</td>
                      <td>{s.from}</td>
                      <td>{s.to}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              className="btn btn-success w-100 mt-3"
              onClick={publishSeating}
            >
              Confirm & Publish Seating
            </button>
          </div>
        )}
      </div>

      {/* ORIGINAL STYLES (UNCHANGED) */}
      <style>{`
        body {
          background: #f4f6fb;
          font-family: "Segoe UI", sans-serif;
        }
        .navbar {
          background: linear-gradient(90deg, #4b6cb7, #182848);
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 60px;
          z-index: 1000;
        }
        .navbar-brand {
          color: white;
          font-weight: bold;
        }
        .sidebar {
          position: fixed;
          top: 60px;
          width: 230px;
          height: calc(100vh - 60px);
          background: #182848;
          padding-top: 20px;
        }
        .sidebar a {
          display: block;
          color: #ddd;
          padding: 12px 20px;
          text-decoration: none;
        }
        .sidebar a.active,
        .sidebar a:hover {
          background: #4b6cb7;
          color: white;
          border-radius: 6px;
          margin: 0 10px;
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
    </>
  );
};

export default FacultySeating;
