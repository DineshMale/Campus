from ocr_engine import extract_roll_numbers
from seating_engine import arrange_seating

print("---- SEATING OCR ----")
rolls = extract_roll_numbers("rolls.png")
print("Rolls:", rolls)

seats = arrange_seating(rolls, rows=3, cols=4)
print("\nSeating Arrangement:")
for row in seats:
    print(row)
