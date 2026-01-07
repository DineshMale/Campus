import React, { useState } from "react";
import RoleLeaveApproval from "./RoleLeaveApproval";

export default function FacultyHodPanel() {
  const [view, setView] = useState("faculty");

  return (
    <div>
      <button onClick={() => setView("faculty")}>
        Faculty Leave Approvals
      </button>
      <button
        onClick={() => setView("hod")}
        style={{ marginLeft: "10px" }}
      >
        HOD Leave Approvals
      </button>

      <hr style={{ margin: "20px 0" }} />

      {view === "faculty" && <RoleLeaveApproval role="faculty" />}
      {view === "hod" && <RoleLeaveApproval role="hod" />}
    </div>
  );
}
