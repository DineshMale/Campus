import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  where
} from "firebase/firestore";

// simulate logged-in role
const CURRENT_ROLE = "faculty"; // change to "hod" to test HOD view

export default function FacultyLeavePanel() {
  const [leaves, setLeaves] = useState([]);

  const loadLeaves = async () => {
    const q = query(
      collection(db, "leaveRequests"),
      where("assignedRole", "==", CURRENT_ROLE),
      where("status", "==", "pending")
    );

    const snap = await getDocs(q);
    setLeaves(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    loadLeaves();
  }, []);

  const decide = async (leaveId, status) => {
    await updateDoc(doc(db, "leaveRequests", leaveId), {
      status,
      decisionAt: new Date()
    });

    alert(`Leave ${status}`);
    loadLeaves();
  };

  return (
    <div>
      <h2>{CURRENT_ROLE.toUpperCase()} – Leave Approvals</h2>

      {leaves.length === 0 && <p>No leaves assigned.</p>}

      {leaves.map(leave => (
        <div
          key={leave.id}
          style={{ border: "1px solid #ccc", padding: 12, marginBottom: 12 }}
        >
          <p><b>Date:</b> {leave.leaveDate}</p>
          <p><b>Reason:</b> {leave.reason}</p>
          <p><b>Letter:</b> {leave.letterText}</p>

          <button onClick={() => decide(leave.id, "approved")}>
            Approve
          </button>
          <button
            onClick={() => decide(leave.id, "rejected")}
            style={{ marginLeft: "10px" }}
          >
            Reject
          </button>
        </div>
      ))}
    </div>
  );
}
