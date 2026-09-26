import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter } from 'k6/metrics';

// ── Config ──────────────────────────────────────────────
const BASE_URL = 'http://16.192.93.166:5000';
const FLIGHT_ID = 'cmugtor5b0001phg9yy2wo32g'; // load-test flight, 600 seats
const ADMIN_EMAIL = 'admin@skyreserve.com';
const ADMIN_PASSWORD = 'Admin@123';

export const options = {
  scenarios: {
    booking_flow: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 50 },
        { duration: '1m', target: 50 },
        { duration: '30s', target: 200 },
        { duration: '1m', target: 200 },
        { duration: '30s', target: 500 },
        { duration: '1m', target: 500 },
        { duration: '30s', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.05'],
  },
};

const seatLockFailures = new Counter('seat_lock_failures');
const bookingFailures = new Counter('booking_failures');
const paymentFailures = new Counter('payment_failures');

export function setup() {
  const loginRes = http.post(
    `${BASE_URL}/api/v1/auth/login`,
    JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  check(loginRes, { 'login succeeded': (r) => r.status === 200 });
  const token = loginRes.json('data.accessToken');

  const seatsRes = http.get(
    `${BASE_URL}/api/v1/flights/${FLIGHT_ID}/seats/available`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const seats = seatsRes.json('data');
  const seatIds = seats.map((s) => s.id);

  console.log(`Setup complete. ${seatIds.length} seats available for testing.`);

  return { token, seatIds };
}

export default function (data) {
  const { token, seatIds } = data;
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  const seatId = seatIds[Math.floor(Math.random() * seatIds.length)];

  // 1. Lock the seat
  const lockRes = http.post(`${BASE_URL}/api/v1/bookings/lock/${seatId}`, null, { headers });
  const lockOk = check(lockRes, { 'seat locked': (r) => r.status === 200 });
  if (!lockOk) {
    seatLockFailures.add(1);
    sleep(0.1);
    return;
  }

  // 2. Create the booking
  const bookingPayload = JSON.stringify({
    flightId: FLIGHT_ID,
    seatId,
    passengers: [{ firstName: 'Load', lastName: 'Test', age: 30, gender: 'MALE' }],
  });
  const bookingRes = http.post(`${BASE_URL}/api/v1/bookings`, bookingPayload, { headers });
  const bookingOk = check(bookingRes, { 'booking created': (r) => r.status === 201 });
  if (!bookingOk) {
    bookingFailures.add(1);
    http.post(`${BASE_URL}/api/v1/bookings/unlock/${seatId}`, null, { headers });
    sleep(0.1);
    return;
  }
  const bookingId = bookingRes.json('data.id');

  // 3. Create the payment (requires a unique Idempotency-Key header)
  const paymentPayload = JSON.stringify({ bookingId, paymentMethod: 'UPI' });
  const paymentHeaders = Object.assign({}, headers, {
    'Idempotency-Key': `IDEMP-${__VU}-${__ITER}-${Date.now()}`,
  });
  const paymentRes = http.post(`${BASE_URL}/api/v1/payments`, paymentPayload, { headers: paymentHeaders });
  const paymentOk = check(paymentRes, { 'payment created': (r) => r.status === 201 });
  if (!paymentOk) {
    paymentFailures.add(1);
    // Release the seat immediately so a failed payment doesn't strand
    // inventory for the rest of the test.
    http.patch(`${BASE_URL}/api/v1/bookings/${bookingId}/cancel`, null, { headers });
    http.post(`${BASE_URL}/api/v1/bookings/unlock/${seatId}`, null, { headers });
    sleep(0.1);
    return;
  }
  const paymentId = paymentRes.json('data.id');

  // 4. Complete the payment
  const payRes = http.post(
    `${BASE_URL}/api/v1/payments/${paymentId}/pay`,
    JSON.stringify({ transactionId: `TXN-${__VU}-${__ITER}-${Date.now()}` }),
    { headers }
  );
  const payOk = check(payRes, { 'payment completed': (r) => r.status === 200 });
  if (!payOk) paymentFailures.add(1);

  // 5. Cancel the booking (recycles the seat's DB status) and explicitly
  // release the Redis lock right away, rather than waiting for the TTL
  // to expire naturally — this keeps the seat pool from starving under
  // sustained concurrent load.
  http.patch(`${BASE_URL}/api/v1/bookings/${bookingId}/cancel`, null, { headers });
  http.post(`${BASE_URL}/api/v1/bookings/unlock/${seatId}`, null, { headers });

  sleep(0.1);
}
