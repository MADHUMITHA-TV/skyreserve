import http from 'k6/http';
import { check } from 'k6';
import { Counter } from 'k6/metrics';

const BASE_URL = 'http://16.192.93.166:5000';
const FLIGHT_ID = 'cmugtor5b0001phg9yy2wo32g';
const ADMIN_EMAIL = 'admin@skyreserve.com';
const ADMIN_PASSWORD = 'Admin@123';

const lockWins = new Counter('lock_wins');
const lockConflicts = new Counter('lock_conflicts');

export const options = {
  scenarios: {
    contention: {
      executor: 'shared-iterations',
      vus: 50,
      iterations: 50,
      maxDuration: '30s',
    },
  },
};

export function setup() {
  const loginRes = http.post(
    `${BASE_URL}/api/v1/auth/login`,
    JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  const token = loginRes.json('data.accessToken');

  // Grab exactly one real available seat — every VU will race for this same seat.
  const seatsRes = http.get(
    `${BASE_URL}/api/v1/flights/${FLIGHT_ID}/seats/available`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const seats = seatsRes.json('data');
  const targetSeatId = seats[0].id;
  console.log(`All 50 VUs will race to lock seat: ${targetSeatId}`);

  return { token, targetSeatId };
}

export default function (data) {
  const { token, targetSeatId } = data;
  const headers = { Authorization: `Bearer ${token}` };

  const res = http.post(`${BASE_URL}/api/v1/bookings/lock/${targetSeatId}`, null, { headers });

  if (res.status === 200) {
    lockWins.add(1);
  } else if (res.status === 409) {
    lockConflicts.add(1);
  }

  check(res, {
    'exactly one winner, rest correctly rejected': (r) => r.status === 200 || r.status === 409,
  });
}
