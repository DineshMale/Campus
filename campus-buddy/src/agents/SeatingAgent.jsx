import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";

function SeatingAgent() {
  const [image, setImage] = useState(null);
  const [rows, setRows] = useState("");
  const [cols, setCols] = useState("");
  const [seating, setSeating] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!image || !rows || !cols) {
      alert("Upload image and enter rows & columns");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("image", image);
      formData.append("rows", rows);
      formData.append("cols", cols);

      const res = await fetch("http://127.0.0.1:5000/ocr/seating", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!data.seating) {
        throw new Error("Invalid response");
      }

      setSeating(data.seating);

      await addDoc(collection(db, "seating"), {
  createdAt: new Date(),
  rows: Number(rows),
  cols: Number(cols),
  rolls: data.rolls,
  seating: JSON.stringify(data.seating),
});


      alert("✅ Seating saved in Firebase");
    } catch (err) {
      console.error(err);
      alert("❌ Error saving seating");
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Seating Arrangement Agent</h2>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files[0])}
      />

      <br /><br />

      <input
        type="number"
        placeholder="Rows"
        value={rows}
        onChange={(e) => setRows(e.target.value)}
      />

      <input
        type="number"
        placeholder="Columns"
        value={cols}
        onChange={(e) => setCols(e.target.value)}
        style={{ marginLeft: "10px" }}
      />

      <br /><br />

      <button onClick={handleGenerate} disabled={loading}>
        {loading ? "Processing..." : "Generate Seating"}
      </button>

      {seating && (
        <>
          <h3>Seating Matrix</h3>
          <table border="1" cellPadding="8">
            <tbody>
              {seating.map((row, i) => (
                <tr key={i}>
                  {row.map((seat, j) => (
                    <td key={j}>{seat}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default SeatingAgent;
