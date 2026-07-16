import api from "../api/axios";

// POST /bookings/lock/:seatId - places a short-lived Redis lock on a seat
// so two people can't select it at once while one of them is checking out.
export async function lockSeat(seatId) {
  const { data } = await api.post(`/bookings/lock/${seatId}`);
  return data;
}

// POST /bookings/unlock/:seatId
export async function unlockSeat(seatId) {
  const { data } = await api.post(`/bookings/unlock/${seatId}`);
  return data;
}

// GET /bookings/lock/:seatId -> { locked, owner, ttl }
export async function getSeatLockStatus(seatId) {
  const { data } = await api.get(`/bookings/lock/${seatId}`);
  return data.data;
}

// PUT /bookings/lock/:seatId - extends the lock TTL (call while user is
// filling in passenger details so the lock doesn't expire under them)
export async function refreshSeatLock(seatId) {
  const { data } = await api.put(`/bookings/lock/${seatId}`);
  return data;
}

// POST /bookings - { flightId, seatId, passengers: [...] }
// NOTE: the backend only ever reserves a single seat per booking, even
// though it accepts an array of passengers, so the UI treats "passengers"
// as co-travellers riding on that one seat's booking record.
export async function createBooking({ flightId, seatId, passengers }) {
  const { data } = await api.post("/bookings", {
    flightId,
    seatId,
    passengers,
  });
  return data.data;
}

// GET /bookings - current user's bookings
export async function getMyBookings() {
  const { data } = await api.get("/bookings");
  return data.data;
}

// GET /bookings/:id
export async function getBookingById(id) {
  const { data } = await api.get(`/bookings/${id}`);
  return data.data;
}

// PATCH /bookings/:id/cancel
export async function cancelBooking(id) {
  const { data } = await api.patch(`/bookings/${id}/cancel`);
  return data.data;
}
