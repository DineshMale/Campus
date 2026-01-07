import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

const STUDENT_ID = "stu_1";

export default function LeaveAgent() {
  const [leaveDate, setLeaveDate] = useState("");
  const [reason, setReason] = useState("");
  const [letter, setLetter] = useState("");
  const [loading, setLoading] = useState(false);

  const submitLeave = async () => {
    if (!leaveDate || !reason || !letter) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(db, "leaveRequests"), {
        studentId: STUDENT_ID,
        leaveDate,
        reason,
        letterText: letter,   // 👈 this is the leave letter
        status: "pending",
        assignedTo: "",
        assignedRole: "",
        createdAt: new Date()
      });

      alert("Leave submitted successfully");
      setLeaveDate("");
      setReason("");
      setLetter("");
    } catch (err) {
      console.error(err);
      alert("Error submitting leave");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Student – Apply Leave</h2>

      <label>Leave Date</label><br />
      <input
        type="date"
        value={leaveDate}
        onChange={(e) => setLeaveDate(e.target.value)}
      />

      <br /><br />

      <label>Reason (short)</label><br />
      <input
        type="text"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />

      <br /><br />

      <label>Leave Letter / Explanation</label><br />
      <textarea
        rows="5"
        value={letter}
        onChange={(e) => setLetter(e.target.value)}
        placeholder="Write your leave application here..."
      />

      <br /><br />

      <button onClick={submitLeave} disabled={loading}>
        {loading ? "Submitting..." : "Submit Leave"}
      </button>
    </div>
  );
}
