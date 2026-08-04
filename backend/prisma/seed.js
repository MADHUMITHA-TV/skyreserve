import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const seed = async () => {
  await prisma.$connect();
  console.log("Database connected");

  const adminExists = await prisma.user.findUnique({
    where: { email: "admin@skyreserve.com" }
  });

  if (!adminExists) {
    const hashedPassword = await bcrypt.hash("Admin@123", 10);
    await prisma.user.create({
      data: {
        firstName: "Admin",
        lastName: "User",
        email: "admin@skyreserve.com",
        password: hashedPassword,
        role: "ADMIN",
        emailVerified: true
      }
    });
  }

  const airportData = [
    { name: "Chennai International Airport", code: "MAA", city: "Chennai", country: "India" },
    { name: "Indira Gandhi International Airport", code: "DEL", city: "Delhi", country: "India" },
    { name: "Kempegowda International Airport", code: "BLR", city: "Bengaluru", country: "India" },
    { name: "Chhatrapati Shivaji Maharaj International Airport", code: "BOM", city: "Mumbai", country: "India" }
  ];

  const airports = {};
  for (const a of airportData) {
    const airport = await prisma.airport.upsert({
      where: { code: a.code },
      update: {},
      create: a
    });
    airports[a.code] = airport;
  }
  console.log("Airports seeded");

  const airline = await prisma.airline.upsert({
    where: { code: "SR" },
    update: {},
    create: { name: "SkyReserve Airways", code: "SR" }
  });
  console.log("Airline seeded");

  const aircraft = await prisma.aircraft.upsert({
    where: { registrationNumber: "VT-SR101" },
    update: {},
    create: {
      model: "Airbus A320",
      registrationNumber: "VT-SR101",
      totalSeats: 12,
      status: "ACTIVE",
      airlineId: airline.id
    }
  });
  console.log("Aircraft seeded");

  const flightRoutes = [
    {
      flightNumber: "SR101",
      departureAirport: airports["MAA"],
      arrivalAirport: airports["DEL"],
      departureTime: new Date("2026-08-14T06:00:00Z"),
      arrivalTime: new Date("2026-08-14T08:45:00Z")
    },
    {
      flightNumber: "SR102",
      departureAirport: airports["DEL"],
      arrivalAirport: airports["MAA"],
      departureTime: new Date("2026-08-14T18:00:00Z"),
      arrivalTime: new Date("2026-08-14T20:45:00Z")
    },
    {
      flightNumber: "SR201",
      departureAirport: airports["MAA"],
      arrivalAirport: airports["BLR"],
      departureTime: new Date("2026-08-15T09:00:00Z"),
      arrivalTime: new Date("2026-08-15T10:00:00Z")
    }
  ];

  for (const f of flightRoutes) {
    const existing = await prisma.flight.findUnique({
      where: { flightNumber: f.flightNumber }
    });

    if (existing) continue;

    const flight = await prisma.flight.create({
      data: {
        flightNumber: f.flightNumber,
        departureTime: f.departureTime,
        arrivalTime: f.arrivalTime,
        status: "SCHEDULED",
        airlineId: airline.id,
        aircraftId: aircraft.id,
        departureAirportId: f.departureAirport.id,
        arrivalAirportId: f.arrivalAirport.id
      }
    });

    const rows = ["A", "B", "C"];
    const seatData = [];
    for (let row = 1; row <= 4; row++) {
      for (const letter of rows) {
        seatData.push({
          seatNumber: `${row}${letter}`,
          status: "AVAILABLE",
          flightId: flight.id
        });
      }
    }
    await prisma.flightSeat.createMany({ data: seatData });

    console.log(`Flight ${f.flightNumber} + seats seeded`);
  }

  console.log("Seed completed");
};

seed()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });