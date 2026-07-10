import prisma from "../../../prisma/client.js";


export const findUserById = async(id)=>{

  return prisma.user.findUnique({
    where:{
      id
    },
    select:{
      id:true,
      firstName:true,
      lastName:true,
      email:true,
      phone:true,
      gender:true,
      dateOfBirth:true,
      role:true,
      status:true,
      emailVerified:true,
      createdAt:true,
      updatedAt:true
    }
  });

};



export const updateUser = async(
  id,
  data
)=>{

  return prisma.user.update({
    where:{
      id
    },
    data,
    select:{
      id:true,
      firstName:true,
      lastName:true,
      email:true,
      phone:true,
      gender:true,
      dateOfBirth:true,
      role:true,
      status:true
    }
  });

};