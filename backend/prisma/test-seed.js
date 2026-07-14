import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


async function main() {

  console.log("Starting test seed...");


  // Create test user
  const user = await prisma.user.upsert({

    where: {
      email: "test@test.com"
    },

    update: {},

    create: {
      firstName: "Test",
      lastName: "User",
      email: "test@test.com",
      password: "hashedpassword",
      role: "CUSTOMER",
      emailVerified: true
    }

  });


  console.log("User ready:", user.email);



  // Create airline
  const airline = await prisma.airline.upsert({

    where: {
      code: "AI"
    },

    update: {},

    create: {
      name: "Air India",
      code: "AI"
    }

  });


  console.log("Airline ready:", airline.code);



  // Create departure airport
  const departureAirport = await prisma.airport.upsert({

    where: {
      code: "MAA"
    },

    update: {},

    create: {

      name: "Chennai International Airport",

      code: "MAA",

      city: "Chennai",

      country: "India"

    }

  });



  // Create arrival airport
  const arrivalAirport = await prisma.airport.upsert({

    where: {
      code: "DEL"
    },

    update: {},

    create: {

      name: "Indira Gandhi International Airport",

      code: "DEL",

      city: "Delhi",

      country: "India"

    }

  });


  console.log("Airports ready");



  // Create aircraft
  const aircraft = await prisma.aircraft.upsert({

    where: {
      registrationNumber: "VT-TEST01"
    },

    update: {},

    create: {

      model: "Boeing 737",

      registrationNumber: "VT-TEST01",

      totalSeats: 180,

      airlineId: airline.id

    }

  });


  console.log("Aircraft ready");



  // Create flight
  const flight = await prisma.flight.upsert({

    where: {
      flightNumber: "AI101"
    },

    update: {},

    create: {

      flightNumber: "AI101",

      departureTime: new Date(
        "2026-08-20T09:00:00Z"
      ),

      arrivalTime: new Date(
        "2026-08-20T11:30:00Z"
      ),


      status: "SCHEDULED",


      airlineId: airline.id,


      aircraftId: aircraft.id,


      departureAirportId: departureAirport.id,


      arrivalAirportId: arrivalAirport.id

    }

  });


  console.log("Flight ready:", flight.flightNumber);



  console.log("✅ Test seed completed successfully");

}



main()

  .catch((error) => {

    console.error("❌ Seed failed:");

    console.error(error);

    process.exit(1);

  })


  .finally(async () => {

    await prisma.$disconnect();

  });