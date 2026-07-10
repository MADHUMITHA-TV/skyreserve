import prisma from "../../../prisma/client.js";


export const createAirline = async(data)=>{

  return prisma.airline.create({
    data
  });

};



export const getAirlines = async()=>{

  return prisma.airline.findMany({

    orderBy:{
      createdAt:"desc"
    }

  });

};



export const getAirlineById = async(id)=>{

  return prisma.airline.findUnique({

    where:{
      id
    }

  });

};



export const updateAirline = async(id,data)=>{

  return prisma.airline.update({

    where:{
      id
    },

    data

  });

};



export const deleteAirline = async(id)=>{

  return prisma.airline.delete({

    where:{
      id
    }

  });

};