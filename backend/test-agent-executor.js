/**
 * test-agent-executor.js
 *
 * Exercises the read-only tools (no locking/booking/payment side effects)
 * against your real DB, using a real user's id as the auth context.
 *
 * Run from backend/: node test-agent-executor.js
 */

import prisma from "./prisma/client.js";
import { executeTool } from "./src/modules/agent/agent.executor.js";

const user = await prisma.user.findFirst();
if (!user) throw new Error("No users in DB — register/seed one first");

const ctx = { userId: user.id, role: user.role };

console.log(`Using user: ${user.email} (${user.id})\n`);

console.log("=== resolve_airport('Chennai') ===");
const airportResult = await executeTool("resolve_airport", { query: "Chennai" }, ctx);
console.log(JSON.stringify(airportResult, null, 2));

const firstMatch = airportResult.matches?.[0];
if (!firstMatch) {
  console.log("\nNo airport matched 'Chennai' in your seed data — try a city name that's actually in your DB.");
  process.exit(0);
}

console.log("\n=== search_flights(arrivalAirportId = matched Chennai airport) ===");
const flightResult = await executeTool(
  "search_flights",
  { arrivalAirportId: firstMatch.id, max_price: 5000 },
  ctx
);
console.log(JSON.stringify(flightResult, null, 2));

const firstFlight = flightResult.flights?.[0];
if (!firstFlight) {
  console.log("\nNo flights found into that airport in your seed data — nothing more to test here.");
  process.exit(0);
}

console.log("\n=== check_seat_availability(window seats on first matching flight) ===");
const seatResult = await executeTool(
  "check_seat_availability",
  { flight_id: firstFlight.id, seat_preference: "window" },
  ctx
);
console.log(JSON.stringify(seatResult, null, 2));