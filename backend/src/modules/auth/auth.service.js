import bcrypt from "bcrypt";

import {
  findUserByEmail,
  createUser
} from "./auth.repository.js";

import {
  generateAccessToken
} from "./jwt.util.js";
import {
  generateRefreshToken
} from "./refreshToken.service.js";

export const registerUser = async ({
  firstName,
  lastName,
  email,
  password
}) => {

  const existingUser =
    await findUserByEmail(email);


  if (existingUser) {
    throw new Error(
      "Email already registered"
    );
  }


  const hashedPassword =
    await bcrypt.hash(password,10);


  const user =
    await createUser({
      firstName,
      lastName,
      email,
      password: hashedPassword
    });


  return {
    id:user.id,
    firstName:user.firstName,
    lastName:user.lastName,
    email:user.email
  };
};



export const loginUser = async ({
  email,
  password
}) => {

  const user =
    await findUserByEmail(email);


  if(!user){
    const error = new Error("Invalid credentials");
  error.statusCode = 401;
  throw error;
  }


  const isPasswordValid =
    await bcrypt.compare(
      password,
      user.password
    );


  if(!isPasswordValid){
    const error = new Error("Invalid credentials");
error.statusCode = 401;
throw error;
  }


  const accessToken =
    generateAccessToken(user);

  const refreshToken =
  await generateRefreshToken(user);


  return {
  user:{
    id:user.id,
    firstName:user.firstName,
    lastName:user.lastName,
    email:user.email,
    role:user.role
  },
  accessToken,
  refreshToken
};
};