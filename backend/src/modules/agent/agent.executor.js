/**
 * agent.executor.js
 *
 * Executes one tool call against your REAL, EXISTING service functions.
 * No booking/payment/locking logic is reimplemented here — every handler
 * below is a thin call into flight.service.js, booking.service.js,
 * payment.service.js, etc., exactly like your controllers already do.
 *
 * SECURITY MODEL (requirement 7 — this is the part that matters most):
 *   - `ctx.userId` and `ctx.role` come from req.user (JWT), set by the
 *     orchestrator BEFORE this file is ever called. Nothing in here ever
 *     reads a userId out of the LLM's tool arguments — the schemas in
 *     agent.tools.js don't even expose a user_id field, on purpose.
 *   - initiate_payment and confirm_payment additionally re-fetch the
 *     booking/payment and check `booking.userId === ctx.userId` before
 *     doing anything, because payment.service.js itself does not (see
 *     conversation notes — this is a gap in the existing REST API that
 *     the agent should not inherit).
 *   - idempotency keys and transaction IDs are generated HERE, server-side,
 *     deterministically — never accepted from the LLM.
 */

import { fetchAirports } from "../airport/airport.service.js";
import { fetchFlights } from "../flight/flight.service.js";
import { fetchAvailableSeats } from "../flightSeat/flightSeat.service.js";
import {
  lockFlightSeat,
  createNewBooking,
  fetchMyBookings,
  fetchBookingById,
  cancelBooking
} from "../booking/booking.service.js";
import {
  createNewPayment,
  processPayment,
  fetchPaymentById
} from "../payment/payment.service.js";

import { v4 as uuidv4 } from "uuid";

// Matches the flat rate hardcoded in booking.service.js (createNewBooking).
// There's no per-flight price field in the schema yet — see step 1 notes.
// If you add real per-flight pricing later, update both places together.
const FLAT_PRICE_PER_PASSENGER_INR = 5000;

const SEAT_POSITION = {
  A: "window",
  F: "window",
  C: "aisle",
  D: "aisle",
  B: "middle",
  E: "middle"
};

function seatPosition(seatNumber) {
  const letter = seatNumber.slice(-1).toUpperCase();
  return SEAT_POSITION[letter] || "unknown";
}

/** Wraps a service call so a known ApiError (has statusCode) becomes a
 * structured {success:false} result instead of an unhandled throw — so
 * the LLM can react to it (offer alternatives, tell the user, etc.)
 * instead of the whole chat turn blowing up. Truly unexpected errors
 * (no statusCode) are re-thrown — the orchestrator logs those as a hard
 * failure and tells the user something went wrong, rather than letting
 * the agent guess what happened. */
async function safely(fn) {
  try {
    return await fn();
  } catch (err) {
    if (typeof err.statusCode === "number") {
      return {
        success: false,
        statusCode: err.statusCode,
        message: err.message
      };
    }
    throw err;
  }
}

const handlers = {
  async resolve_airport({ query }) {
    const airports = await fetchAirports();
    const q = (query || "").trim().toLowerCase();

    const matches = airports.filter(
      (a) =>
        a.city.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) ||
        a.code.toLowerCase() === q
    );

    const trim = (a) => ({ id: a.id, name: a.name, code: a.code, city: a.city, country: a.country });

    if (matches.length > 0) {
      return { matches: matches.map(trim) };
    }

    // No fuzzy match — hand back the full list so the LLM can still find
    // it (small dataset for a portfolio project) rather than dead-ending.
    return { matches: [], note: "No direct match — here is the full airport list.", allAirports: airports.map(trim) };
  },

  async search_flights({ departureAirportId, arrivalAirportId, date, airlineId, max_price }) {
    const flights = await fetchFlights({ departureAirportId, arrivalAirportId, date, airlineId });

    let results = flights.map((f) => ({
      id: f.id,
      flightNumber: f.flightNumber,
      departureTime: f.departureTime,
      arrivalTime: f.arrivalTime,
      status: f.status,
      airline: { name: f.airline?.name, code: f.airline?.code },
      departureAirport: { code: f.departureAirport?.code, city: f.departureAirport?.city },
      arrivalAirport: { code: f.arrivalAirport?.code, city: f.arrivalAirport?.city },
      pricePerPassengerINR: FLAT_PRICE_PER_PASSENGER_INR
    }));

    let priceNote;
    if (typeof max_price === "number") {
      const before = results.length;
      results = results.filter((f) => f.pricePerPassengerINR <= max_price);
      if (before > 0 && results.length === 0) {
        priceNote = `All matching flights are priced at ₹${FLAT_PRICE_PER_PASSENGER_INR}/passenger (flat rate), which is above the ₹${max_price} budget.`;
      }
    }

    return { count: results.length, flights: results, ...(priceNote ? { note: priceNote } : {}) };
  },

  async check_seat_availability({ flight_id, seat_preference = "any" }) {
    const seats = await fetchAvailableSeats(flight_id);

    let results = seats.map((s) => ({
      id: s.id,
      seatNumber: s.seatNumber,
      position: seatPosition(s.seatNumber)
    }));

    if (seat_preference && seat_preference !== "any") {
      results = results.filter((s) => s.position === seat_preference);
    }

    return { flight_id, seat_preference, count: results.length, seats: results };
  },

  async lock_seat({ seat_id }, ctx) {
    return safely(async () => {
      const result = await lockFlightSeat(seat_id, ctx.userId, ctx.socketId ?? null);
      return { success: true, seat_id, lockToken: result.token };
    });
  },

  async create_booking({ flight_id, seat_id, passengers }, ctx) {
    return safely(async () => {
      const booking = await createNewBooking(ctx.userId, { flightId: flight_id, seatId: seat_id, passengers });
      return {
        success: true,
        booking: {
          id: booking.id,
          bookingCode: booking.bookingCode,
          status: booking.status,
          totalAmount: booking.totalAmount
        }
      };
    });
  },

  async initiate_payment({ booking_id, payment_method }, ctx) {
    return safely(async () => {
      const booking = await fetchBookingById(booking_id);

      // Defense-in-depth: payment.service.js itself doesn't check this.
      if (booking.userId !== ctx.userId) {
        return { success: false, statusCode: 403, message: "This booking does not belong to you." };
      }

      // Server-generated, deterministic — never supplied by the LLM.
      // Same conversation + booking always produces the same key, so a
      // confused agent retrying this tool can't create duplicate PENDING
      // payments for one booking.
      const idempotencyKey = `agent:${ctx.userId}:${booking_id}:initiate`;

      const payment = await createNewPayment(booking_id, payment_method, idempotencyKey);
      return {
        success: true,
        payment: { id: payment.id, status: payment.status, amount: payment.amount, paymentMethod: payment.paymentMethod }
      };
    });
  },

  async confirm_payment({ payment_id }, ctx) {
    return safely(async () => {
      const payment = await fetchPaymentById(payment_id);
      const booking = await fetchBookingById(payment.bookingId);

      if (booking.userId !== ctx.userId) {
        return { success: false, statusCode: 403, message: "This payment does not belong to you." };
      }

      // No real payment gateway in this project — a transaction ID is
      // generated server-side to simulate one. Never accept this from
      // the LLM; it's meant to be an opaque gateway reference.
      const transactionId = `AGT-${uuidv4().slice(0, 8).toUpperCase()}`;

      const result = await processPayment(payment_id, transactionId);
      return {
        success: true,
        payment: { id: result.id, status: result.status, transactionId: result.transactionId, paidAt: result.paidAt }
      };
    });
  },

  async get_my_bookings(_args, ctx) {
    const bookings = await fetchMyBookings(ctx.userId);
    return {
      count: bookings.length,
      bookings: bookings.map((b) => ({
        id: b.id,
        bookingCode: b.bookingCode,
        status: b.status,
        totalAmount: b.totalAmount
      }))
    };
  },

  async cancel_booking({ booking_id }, ctx) {
    return safely(async () => {
      const booking = await cancelBooking(booking_id, { id: ctx.userId, role: ctx.role });
      return { success: true, booking: { id: booking.id, status: booking.status } };
    });
  }
};

/**
 * @param {string} toolName
 * @param {object} args - raw arguments the LLM produced
 * @param {{ userId: string, role: string, socketId?: string }} ctx - from req.user, never from the LLM
 */
export async function executeTool(toolName, args, ctx) {
  const handler = handlers[toolName];
  if (!handler) {
    return { success: false, statusCode: 400, message: `Unknown tool: ${toolName}` };
  }
  return handler(args, ctx);
}