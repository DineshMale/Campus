import cv2
import pytesseract
import re
import numpy as np

# ================= TESSERACT PATH =================
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# ================= IMAGE PREPROCESS =================
def preprocess_image(image_path):
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError("Image not found")

    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # 🔥 Resize improves OCR for small fonts (VERY IMPORTANT)
    gray = cv2.resize(
        gray,
        None,
        fx=1.8,
        fy=1.8,
        interpolation=cv2.INTER_CUBIC
    )

    return gray

# ================= OCR TEXT =================
def extract_text(image_path):
    img = preprocess_image(image_path)

    # 🔥 Best mode for row-based text
    config = r"--oem 3 --psm 6"

    text = pytesseract.image_to_string(img, config=config)
    return text

# ================= ATTENDANCE =================
def extract_attendance(image_path):
    text = extract_text(image_path)
    records = []

    for line in text.split("\n"):
        line = line.strip()
        if not line:
            continue

        roll_match = re.search(
            r"\b([0-9]{2,}[A-Z]{1,3}[0-9A-Z]{1,4})\b",
            line
        )

        status_match = re.search(
            r"\b(P|A|Present|Absent)\b",
            line,
            re.IGNORECASE
        )

        if roll_match and status_match:
            roll_no = roll_match.group(1)
            status_raw = status_match.group(1).lower()
            status = "P" if status_raw.startswith("p") else "A"

            name = re.sub(r"\b" + re.escape(roll_no) + r"\b", "", line)
            name = re.sub(
                r"\b(P|A|Present|Absent)\b",
                "",
                name,
                flags=re.IGNORECASE
            ).strip()

            records.append({
                "roll": roll_no,
                "name": name if name else "-",
                "status": status
            })

    return records

# ================= MARKS (FINAL & ROBUST) =================
def extract_marks(image_path):
    text = extract_text(image_path)
    records = []

    for line in text.split("\n"):
        line = line.strip()
        if not line:
            continue

        # 1️⃣ Find roll number
        roll_match = re.search(r"(23241A\d{2}[A-Z]\d)", line)
        if not roll_match:
            continue

        roll = roll_match.group(1)

        # 2️⃣ Remove roll number from line
        remainder = line.replace(roll, "").strip()
        tokens = remainder.split()

        if len(tokens) < 3:
            continue

        # 3️⃣ First token = student name
        name = tokens[0]

        # 4️⃣ Extract numeric values (OCR-safe)
        numbers = []
        for token in tokens[1:]:
            cleaned = (
                token.replace("O", "0")
                     .replace("o", "0")
                     .replace("S", "5")
                     .replace("s", "5")
            )
            if cleaned.isdigit():
                numbers.append(int(cleaned))

        if len(numbers) < 2:
            continue

        internal = numbers[-2]
        marks = numbers[-1]

        records.append({
            "roll": roll,
            "name": name,
            "internal": internal,
            "marks": marks
        })

    return records

# ================= SEATING =================
def extract_roll_numbers(image_path):
    text = extract_text(image_path)
    rolls = re.findall(r"\b\d{3,}\b", text)
    return list(dict.fromkeys(rolls))
