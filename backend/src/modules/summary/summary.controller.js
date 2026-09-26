import ApiResponse from "../../utils/ApiResponse.js";
import prisma from "../../config/database.js";
import { fetchBookingById } from "../booking/booking.service.js";
import { generateBookingSummary } from "../agent/agent.llm.js";

export const getSummary = async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await fetchBookingById(id);

    // Same ownership check pattern as the agent's payment/cancel tools —
    // this endpoint reads booking + payment details, so it needs the
    // same protection those do.
    if (booking.userId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json(new ApiResponse(false, "This booking does not belong to you."));
    }

    // fetchBookingById doesn't include the seat relation (see booking.repository.js),
    // so it's fetched separately here rather than modifying that shared query.
    const seat = await prisma.flightSeat.findFirst({ where: { bookingId: id } });

    const bookingData = {
      bookingCode: booking.bookingCode,
      status: booking.status,
      totalAmount: booking.totalAmount,
      flight: {
        flightNumber: booking.flight.flightNumber,
        airline: booking.flight.airline?.name,
        departureAirport: booking.flight.departureAirport?.city,
        arrivalAirport: booking.flight.arrivalAirport?.city,
        departureTime: booking.flight.departureTime,
        arrivalTime: booking.flight.arrivalTime
      },
      seat: seat ? { seatNumber: seat.seatNumber } : null,
      passengers: booking.passengers.map((p) => ({
        name: `${p.firstName} ${p.lastName}`,
        age: p.age,
        gender: p.gender
      })),
      payment: booking.payment
        ? {
            status: booking.payment.status,
            amount: booking.payment.amount,
            method: booking.payment.paymentMethod,
            transactionId: booking.payment.transactionId
          }
        : null
    };

    const summary = await generateBookingSummary(bookingData);

    if (!summary) {
      return res.status(502).json(new ApiResponse(false, "Couldn't generate a summary right now — try again shortly."));
    }

    return res.status(200).json(new ApiResponse(true, "OK", { summary, bookingData }));
  } catch (err) {
    next(err);
  }
};