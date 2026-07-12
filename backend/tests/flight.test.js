import request from "supertest";

import app from "../src/app.js";
import prisma from "../src/config/database.js";

describe("Flight API", () => {

  let departureAirport;
  let arrivalAirport;
  let airline;
  let aircraft;
  let flight;

  beforeEach(async () => {

    departureAirport = await prisma.airport.create({
      data: {
        name: "Chennai International Airport",
        code: "MAA",
        city: "Chennai",
        country: "India"
      }
    });

    arrivalAirport = await prisma.airport.create({
      data: {
        name: "Kempegowda International Airport",
        code: "BLR",
        city: "Bengaluru",
        country: "India"
      }
    });

    airline = await prisma.airline.create({
      data: {
        name: "Air India",
        code: "AI"
      }
    });

    aircraft = await prisma.aircraft.create({
      data: {
        model: "Airbus A320",
        registrationNumber: "VT-TEST001",
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

  });

  it("should fetch all flights", async () => {

    const res = await request(app)
      .get("/api/v1/flights");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);

  });

  it("should fetch flight by id", async () => {

    const res = await request(app)
      .get(`/api/v1/flights/${flight.id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(flight.id);

  });

  it("should return 404 for invalid flight", async () => {

    const res = await request(app)
      .get("/api/v1/flights/invalid-id");

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);

  });

});