import prisma from "../../../prisma/client.js";

export const createFlight = async (data) => {
  return prisma.flight.create({
    data,
    include: {
      airline: true,
      aircraft: true,
      departureAirport: true,
      arrivalAirport: true
    }
  });
};

export const getFlights = async () => {
  return prisma.flight.findMany({
    include: {
      airline: true,
      aircraft: true,
      departureAirport: true,
      arrivalAirport: true
    },
    orderBy: {
      departureTime: "asc"
    }
  });
};

export const getFlightById = async (id) => {
  return prisma.flight.findUnique({
    where: {
      id
    },
    include: {
      airline: true,
      aircraft: true,
      departureAirport: true,
      arrivalAirport: true
    }
  });
};

export const updateFlight = async (id, data) => {
  return prisma.flight.update({
    where: {
      id
    },
    data,
    include: {
      airline: true,
      aircraft: true,
      departureAirport: true,
      arrivalAirport: true
    }
  });
};

export const deleteFlight = async (id) => {
  return prisma.flight.delete({
    where: {
      id
    }
  });
};