import request from "supertest";
import bcrypt from "bcrypt";

import app from "../src/app.js";
import prisma from "../src/config/database.js";

describe("Flight API", () => {

  let departureAirport;
  let arrivalAirport;
  let airline;
  let aircraft;
  let flight;
  let token;

  beforeEach(async () => {

    // Create admin user
    const hashedPassword = await bcrypt.hash("password123", 10);

    await prisma.user.create({
      data: {
        firstName: "Admin",
        lastName: "User",
        email: "admin@test.com",
        password: hashedPassword,
        role: "ADMIN"
      }
    });

    // Login and get JWT token
    const login = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: "admin@test.com",
        password: "password123"
      });
    console.log(login.statusCode);
console.log(login.body);
    token = login.body.data.accessToken;

    // Create airports
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

    // Create airline
    airline = await prisma.airline.create({
      data: {
        name: "Air India",
        code: "AI"
      }
    });

    // Create aircraft
    aircraft = await prisma.aircraft.create({
      data: {
        model: "Airbus A320",
        registrationNumber: "VT-TEST001",
        totalSeats: 180,
        airlineId: airline.id
      }
    });

    // Create flight
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

  it("should create a flight", async () => {
  const res = await request(app)
    .post("/api/v1/flights")
    .set("Authorization", `Bearer ${token}`)
    .send({
      flightNumber: "AI105",
      departureTime: "2026-08-24T09:00:00Z",
      arrivalTime: "2026-08-24T11:30:00Z",
      airlineId: airline.id,
      aircraftId: aircraft.id,
      departureAirportId: departureAirport.id,
      arrivalAirportId: arrivalAirport.id
    });

  expect(res.statusCode).toBe(201);
  expect(res.body.success).toBe(true);
  expect(res.body.data.flightNumber).toBe("AI105");
});

it("should not create duplicate flight number", async () => {
  const res = await request(app)
    .post("/api/v1/flights")
    .set("Authorization", `Bearer ${token}`)
    .send({
      flightNumber: "AI104", // already exists
      departureTime: "2026-08-24T09:00:00Z",
      arrivalTime: "2026-08-24T11:30:00Z",
      airlineId: airline.id,
      aircraftId: aircraft.id,
      departureAirportId: departureAirport.id,
      arrivalAirportId: arrivalAirport.id
    });

  expect(res.statusCode).toBe(400);
  expect(res.body.success).toBe(false);
});
it("should update flight", async () => {
  const res = await request(app)
  
    .put(`/api/v1/flights/${flight.id}`)
    .set("Authorization", `Bearer ${token}`)
    .send({
      status: "DELAYED"
    });

  expect(res.statusCode).toBe(200);
  expect(res.body.success).toBe(true);
  expect(res.body.data.status).toBe("DELAYED");
});

it("should return 404 while updating invalid flight", async () => {
  const res = await request(app)
    .put("/api/v1/flights/invalid-id")
    .set("Authorization", `Bearer ${token}`)
    .send({
      status: "DELAYED"
    });

  expect(res.statusCode).toBe(404);
  expect(res.body.success).toBe(false);
});

it("should delete flight", async () => {
  const res = await request(app)
    .delete(`/api/v1/flights/${flight.id}`)
    .set("Authorization", `Bearer ${token}`);

  expect(res.statusCode).toBe(200);
  expect(res.body.success).toBe(true);

  const deleted = await prisma.flight.findUnique({
    where: {
      id: flight.id
    }
  });

  expect(deleted).toBeNull();
});

it("should return 404 while deleting invalid flight", async () => {
  const res = await request(app)
    .delete("/api/v1/flights/invalid-id")
    .set("Authorization", `Bearer ${token}`)

  expect(res.statusCode).toBe(404);
  expect(res.body.success).toBe(false);
});

it("should reject invalid arrival time", async () => {
  const res = await request(app)
    .put(`/api/v1/flights/${flight.id}`)
    .set("Authorization", `Bearer ${token}`)
    .send({
      departureTime: "2026-08-24T12:00:00Z",
      arrivalTime: "2026-08-24T10:00:00Z"
    });

  expect(res.statusCode).toBe(400);
  expect(res.body.success).toBe(false);
});

it("should reject same departure and arrival airport", async () => {
  const res = await request(app)
    .put(`/api/v1/flights/${flight.id}`)
    .set("Authorization", `Bearer ${token}`)
    .send({
      departureAirportId: departureAirport.id,
      arrivalAirportId: departureAirport.id
    });

  expect(res.statusCode).toBe(400);
  expect(res.body.success).toBe(false);
});

});