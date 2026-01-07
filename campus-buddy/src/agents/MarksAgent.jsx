import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";

function MarksAgent() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!image) {
      alert("Upload marks image");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("image", image);

    try {
      const res = await fetch("http://127.0.0.1:5000/ocr/marks", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setResult(data);

      await addDoc(collection(db, "marks"), {
        date: new Date().toISOString().slice(0, 10),
        records: data,
      });

      alert("Marks saved successfully");
    } catch (err) {
      console.error(err);
      alert("Error processing marks");
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Marks Agent</h2>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files[0])}
      />

      <br /><br />

      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "Processing..." : "Submit Marks"}
      </button>

      <h3>OCR Result</h3>

      {result.length > 0 && (
        <table border="1" cellPadding="8">
          <thead>
            <tr>
              <th>Roll No</th>
              <th>Mid 1</th>
              <th>Mid 2</th>
              <th>Average</th>
            </tr>
          </thead>
          <tbody>
            {result.map((r, i) => (
              <tr key={i}>
                <td>{r.roll_no}</td>
                <td>{r.mid1}</td>
                <td>{r.mid2}</td>
                <td>{r.average}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default MarksAgent;
