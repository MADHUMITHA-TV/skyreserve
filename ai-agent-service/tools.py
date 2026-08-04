"""
Defines the tools the agent can call, and executes them against your
existing SkyReserve REST API via skyreserve_client.py.

Each tool description is deliberately specific — vague descriptions are
the #1 cause of an agent picking the wrong tool or wrong arguments.
"""

TOOLS = [
       {
        "name": "search_airports",
        "description": (
            "Look up airports to resolve a city name or IATA code (e.g. 'Chennai' "
            "or 'MAA') into the actual airport ID your database uses. ALWAYS call "
            "this first for any city/airport the user mentions before calling "
            "search_flights - airport IDs are internal database IDs, not city "
            "names or IATA codes, so they must come from this tool's result."
        ),
        "input_schema": {"type": "object", "properties": {}},
    },
    {
        "name": "search_flights",
        "description": (
            "Search available flights. Use this whenever the user mentions a "
            "destination, origin, or travel date, before trying to book anything. "
            "Airport IDs must come from a prior search or lookup - never invent them."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "departure_airport_id": {"type": "string"},
                "arrival_airport_id": {"type": "string"},
                "date": {
                    "type": "string",
                    "description": "ISO date, e.g. 2026-08-14",
                },
                "airline_id": {"type": "string"},
            },
        },
    },
    {
        "name": "get_flight",
        "description": "Get full details (seats, aircraft, timing) for one specific flight by ID.",
        "input_schema": {
            "type": "object",
            "properties": {"flight_id": {"type": "string"}},
            "required": ["flight_id"],
        },
    },
    {
        "name": "lock_seat",
        "description": (
            "Temporarily lock a seat (Redis TTL lock) before booking, so no one "
            "else can grab it while the user confirms. Always call this BEFORE "
            "create_booking for a specific seat."
        ),
        "input_schema": {
            "type": "object",
            "properties": {"seat_id": {"type": "string"}},
            "required": ["seat_id"],
        },
    },
    {
        "name": "unlock_seat",
        "description": "Release a previously locked seat, e.g. if the user changes their mind.",
        "input_schema": {
            "type": "object",
            "properties": {"seat_id": {"type": "string"}},
            "required": ["seat_id"],
        },
    },
    {
        "name": "create_booking",
        "description": (
            "Create the booking once the user has confirmed flight, seat, and "
            "passenger details. Requires the seat to already be locked."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "flight_id": {"type": "string"},
                "seat_id": {"type": "string"},
                "passengers": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "firstName": {"type": "string"},
                            "lastName": {"type": "string"},
                            "age": {"type": "integer"},
                            "gender": {"type": "string", "enum": ["MALE", "FEMALE", "OTHER"]},
                        },
                        "required": ["firstName", "lastName"],
                    },
                },
            },
            "required": ["flight_id", "seat_id", "passengers"],
        },
    },
    {
        "name": "create_payment",
        "description": "Initiate payment for a confirmed booking.",
        "input_schema": {
            "type": "object",
            "properties": {
                "booking_id": {"type": "string"},
                "payment_method": {
                    "type": "string",
                    "enum": ["CARD", "UPI", "NET_BANKING", "WALLET"],
                },
            },
            "required": ["booking_id", "payment_method"],
        },
    },
    {
        "name": "get_my_bookings",
        "description": "List the current user's existing bookings. Use when they ask 'what have I booked'.",
        "input_schema": {"type": "object", "properties": {}},
    },
    {
        "name": "cancel_booking",
        "description": "Cancel an existing booking by ID. Always confirm with the user before calling this.",
        "input_schema": {
            "type": "object",
            "properties": {"booking_id": {"type": "string"}},
            "required": ["booking_id"],
        },
    },
]


async def execute_tool(client, tool_name: str, tool_input: dict) -> dict:
    """Dispatch a single tool call to the real backend and return a JSON-able result."""

    if tool_name == "search_airports":
        result = await client.list_airports()

    elif tool_name == "search_flights":
        result = await client.search_flights(
            departure_airport_id=tool_input.get("departure_airport_id"),
            arrival_airport_id=tool_input.get("arrival_airport_id"),
            date=tool_input.get("date"),
            airline_id=tool_input.get("airline_id"),
        )

    elif tool_name == "get_flight":
        result = await client.get_flight(tool_input["flight_id"])

    elif tool_name == "lock_seat":
        result = await client.lock_seat(tool_input["seat_id"])

    elif tool_name == "unlock_seat":
        result = await client.unlock_seat(tool_input["seat_id"])

    elif tool_name == "create_booking":
        result = await client.create_booking(
            flight_id=tool_input["flight_id"],
            seat_id=tool_input["seat_id"],
            passengers=tool_input["passengers"],
        )

    elif tool_name == "create_payment":
        result = await client.create_payment(
            booking_id=tool_input["booking_id"],
            payment_method=tool_input["payment_method"],
        )

    elif tool_name == "get_my_bookings":
        result = await client.get_my_bookings()

    elif tool_name == "cancel_booking":
        result = await client.cancel_booking(tool_input["booking_id"])

    else:
        result = {"status_code": 400, "body": {"success": False, "message": f"Unknown tool {tool_name}"}}

    return result