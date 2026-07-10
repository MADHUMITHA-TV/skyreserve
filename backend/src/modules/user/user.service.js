import {
  findUserById,
  updateUser
} from "./user.repository.js";


export const getProfile = async(userId)=>{

  const user =
    await findUserById(userId);


  if(!user){

    throw new Error(
      "User not found"
    );

  }


  return user;

};



export const updateProfile = async(
  userId,
  data
)=>{

  return updateUser(
    userId,
    data
  );

};