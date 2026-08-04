"""
Thin wrapper around your EXISTING SkyReserve Node/Express REST API.
Nothing here changes your Node backend - it just calls the endpoints
you already built (flight.routes.js, booking.routes.js, payment.routes.js).

Every call forwards the user's JWT so your existing authMiddleware /
role.middleware.js keep working exactly as they do today.
"""

import httpx
from config import settings


class SkyReserveClient:
    def __init__(self, jwt_token: str):
        self.base_url = settings.SKYRESERVE_BASE_URL
        self.headers = {
            "Authorization": f"Bearer {jwt_token}",
            "Content-Type": "application/json",
        }

    async def _request(self, method: str, path: str, **kwargs):
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.request(
                method, f"{self.base_url}{path}", headers=self.headers, **kwargs
            )
            # Your ApiResponse wrapper always returns JSON, even on errors,
            # so we surface the body rather than just raising blindly.
            try:
                data = resp.json()
            except Exception:
                data = {"success": False, "message": resp.text}
            return {"status_code": resp.status_code, "body": data}

    # ---- Airports (airport.routes.js) ----
    async def list_airports(self):
        return await self._request("GET", "/airports")

    # ---- Flights (flight.routes.js) ----
    async def search_flights(
        self,
        departure_airport_id: str | None = None,
        arrival_airport_id: str | None = None,
        date: str | None = None,
        airline_id: str | None = None,
    ):
        params = {
            "departureAirportId": departure_airport_id,
            "arrivalAirportId": arrival_airport_id,
            "date": date,
            "airlineId": airline_id,
        }
        params = {k: v for k, v in params.items() if v}
        return await self._request("GET", "/flights", params=params)

    async def get_flight(self, flight_id: str):
        return await self._request("GET", f"/flights/{flight_id}")

    # ---- Seat locking (booking.routes.js) ----
    async def lock_seat(self, seat_id: str):
        return await self._request("POST", f"/bookings/lock/{seat_id}")

    async def seat_lock_status(self, seat_id: str):
        return await self._request("GET", f"/bookings/lock/{seat_id}")

    async def unlock_seat(self, seat_id: str):
        return await self._request("POST", f"/bookings/unlock/{seat_id}")

    # ---- Bookings (booking.routes.js) ----
    async def create_booking(self, flight_id: str, seat_id: str, passengers: list):
        payload = {
            "flightId": flight_id,
            "seatId": seat_id,
            "passengers": passengers,
        }
        return await self._request("POST", "/bookings", json=payload)

    async def get_my_bookings(self):
        return await self._request("GET", "/bookings")

    async def cancel_booking(self, booking_id: str):
        return await self._request("PATCH", f"/bookings/{booking_id}/cancel")

    # ---- Payments (payment.routes.js) ----
    async def create_payment(self, booking_id: str, payment_method: str):
        payload = {"bookingId": booking_id, "paymentMethod": payment_method}
        return await self._request("POST", "/payments", json=payload)

    async def pay(self, payment_id: str, transaction_id: str, idempotency_key: str):
        async with httpx.AsyncClient(timeout=15.0) as client:
            headers = {**self.headers, "Idempotency-Key": idempotency_key}
            resp = await client.post(
                f"{self.base_url}/payments/{payment_id}/pay",
                headers=headers,
                json={"transactionId": transaction_id},
            )
            try:
                data = resp.json()
            except Exception:
                data = {"success": False, "message": resp.text}
            return {"status_code": resp.status_code, "body": data}