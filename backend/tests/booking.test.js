import request from "supertest";
import bcrypt from "bcrypt";

import app from "../src/app.js";
import prisma from "../src/config/database.js";

describe("Booking API", () => {

  let token;
  let flight;
  let seat;

  beforeEach(async () => {

    const password = await bcrypt.hash("Password@123", 10);

    const user = await prisma.user.create({
      data: {
        firstName: "Madhu",
        lastName: "TV",
        email: "booking@test.com",
        password,
        phone: "9999999999"
      }
    });

    const login = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: "booking@test.com",
        password: "Password@123"
      });

    token = login.body.data.accessToken;

    const departureAirport = await prisma.airport.create({
      data: {
        name: "Chennai Airport",
        code: "MAA",
        city: "Chennai",
        country: "India"
      }
    });

    const arrivalAirport = await prisma.airport.create({
      data: {
        name: "Bangalore Airport",
        code: "BLR",
        city: "Bangalore",
        country: "India"
      }
    });

    const airline = await prisma.airline.create({
      data: {
        name: "Air India",
        code: "AI"
      }
    });

    const aircraft = await prisma.aircraft.create({
      data: {
        model: "A320",
        registrationNumber: "VT-BOOKING",
        totalSeats: 180,
        airlineId: airline.id
      }
    });

    flight = await prisma.flight.create({
      data: {
        flightNumber: "AI104",
        departureTime: new Date("2026-08-23T09:00:00Z"),
        arrivalTime: new Date("2026-08-23T11:30:00Z"),
        airlineId: airline.id,
        aircraftId: aircraft.id,
        departureAirportId: departureAirport.id,
        arrivalAirportId: arrivalAirport.id
      }
    });

    seat = await prisma.flightSeat.create({
      data: {
        seatNumber: "10A",
        flightId: flight.id
      }
    });

  });

  it("should create booking", async () => {

    const res = await request(app)
      .post("/api/v1/bookings")
      .set("Authorization", `Bearer ${token}`)
      .send({
        flightId: flight.id,
        seatId: seat.id,
        passengers: [
          {
            firstName: "Madhu",
            lastName: "TV",
            age: 21,
            gender: "FEMALE"
          }
        ]
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("PENDING");

    const updatedSeat =
      await prisma.flightSeat.findUnique({
        where: {
          id: seat.id
        }
      });

    expect(updatedSeat.status).toBe("LOCKED");

  });

  it("should fetch booking by id", async () => {

    const booking = await prisma.booking.create({
      data: {
        bookingCode: "BK123456",
        totalAmount: 5000,
        userId: (
          await prisma.user.findFirst()
        ).id,
        flightId: flight.id
      }
    });

    const res = await request(app)
      .get(`/api/v1/bookings/${booking.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

  });

  it("should return 404 for invalid booking", async () => {

    const res = await request(app)
      .get("/api/v1/bookings/invalid-id")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);

  });

});