const seats = [];

const rows = 30;
const cols = ["A", "B", "C", "D", "E", "F"];

for (let r = 1; r <= rows; r++) {
  cols.forEach((c) => {
    seats.push({
      id: `${r}${c}`,
      seatNumber: `${r}${c}`,
      type:
        r <= 5
          ? "BUSINESS"
          : "ECONOMY",
      status:
        Math.random() > 0.82
          ? "BOOKED"
          : "AVAILABLE",
    });
  });
}

export default seats;