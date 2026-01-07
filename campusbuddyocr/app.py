import firebase_admin
from firebase_admin import credentials, firestore
from flask import Flask, request, jsonify
from flask_cors import CORS
import os, uuid, re

from ocr_engine import extract_attendance, extract_marks, extract_roll_numbers
from seating_engine import arrange_seating

# ================= FIREBASE INIT =================
if not firebase_admin._apps:
    cred = credentials.Certificate("serviceAccountKey.json")
    firebase_admin.initialize_app(cred)

db = firestore.client()

# ================= FLASK APP =================
app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route("/")
def home():
    return "Campus Buddy OCR API Running"

# =================================================
# ATTENDANCE OCR (EXTRACT ONLY)
# =================================================
@app.route("/ocr/attendance", methods=["POST"])
def attendance_ocr():
    file = request.files.get("image")
    if not file:
        return jsonify({"error": "No image uploaded"}), 400

    filename = f"{uuid.uuid4()}_{file.filename}"
    path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(path)

    raw = extract_attendance(path)
    normalized = []

    for row in raw:
        text = " ".join(str(v) for v in row.values())
        roll_match = re.search(r"[0-9]{2,}[A-Z0-9]+", text)
        roll = roll_match.group() if roll_match else "UNKNOWN"

        normalized.append({
            "roll": roll,
            "name": row.get("name", "Student"),
            "status": row.get("status", "A")
        })

    return jsonify(normalized)

# =================================================
# ATTENDANCE SUBMIT (SAVE)
# =================================================
@app.route("/attendance/submit", methods=["POST"])
def submit_attendance():
    data = request.json
    if not data:
        return jsonify({"error": "No data"}), 400

    attendance_list = data.get("attendance", [])
    records = {}

    for stu in attendance_list:
        records[stu["roll"]] = {
            "name": stu["name"],
            "status": stu["status"]
        }

    db.collection("attendance_records").add({
        "class": data.get("class"),
        "subject": data.get("subject"),
        "date": data.get("date"),
        "period": data.get("period"),
        "records": records,
        "created_at": firestore.SERVER_TIMESTAMP
    })

    return jsonify({"message": "Attendance saved successfully"})

# =================================================
# STUDENT VIEW ATTENDANCE (FIXED)
# =================================================
@app.route("/student/attendance/<roll>", methods=["GET"])
def get_student_attendance(roll):
    result = []
    docs = db.collection("attendance_records").stream()

    for doc in docs:
        data = doc.to_dict()
        records = data.get("records", {})

        if roll in records:
            result.append({
                "date": data.get("date"),
                "subject": data.get("subject"),
                "period": data.get("period"),
                "status": records[roll].get("status")
            })

    return jsonify(result)

# =================================================
# MARKS OCR (EXTRACT ONLY)
# =================================================
@app.route("/ocr/marks", methods=["POST"])
def marks_ocr():
    file = request.files.get("file")
    if not file:
        return jsonify({"error": "No file uploaded"}), 400

    filename = f"{uuid.uuid4()}_{file.filename}"
    path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(path)

    data = extract_marks(path)
    return jsonify({"marks_data": data})

# =================================================
# MARKS SUBMIT (SAVE)
# =================================================
@app.route("/marks/submit", methods=["POST"])
def submit_marks():
    data = request.json

    required = ["class", "subject", "examType", "maxMarks", "marks"]
    if not data or not all(k in data for k in required):
        return jsonify({"error": "Missing fields"}), 400

    db.collection("marks_records").add({
        "class": data["class"],
        "subject": data["subject"],
        "examType": data["examType"],
        "maxMarks": data["maxMarks"],
        "marks": data["marks"],
        "created_at": firestore.SERVER_TIMESTAMP
    })

    return jsonify({
        "message": "Marks saved successfully",
        "count": len(data["marks"])
    })

# =================================================
# STUDENT VIEW MARKS
# =================================================
@app.route("/student/marks/<roll>", methods=["GET"])
def get_student_marks(roll):
    result = []
    docs = db.collection("marks_records").stream()

    for doc in docs:
        data = doc.to_dict()
        for m in data.get("marks", []):
            if m.get("roll") == roll:
                result.append({
                    "subject": data.get("subject"),
                    "examType": data.get("examType"),
                    "marks": m.get("marks"),
                    "maxMarks": data.get("maxMarks")
                })

    return jsonify(result)

# =================================================
# SEATING OCR
# =================================================
@app.route("/ocr/seating", methods=["POST"])
def seating_ocr():
    file = request.files.get("image")
    rows = int(request.form.get("rows"))
    cols = int(request.form.get("cols"))

    filename = f"{uuid.uuid4()}_{file.filename}"
    path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(path)

    rolls = extract_roll_numbers(path)
    seats = arrange_seating(rolls, rows, cols)

    db.collection("seating_records").add({
        "seating": seats,
        "created_at": firestore.SERVER_TIMESTAMP
    })

    return jsonify(seats)

# ================= RUN =================
if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
