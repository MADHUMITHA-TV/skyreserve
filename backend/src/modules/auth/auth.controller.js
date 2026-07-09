import {
  validationResult
} from "express-validator";

import {
  registerUser
} from "./auth.service.js";

import ApiResponse from "../../utils/ApiResponse.js";


export const register = async (req,res)=>{

  const errors = validationResult(req);

  if(!errors.isEmpty()){
    return res.status(400).json({
      success:false,
      errors:errors.array()
    });
  }


  const user = await registerUser(req.body);


  return res.status(201).json(
    new ApiResponse(
      true,
      "User registered successfully",
      user
    )
  );
};