import prisma from "../../../prisma/client.js";

export const findUserByEmail = async (email) => {
  return prisma.user.findUnique({
    where: {
      email
    }
  });
};


export const createUser = async (data) => {
  return prisma.user.create({
    data
  });
};