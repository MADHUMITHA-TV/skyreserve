// The backend prices every booking at a flat rate per passenger
// (see booking.service.js: totalAmount = passengers.length * 5000).
// Flights themselves have no per-flight fare field, so the UI shows this
// flat rate rather than inventing one.
export const FARE_PER_PASSENGER = 5000;

export const SEAT_STATUS = {
  AVAILABLE: "AVAILABLE",
  LOCKED: "LOCKED",
  BOOKED: "BOOKED",
};

export const BOOKING_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED",
};

export const PAYMENT_METHODS = [
  { value: "CARD", label: "Credit / Debit Card" },
  { value: "UPI", label: "UPI" },
  { value: "NET_BANKING", label: "Net Banking" },
  { value: "WALLET", label: "Wallet" },
];
