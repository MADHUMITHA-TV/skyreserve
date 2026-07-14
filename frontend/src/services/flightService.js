import flights from "../mocks/flights";

const delay = (ms) =>
  new Promise((resolve) =>
    setTimeout(resolve, ms)
  );

export const getFlights = async () => {
  await delay(700);

  return flights;
};

export const getFlightById = async (id) => {
  await delay(500);

  return flights.find(
    (flight) => flight.id === id
  );
};