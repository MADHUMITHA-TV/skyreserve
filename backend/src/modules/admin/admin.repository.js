import prisma from "../../../prisma/client.js";


export const getAllUsers = async()=>{

  return prisma.user.findMany({

    select:{
      id:true,
      firstName:true,
      lastName:true,
      email:true,
      phone:true,
      role:true,
      status:true,
      createdAt:true
    },

    orderBy:{
      createdAt:"desc"
    }

  });

};



export const updateUserRole = async(
  id,
  role
)=>{

  return prisma.user.update({

    where:{
      id
    },

    data:{
      role
    },

    select:{
      id:true,
      email:true,
      role:true
    }

  });

};