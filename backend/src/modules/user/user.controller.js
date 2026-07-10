import {
  validationResult
} from "express-validator";


import ApiResponse from "../../utils/ApiResponse.js";


import {
  getProfile,
  updateProfile
} from "./user.service.js";



export const profile = async(req,res)=>{

  const user =
    await getProfile(
      req.user.id
    );


  return res.status(200).json(
    new ApiResponse(
      true,
      "Profile fetched successfully",
      user
    )
  );

};



export const update = async(req,res)=>{


  const errors =
    validationResult(req);


  if(!errors.isEmpty()){

    return res.status(400).json({

      success:false,

      errors:errors.array()

    });

  }



  const user =
    await updateProfile(
      req.user.id,
      req.body
    );


  return res.status(200).json(

    new ApiResponse(
      true,
      "Profile updated successfully",
      user
    )

  );

};