import ApiResponse from "../../utils/ApiResponse.js";


import {
  fetchUsers,
  changeUserRole
} from "./admin.service.js";



export const users = async(req,res)=>{


  const data =
    await fetchUsers();


  return res.status(200).json(

    new ApiResponse(
      true,
      "Users fetched successfully",
      data
    )

  );

};




export const updateRole = async(req,res)=>{


  const {
    role
  } = req.body;


  const user =
    await changeUserRole(
      req.params.id,
      role
    );


  return res.status(200).json(

    new ApiResponse(
      true,
      "User role updated",
      user
    )

  );

};