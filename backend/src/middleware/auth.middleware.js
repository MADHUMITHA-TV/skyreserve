import jwt from "jsonwebtoken";

import ApiResponse from "../utils/ApiResponse.js";
import config from "../config/index.js";


const authMiddleware = async(req,res,next)=>{

  try {

    const authHeader =
      req.headers.authorization;


    if(
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ){

      return res.status(401).json(
        new ApiResponse(
          false,
          "Authentication required"
        )
      );

    }


    const token =
      authHeader.split(" ")[1];


    const decoded =
      jwt.verify(
        token,
        config.env.jwt.accessSecret
      );


    req.user = decoded;


    next();


  } catch(error){

    return res.status(401).json(
      new ApiResponse(
        false,
        "Invalid or expired token"
      )
    );

  }

};


export default authMiddleware;