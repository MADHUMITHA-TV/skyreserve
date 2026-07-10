import jwt from "jsonwebtoken";
import crypto from "crypto";

import {
  createRefreshToken,
  findRefreshToken,
  revokeRefreshToken
} from "./refreshToken.repository.js";


export const generateRefreshToken = async(user)=>{

  const token =
    jwt.sign(
      {
        id:user.id
      },
      process.env.JWT_REFRESH_SECRET,
      {
        expiresIn:
          process.env.JWT_REFRESH_EXPIRES
      }
    );


  const savedToken =
    await createRefreshToken({
      token,
      userId:user.id,
      expiresAt:
        new Date(
          Date.now()+7*24*60*60*1000
        )
    });


  return savedToken.token;
};



export const verifyRefreshToken = async(token)=>{

  const storedToken =
    await findRefreshToken(token);


  if(
    !storedToken ||
    storedToken.revoked
  ){
    throw new Error(
      "Invalid refresh token"
    );
  }


  jwt.verify(
    token,
    process.env.JWT_REFRESH_SECRET
  );


  return storedToken.user;
};



export const revokeToken = async(token)=>{

  const storedToken =
    await findRefreshToken(token);


  if(storedToken){
    await revokeRefreshToken(
      storedToken.id
    );
  }
};