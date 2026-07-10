import prisma from "../../../prisma/client.js";


export const createRefreshToken = async(data)=>{
  return prisma.refreshToken.create({
    data
  });
};


export const findRefreshToken = async(token)=>{
  return prisma.refreshToken.findUnique({
    where:{
      token
    },
    include:{
      user:true
    }
  });
};


export const revokeRefreshToken = async(id)=>{
  return prisma.refreshToken.update({
    where:{
      id
    },
    data:{
      revoked:true
    }
  });
};