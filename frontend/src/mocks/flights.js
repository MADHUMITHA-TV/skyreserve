const flights = [
  {
    id: "1",
    flightNumber: "AI104",

    airline: {
      id: "1",
      name: "Air India",
      code: "AI",
    },

    aircraft: {
      id: "1",
      model: "Airbus A320",
    },

    departureAirport: {
      id: "1",
      code: "MAA",
      name: "Chennai International Airport",
      city: "Chennai",
    },

    arrivalAirport: {
      id: "2",
      code: "BLR",
      name: "Kempegowda International Airport",
      city: "Bengaluru",
    },

    departureTime: "2026-08-20T09:00:00",

    arrivalTime: "2026-08-20T10:10:00",

    duration: "1h 10m",

    price: 4699,

    availableSeats: 42,

    status: "SCHEDULED",
  },

  {
    id: "2",

    flightNumber: "6E312",

    airline: {
      id: "2",
      name: "IndiGo",
      code: "6E",
    },

    aircraft: {
      id: "2",
      model: "Airbus A321",
    },

    departureAirport: {
      id: "1",
      code: "MAA",
      city: "Chennai",
    },

    arrivalAirport: {
      id: "2",
      code: "BLR",
      city: "Bengaluru",
    },

    departureTime: "2026-08-20T11:30:00",

    arrivalTime: "2026-08-20T12:40:00",

    duration: "1h 10m",

    price: 3999,

    availableSeats: 19,

    status: "SCHEDULED",
  },

  {
    id: "3",

    flightNumber: "UK822",

    airline: {
      id: "3",
      name: "Vistara",
      code: "UK",
    },

    aircraft: {
      id: "3",
      model: "Boeing 737",

    },

    departureAirport: {
      id: "1",
      code: "MAA",
      city: "Chennai",
    },

    arrivalAirport: {
      id: "2",
      code: "BLR",
      city: "Bengaluru",
    },

    departureTime: "2026-08-20T17:15:00",

    arrivalTime: "2026-08-20T18:25:00",

    duration: "1h 10m",

    price: 5599,

    availableSeats: 8,

    status: "SCHEDULED",
  },
];

export default flights;