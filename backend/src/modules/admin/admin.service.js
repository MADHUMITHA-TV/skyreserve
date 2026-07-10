import {
  getAllUsers,
  updateUserRole
} from "./admin.repository.js";


export const fetchUsers = async()=>{

  return getAllUsers();

};



export const changeUserRole = async(
  id,
  role
)=>{

  return updateUserRole(
    id,
    role
  );

};