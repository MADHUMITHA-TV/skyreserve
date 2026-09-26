import http from 'k6/http';
import { check } from 'k6';

const BASE_URL = 'http://16.192.93.166:5000';
const FLIGHT_ID = 'cmugtor5b0001phg9yy2wo32g';
const ADMIN_EMAIL = 'admin@skyreserve.com';
const ADMIN_PASSWORD = 'Admin@123';

export const options = {
  vus: 1,
  iterations: 1,
};

export default function () {
  const loginRes = http.post(
    `${BASE_URL}/api/v1/auth/login`,
    JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  check(loginRes, { 'login succeeded': (r) => r.status === 200 });
  const token = loginRes.json('data.accessToken');
  console.log(`Token acquired: ${token ? 'yes' : 'NO'}`);

  const seatsRes = http.get(
    `${BASE_URL}/api/v1/flights/${FLIGHT_ID}/seats/available`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  console.log(`Seats response status: ${seatsRes.status}`);
  console.log(`Seats response body length (chars): ${seatsRes.body.length}`);

  const seats = seatsRes.json('data');
  console.log(`typeof seats: ${typeof seats}`);
  console.log(`Array.isArray(seats): ${Array.isArray(seats)}`);
  console.log(`seats.length: ${seats ? seats.length : 'null/undefined'}`);

  if (Array.isArray(seats) && seats.length > 0) {
    console.log(`First seat sample: ${JSON.stringify(seats[0])}`);
  }
}
