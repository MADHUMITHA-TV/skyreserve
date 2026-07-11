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

export const getFlightByNumber = async (flightNumber) => {
  return prisma.flight.findUnique({
    where: {
      flightNumber
    }
  });
};

export const getAirlineById = async (id) => {
  return prisma.airline.findUnique({
    where: {
      id
    }
  });
};

export const getAircraftById = async (id) => {
  return prisma.aircraft.findUnique({
    where: {
      id
    }
  });
};

export const getAirportById = async (id) => {
  return prisma.airport.findUnique({
    where: {
      id
    }
  });
};