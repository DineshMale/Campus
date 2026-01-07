import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";

const HodAttendance = () => {
  const navigate = useNavigate();

  const [hod, setHod] = useState(null);
  const [totalStudents, setTotalStudents] = useState(0);
  const [avgAttendance, setAvgAttendance] = useState(0);
  const [lowCount, setLowCount] = useState(0);
  const [classes, setClasses] = useState([]);
  const [lowAttendance, setLowAttendance] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("campusUser"));

    if (!user || user.role !== "hod") {
      navigate("/login");
      return;
    }

    setHod(user);
    loadAttendanceData(user.department || null);
  }, [navigate]);

  const loadAttendanceData = async (department) => {
    try {
      /* =========================
         👨‍🎓 LOAD STUDENTS
      ========================= */
      const studentSnap = await getDocs(
        query(collection(db, "USERS"), where("role", "==", "student"))
      );

      const students = {};
      studentSnap.forEach((doc) => {
        const s = doc.data();
        if (!department || s.department === department) {
          students[s.loginId] = {
            roll: s.loginId,
            name: s.name,
            class: s.class || "Unknown",
            present: 0,
            total: 0,
          };
        }
      });

      setTotalStudents(Object.keys(students).length);

      /* =========================
         📊 LOAD ATTENDANCE
      ========================= */
      const attendanceSnap = await getDocs(
        collection(db, "attendance_records")
      );

      attendanceSnap.forEach((doc) => {
        const records = doc.data().records || {};

        Object.entries(records).forEach(([roll, rec]) => {
          if (students[roll]) {
            students[roll].total++;
            if (rec.status === "P") {
              students[roll].present++;
            }
          }
        });
      });

      /* =========================
         📈 CALCULATIONS
      ========================= */
      let totalPresent = 0;
      let totalEntries = 0;
      const classMap = {};
      const lowList = [];

      Object.values(students).forEach((s) => {
        totalPresent += s.present;
        totalEntries += s.total;

        const percent = s.total
          ? Math.round((s.present / s.total) * 100)
          : 0;

        if (!classMap[s.class]) {
          classMap[s.class] = { total: 0, sum: 0 };
        }

        classMap[s.class].total++;
        classMap[s.class].sum += percent;

        if (percent < 75) {
          lowList.push({
            roll: s.roll,
            name: s.name,
            cls: s.class,
            percent,
          });
        }
      });

      setAvgAttendance(
        totalEntries ? Math.round((totalPresent / totalEntries) * 100) : 0
      );

      setLowAttendance(lowList);
      setLowCount(lowList.length);

      setClasses(
        Object.entries(classMap).map(([name, val]) => {
          const avg = Math.round(val.sum / val.total);
          return {
            name,
            total: val.total,
            avg,
            color: avg >= 85 ? "success" : avg >= 75 ? "warning" : "danger",
          };
        })
      );
    } catch (err) {
      console.error("Attendance load failed:", err);
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
        {[
          ["Dashboard", "bi-speedometer2", "/hod-dashboard"],
          ["Leave Approvals", "bi-envelope-check", "/hod-leave"],
          ["Attendance", "bi-calendar-check", "/hod-attendance"],
          ["Marks", "bi-bar-chart-fill", "/hod-marks"],
          ["Exam Seating", "bi-grid-3x3-gap", "/hod-seating"],
        ].map(([name, icon, path], i) => (
          <a key={i} href={path} className="text-decoration-none px-3 py-2 mx-2 text-light">
            <i className={`bi ${icon} me-2`} /> {name}
          </a>
        ))}

        <button
          className="text-danger px-3 py-2 mx-2 mt-auto"
          onClick={() => {
            localStorage.removeItem("campusUser");
            navigate("/login");
          }}
        >
          <i className="bi bi-box-arrow-right me-2"></i> Logout
        </button>

        <div className="text-center text-white mt-3">
          <i className="bi bi-person-circle" style={{ fontSize: 36 }}></i>
          <div>{hod.name}</div>
          <div>{hod.loginId}</div>
          <div>{hod.department} Department</div>
        </div>
      </div>

      {/* MAIN */}
      <div style={mainStyle}>
        <h3 className="mb-4">📊 Attendance Analytics</h3>

        <div className="row g-4 mb-4">
          {[
            ["Total Students", totalStudents],
            ["Avg Attendance", `${avgAttendance}%`],
            ["Low Attendance", lowCount],
            ["Periods Today", 6],
          ].map(([t, v], i) => (
            <div key={i} className="col-md-3">
              <div className="card p-3 text-center">
                <h6>{t}</h6>
                <h4 className="fw-bold">{v}</h4>
              </div>
            </div>
          ))}
        </div>

        <div className="card p-4 mb-4">
          <h5 className="mb-3">🏫 Class-wise Attendance</h5>
          <table className="table table-bordered text-center">
            <thead>
              <tr>
                <th>Class</th>
                <th>Total Students</th>
                <th>Avg Attendance</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((c, i) => (
                <tr key={i}>
                  <td>{c.name}</td>
                  <td>{c.total}</td>
                  <td>{c.avg}%</td>
                  <td>
                    <div className="progress" style={{ height: 10 }}>
                      <div
                        className={`progress-bar bg-${c.color}`}
                        style={{ width: `${c.avg}%` }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card p-4">
          <h5 className="mb-3">🚨 Students Below 75%</h5>
          <table className="table table-bordered text-center">
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Name</th>
                <th>Class</th>
                <th>Attendance %</th>
              </tr>
            </thead>
            <tbody>
              {lowAttendance.map((s, i) => (
                <tr key={i}>
                  <td>{s.roll}</td>
                  <td>{s.name}</td>
                  <td>{s.cls}</td>
                  <td className="text-danger fw-bold">{s.percent}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HodAttendance;

/* STYLES */
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
