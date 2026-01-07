import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";

function AttendanceAgent() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!image) {
      alert("Please upload attendance image");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("image", image);

    try {
      // 🔥 CALL FLASK OCR API
      const res = await fetch("http://localhost:5000/ocr/attendance", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setResult(data);

      // 🔥 SAVE TO FIREBASE
      for (let record of data) {
        await addDoc(collection(db, "attendance"), {
  date: new Date().toISOString().slice(0, 10),
  records: data
});

      }

      alert("Attendance saved successfully");
    } catch (err) {
      console.error(err);
      alert("Error processing attendance");
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Attendance Agent</h2>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files[0])}
      />

      <br /><br />

      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "Processing..." : "Submit Attendance"}
      </button>

      <hr />

     <h3>OCR Result</h3>

{result.length > 0 && (
  <table border="1" cellPadding="8">
    <thead>
      <tr>
        <th>Roll Number</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      {result.map((r, i) => (
        <tr key={i}>
          <td>{r.roll_no}</td>
          <td>{r.status}</td>
        </tr>
      ))}
    </tbody>
  </table>
)}

    </div>
  );
}

export default AttendanceAgent;
