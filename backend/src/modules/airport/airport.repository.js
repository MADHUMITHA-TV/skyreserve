import prisma from "../../../prisma/client.js";


export const createAirport = async(data)=>{

  return prisma.airport.create({
    data
  });

};


export const getAirports = async()=>{

  return prisma.airport.findMany({

    orderBy:{
      createdAt:"desc"
    }

  });

};


export const getAirportById = async(id)=>{

  return prisma.airport.findUnique({

    where:{
      id
    }

  });

};


export const updateAirport = async(id,data)=>{

  return prisma.airport.update({

    where:{
      id
    },

    data

  });

};


export const deleteAirport = async(id)=>{

  return prisma.airport.delete({

    where:{
      id
    }

  });

};