import http from 'k6/http';
import { check, sleep } from 'k6';

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
  console.log(`Login status: ${loginRes.status}, body: ${loginRes.body.substring(0, 200)}`);
  const token = loginRes.json('data.accessToken');
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const seatsRes = http.get(
    `${BASE_URL}/api/v1/flights/${FLIGHT_ID}/seats/available`,
    { headers }
  );
  console.log(`Seats fetch status: ${seatsRes.status}, body start: ${seatsRes.body.substring(0, 200)}`);
  const seats = seatsRes.json('data');
  console.log(`Total available seats: ${seats ? seats.length : 'undefined'}`);

  let successCount = 0;
  for (let i = 0; i < 20; i++) {
    const seatId = seats[i].id;
    const res = http.post(`${BASE_URL}/api/v1/bookings/lock/${seatId}`, null, { headers });
    console.log(`Attempt ${i}: seatId=${seatId} status=${res.status} body=${res.body}`);
    if (res.status === 200) {
      successCount++;
      // release it immediately so we don't strand it
      http.post(`${BASE_URL}/api/v1/bookings/unlock/${seatId}`, null, { headers });
    }
    sleep(0.2);
  }
  console.log(`Sequential test: ${successCount}/20 succeeded with zero concurrency.`);
}
