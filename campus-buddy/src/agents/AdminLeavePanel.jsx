import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

export default function AdminLeavePanel() {
  const [leaves, setLeaves] = useState([]);
  const [roleChoice, setRoleChoice] = useState({});

  const loadLeaves = async () => {
    const snap = await getDocs(collection(db, "leaveRequests"));
    setLeaves(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    loadLeaves();
  }, []);

  const assignRole = async (leaveId) => {
    const role = roleChoice[leaveId];
    if (!role) {
      alert("Please select Faculty or HOD");
      return;
    }

    await updateDoc(doc(db, "leaveRequests", leaveId), {
      assignedRole: role
    });

    alert(`Assigned to ${role.toUpperCase()}`);
    loadLeaves();
  };

  return (
    <div>
      <h2>Admin – Assign Leave</h2>

      {leaves.map(leave => (
        <div
          key={leave.id}
          style={{
            border: "1px solid #ccc",
            padding: "12px",
            marginBottom: "12px"
          }}
        >
          <p><b>Date:</b> {leave.leaveDate}</p>
          <p><b>Reason:</b> {leave.reason}</p>
          <p><b>Status:</b> {leave.status}</p>
          <p>
            <b>Assigned Role:</b>{" "}
            {leave.assignedRole ? leave.assignedRole : "Not assigned"}
          </p>

          <label>Assign Role</label><br />
          <select
            value={roleChoice[leave.id] || ""}
            onChange={(e) =>
              setRoleChoice({
                ...roleChoice,
                [leave.id]: e.target.value
              })
            }
          >
            <option value="">Select Role</option>
            <option value="faculty">Faculty</option>
            <option value="hod">HOD</option>
          </select>

          <br /><br />

          <button onClick={() => assignRole(leave.id)}>
            Assign
          </button>
        </div>
      ))}
    </div>
  );
}
