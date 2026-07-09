import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const seed = async () => {
  await prisma.$connect();

  console.log("Database connected");

  const adminExists = await prisma.user.findUnique({
    where: {
      email: "admin@skyreserve.com"
    }
  });

  if (!adminExists) {
    await prisma.user.create({
      data: {
        firstName: "Admin",
        lastName: "User",
        email: "admin@skyreserve.com",
        password:
          "$2b$10$examplehashedpassword",
        role: "ADMIN",
        emailVerified: true
      }
    });
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