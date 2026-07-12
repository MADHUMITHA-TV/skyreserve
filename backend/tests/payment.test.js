import request from "supertest";
import bcrypt from "bcrypt";

import app from "../src/app.js";
import prisma from "../src/config/database.js";

describe("Payment API", () => {

  let token;
  let booking;
  let seat;

  beforeEach(async () => {

    const password = await bcrypt.hash(
      "Password@123",
      10
    );

    const user = await prisma.user.create({
      data: {
        firstName: "Madhu",
        lastName: "TV",
        email: "payment@test.com",
        password,
        phone: "9999999998"
      }
    });

    const login = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: "payment@test.com",
        password: "Password@123"
      });

    token = login.body.data.accessToken;

    const departureAirport =
      await prisma.airport.create({
        data: {
          name: "Chennai Airport",
          code: "MAA",
          city: "Chennai",
          country: "India"
        }
      });

    const arrivalAirport =
      await prisma.airport.create({
        data: {
          name: "Bangalore Airport",
          code: "BLR",
          city: "Bangalore",
          country: "India"
        }
      });

    const airline =
      await prisma.airline.create({
        data: {
          name: "Air India",
          code: "AI"
        }
      });

    const aircraft =
      await prisma.aircraft.create({
        data: {
          model: "A320",
          registrationNumber: "VT-PAYMENT",
          totalSeats: 180,
          airlineId: airline.id
        }
      });

    const flight =
      await prisma.flight.create({
        data: {
          flightNumber: "AI104",
          departureTime: new Date(
            "2026-08-23T09:00:00Z"
          ),
          arrivalTime: new Date(
            "2026-08-23T11:30:00Z"
          ),
          airlineId: airline.id,
          aircraftId: aircraft.id,
          departureAirportId:
            departureAirport.id,
          arrivalAirportId:
            arrivalAirport.id
        }
      });

    booking =
      await prisma.booking.create({
        data: {
          bookingCode: "BKPAY001",
          totalAmount: 5000,
          userId: user.id,
          flightId: flight.id
        }
      });

    seat =
      await prisma.flightSeat.create({
        data: {
          seatNumber: "10A",
          status: "LOCKED",
          flightId: flight.id,
          bookingId: booking.id
        }
      });

  });

  it("should create payment", async () => {

    const res = await request(app)
      .post("/api/v1/payments")
      .set(
        "Authorization",
        `Bearer ${token}`
      )
      .send({
        bookingId: booking.id,
        paymentMethod: "UPI"
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(
      res.body.data.status
    ).toBe("PENDING");

  });

  it("should complete payment", async () => {

    const payment =
      await prisma.payment.create({
        data: {
          bookingId: booking.id,
          amount: 5000,
          paymentMethod: "UPI",
          status: "PENDING"
        }
      });

    const res = await request(app)
      .post(
        `/api/v1/payments/${payment.id}/pay`
      )
      .set(
        "Authorization",
        `Bearer ${token}`
      )
      .send({
        transactionId: "TXN999999"
      });

    expect(res.statusCode).toBe(200);

    expect(
      res.body.data.status
    ).toBe("SUCCESS");

    const updatedBooking =
      await prisma.booking.findUnique({
        where: {
          id: booking.id
        }
      });

    expect(
      updatedBooking.status
    ).toBe("CONFIRMED");

    const updatedSeat =
      await prisma.flightSeat.findUnique({
        where: {
          id: seat.id
        }
      });

    expect(
      updatedSeat.status
    ).toBe("BOOKED");

  });

  it("should refund payment", async () => {

    const payment =
      await prisma.payment.create({
        data: {
          bookingId: booking.id,
          amount: 5000,
          paymentMethod: "UPI",
          status: "SUCCESS",
          transactionId:
            "TXN111111",
          paidAt: new Date()
        }
      });

    await prisma.booking.update({
      where: {
        id: booking.id
      },
      data: {
        status: "CONFIRMED"
      }
    });

    await prisma.flightSeat.update({
      where: {
        id: seat.id
      },
      data: {
        status: "BOOKED"
      }
    });

    const res = await request(app)
      .post(
        `/api/v1/payments/${payment.id}/refund`
      )
      .set(
        "Authorization",
        `Bearer ${token}`
      );

    expect(res.statusCode).toBe(200);

    expect(
      res.body.data.status
    ).toBe("REFUNDED");

    const updatedBooking =
      await prisma.booking.findUnique({
        where: {
          id: booking.id
        }
      });

    expect(
      updatedBooking.status
    ).toBe("CANCELLED");

    const updatedSeat =
      await prisma.flightSeat.findUnique({
        where: {
          id: seat.id
        }
      });

    expect(
      updatedSeat.status
    ).toBe("AVAILABLE");

  });

  it("should not create duplicate payment", async () => {

    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: 5000,
        paymentMethod: "UPI",
        status: "PENDING"
      }
    });

    const res = await request(app)
      .post("/api/v1/payments")
      .set(
        "Authorization",
        `Bearer ${token}`
      )
      .send({
        bookingId: booking.id,
        paymentMethod: "UPI"
      });

    expect(res.statusCode).toBe(409);

  });

});