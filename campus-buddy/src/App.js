import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";

// Student
import StudentDashboard from "./pages/StudentDashboard";
import StudentAttendance from "./pages/StudentAttendance";
import StudentMarks from "./pages/StudentMarks";
import StudentLeave from "./pages/StudentLeave";
import StudentExamSeating from "./pages/StudentExamSeating";

// Faculty
import FacultyDashboard from "./pages/FacultyDashboard";
import FacultyAttendance from "./pages/FacultyAttendance";
import FacultyMarks from "./pages/FacultyMarks";
import FacultySeating from "./pages/FacultySeating";

// HOD
import HodDashboard from "./pages/HodDashboard";
import HodAttendance from "./pages/HodAttendance";
import HodLeave from "./pages/HodLeave";
import HodMarks from "./pages/HodMarks";
import HodSeating from "./pages/HodSeating";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home & Auth */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* Student Routes */}
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/student-attendance" element={<StudentAttendance />} />
        <Route path="/student-marks" element={<StudentMarks />} />
        <Route path="/student-leave" element={<StudentLeave />} />
        <Route
          path="/student-exam-seating"
          element={<StudentExamSeating />}
        />

        {/* Faculty Routes */}
        <Route path="/faculty-dashboard" element={<FacultyDashboard />} />
        <Route path="/faculty-attendance" element={<FacultyAttendance />} />
        <Route path="/faculty-marks" element={<FacultyMarks />} />
        <Route path="/faculty-seating" element={<FacultySeating />} />

        {/* HOD Routes */}
        <Route path="/hod-dashboard" element={<HodDashboard />} />
        <Route path="/hod-attendance" element={<HodAttendance />} />
        <Route path="/hod-leave" element={<HodLeave />} />
        <Route path="/hod-marks" element={<HodMarks />} />
        <Route path="/hod-seating" element={<HodSeating />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;