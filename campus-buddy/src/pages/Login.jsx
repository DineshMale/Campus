import { useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import "../css/auth.css";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const loginUser = async () => {
    if (!loginId || !password) {
      alert("Enter Roll No / Faculty ID and Password");
      return;
    }

    try {
      const q = query(
        collection(db, "USERS"),
        where("loginId", "==", loginId),
        where("password", "==", password)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        alert("Invalid credentials");
        return;
      }

  const user = snapshot.docs[0].data();

const sessionUser = {
  ...user,
  roll: user.role === "student" ? loginId.trim().toUpperCase() : null
};

localStorage.setItem("campusUser", JSON.stringify(sessionUser));


      // Role-based redirect (UNCHANGED)
      if (user.role === "student") navigate("/student-dashboard");
      else if (user.role === "faculty") navigate("/faculty-dashboard");
      else if (user.role === "hod") navigate("/hod-dashboard");
    } catch (err) {
      console.error(err);
      alert("Login failed");
    }
  };

  return (
    <div className="auth-container">
      {/* UI unchanged */}
      <div className="auth-left">
        <div className="brand">🧠 CampusBuddy</div>
        <div className="left-content">
          <h1>Welcome Back</h1>
          <p>Login using your college credentials</p>
        </div>
      </div>

      <div className="auth-right">
        <h2>Login</h2>

        <label>Roll No / Faculty ID</label>
        <input
          value={loginId}
          onChange={(e) => setLoginId(e.target.value)}
          placeholder="Enter ID"
        />

        <label>Password </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="ENTER"
        />

        <button onClick={loginUser}>Login →</button>
      </div>
    </div>
  );
}
