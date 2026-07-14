import dotenv from "dotenv";
dotenv.config({ path: ".env.test" });

import prisma from "../src/config/database.js";
import redisClient, { connectRedis } from "../src/config/redis.js";

beforeAll(async () => {
  await prisma.$connect();
  await connectRedis();      // <-- ADD THIS
});

beforeEach(async () => {
  await prisma.payment.deleteMany();
  await prisma.bookingPassenger.deleteMany();
  await prisma.flightSeat.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.flight.deleteMany();
  await prisma.aircraft.deleteMany();
  await prisma.airline.deleteMany();
  await prisma.airport.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();

  if (redisClient.isOpen) {
    await redisClient.quit();    // <-- ADD THIS
  }
});