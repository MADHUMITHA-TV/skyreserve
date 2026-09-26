/**
 * agent.tools.js
 *
 * Tool schema definitions for the conversational booking agent.
 *
 * IMPORTANT: these schemas describe what the LLM is allowed to ASK for.
 * They do not grant any actual authority — every tool executor in
 * agent.executor.js (step 4) re-derives userId from req.user (JWT),
 * never from the LLM's tool_input. See the "AUTH NOTE" on each tool
 * below for what is deliberately left OUT of the schema for that reason.
 *
 * Schema format follows Anthropic's tool-use `input_schema` shape
 * (JSON Schema). The LLM adapter (step 3) converts this into whatever
 * shape the active provider (Gemini today, Claude later) needs, so
 * this file itself stays provider-agnostic.
 */

export const AGENT_TOOLS = [
  {
    name: "resolve_airport",
    description:
      "Resolve a city name, airport name, or IATA-style code the user " +
      "mentioned (e.g. 'Chennai', 'MAA', 'Chennai International') into " +
      "the actual airport records from the database, each with an `id` " +
      "field. ALWAYS call this before search_flights for any origin or " +
      "destination the user names in plain language — flight search " +
      "needs real airport IDs, never city names. There is no server-side " +
      "filter for this (the backend returns the full airport list), so " +
      "match the right one yourself from the results and use its `id`.",
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "The city, airport name, or code the user mentioned, verbatim (e.g. 'Chennai').",
        },
      },
      required: ["query"],
    },
  },

  {
    name: "search_flights",
    description:
      "Search available flights by route and/or date. departureAirportId " +
      "and arrivalAirportId must be real airport IDs previously returned " +
      "by resolve_airport — never guess or invent them. If the user gave " +
      "a budget, pass max_price and this tool will filter out flights " +
      "priced above it (current pricing is a flat rate per passenger, " +
      "not per-flight, so this is an approximate filter for now).",
    input_schema: {
      type: "object",
      properties: {
        departureAirportId: {
          type: "string",
          description: "Airport ID from resolve_airport, or omit to search all origins.",
        },
        arrivalAirportId: {
          type: "string",
          description: "Airport ID from resolve_airport, or omit to search all destinations.",
        },
        date: {
          type: "string",
          description: "ISO date, e.g. 2026-08-14. Resolve relative dates ('next Friday') to a real calendar date before calling.",
        },
        airlineId: {
          type: "string",
          description: "Optional airline ID, only if the user names a specific airline.",
        },
        max_price: {
          type: "number",
          description: "Optional. Upper budget in INR per passenger, if the user mentioned one.",
        },
      },
    },
  },

  {
    name: "check_seat_availability",
    description:
      "List available (unbooked, unlocked) seats for a specific flight. " +
      "If the user has a seat preference (window, aisle, middle, or a " +
      "specific seat number), pass seat_preference and only matching " +
      "seats are returned. Always call this before lock_seat so you " +
      "have a real, currently-available seatId to lock.",
    input_schema: {
      type: "object",
      properties: {
        flight_id: {
          type: "string",
          description: "Flight ID from a prior search_flights result.",
        },
        seat_preference: {
          type: "string",
          enum: ["window", "aisle", "middle", "any"],
          description: "Defaults to 'any' if the user didn't specify.",
        },
      },
      required: ["flight_id"],
    },
  },

  {
    name: "lock_seat",
    description:
      "Place a temporary hold (Redis lock, ~5 minutes) on one specific " +
      "seat so no one else can take it while the user finishes booking. " +
      "Call this only after the user has confirmed a specific seat from " +
      "check_seat_availability — never lock a seat speculatively. If this " +
      "fails because the seat is already locked by someone else, tell the " +
      "user and offer alternative seats from a fresh check_seat_availability " +
      "call — do not retry the same seat automatically.",
    input_schema: {
      type: "object",
      properties: {
        seat_id: {
          type: "string",
          description: "Seat ID from check_seat_availability.",
        },
      },
      required: ["seat_id"],
    },
    // AUTH NOTE: intentionally no `user_id` field. The real endpoint
    // (POST /bookings/lock/:seatId) takes the acting user from the JWT
    // (req.user.id) server-side. The LLM cannot lock a seat "as" anyone
    // else, because it never gets to supply whose lock it is.
  },

  {
    name: "create_booking",
    description:
      "Create the booking record once the user has confirmed the flight, " +
      "the specific seat, and passenger details. The seat must already be " +
      "locked via lock_seat, and the lock must belong to this same user — " +
      "the backend enforces that automatically. Ask the user for missing " +
      "passenger names before calling this; never invent passenger details.",
    input_schema: {
      type: "object",
      properties: {
        flight_id: { type: "string" },
        seat_id: { type: "string" },
        passengers: {
          type: "array",
          items: {
            type: "object",
            properties: {
              firstName: { type: "string" },
              lastName: { type: "string" },
              age: { type: "integer" },
              gender: { type: "string", enum: ["MALE", "FEMALE", "OTHER"] },
            },
            required: ["firstName", "lastName"],
          },
          minItems: 1,
        },
      },
      required: ["flight_id", "seat_id", "passengers"],
    },
  },

  {
    name: "initiate_payment",
    description:
      "Create a PENDING payment record for a confirmed booking. This step " +
      "does NOT move money yet — it just prepares the payment. The actual " +
      "charge happens in confirm_payment, which requires a separate " +
      "explicit user confirmation. Call this only after create_booking " +
      "has succeeded.",
    input_schema: {
      type: "object",
      properties: {
        booking_id: { type: "string" },
        payment_method: {
          type: "string",
          enum: ["CARD", "UPI", "NET_BANKING", "WALLET"],
        },
      },
      required: ["booking_id", "payment_method"],
    },
  },

  {
    name: "confirm_payment",
    description:
      "Actually complete the payment and charge the user. THIS IS " +
      "IRREVERSIBLE within this flow — never call this without the user " +
      "having explicitly confirmed the booking summary and amount in " +
      "their most recent message (a clear yes/confirm, not just having " +
      "answered an earlier question). If the user hasn't clearly " +
      "confirmed yet, ask them to confirm instead of calling this tool.",
    input_schema: {
      type: "object",
      properties: {
        payment_id: {
          type: "string",
          description: "Payment ID returned by initiate_payment.",
        },
      },
      required: ["payment_id"],
    },
    // AUTH NOTE: no idempotency_key field on purpose. The orchestration
    // endpoint generates and attaches the Idempotency-Key header itself
    // (deterministically, from payment_id + a per-chat-turn nonce) so the
    // LLM can never fabricate, omit, or reuse one incorrectly.
  },

  {
    name: "get_my_bookings",
    description:
      "List the current user's own bookings. Use this when they ask " +
      "what they've booked, or to look up a booking_id they refer to " +
      "vaguely (e.g. 'cancel my Chennai trip').",
    input_schema: { type: "object", properties: {} },
  },

  {
    name: "cancel_booking",
    description:
      "Cancel an existing booking. Always confirm with the user which " +
      "booking and that they want to cancel before calling this — " +
      "cancellation may affect refund eligibility depending on policy.",
    input_schema: {
      type: "object",
      properties: {
        booking_id: { type: "string" },
      },
      required: ["booking_id"],
    },
  },
];

/**
 * Tools that move money or make irreversible/costly changes.
 * The orchestration layer (step 4) uses this list to force an explicit
 * confirmation turn before executing, regardless of what the LLM decides.
 */
export const SENSITIVE_TOOLS = new Set(["confirm_payment", "cancel_booking"]);