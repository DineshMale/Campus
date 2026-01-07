def arrange_seating(roll_numbers, rows, cols):
    seats = []
    idx = 0

    for r in range(rows):
        row = []
        for c in range(cols):
            if idx < len(roll_numbers):
                row.append(roll_numbers[idx])
                idx += 1
            else:
                row.append("EMPTY")
        seats.append(row)

    return seats
