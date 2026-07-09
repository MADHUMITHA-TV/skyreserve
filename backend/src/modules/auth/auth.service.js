import bcrypt from "bcrypt";

import {
  findUserByEmail,
  createUser
} from "./auth.repository.js";


export const registerUser = async ({
  firstName,
  lastName,
  email,
  password
}) => {

  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new Error("Email already registered");
  }


  const hashedPassword = await bcrypt.hash(
    password,
    10
  );


  const user = await createUser({
    firstName,
    lastName,
    email,
    password: hashedPassword
  });


  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email
  };
};