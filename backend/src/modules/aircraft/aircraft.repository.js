import prisma from "../../../prisma/client.js";


export const createAircraft = async(data)=>{

  return prisma.aircraft.create({

    data,

    include:{
      airline:true
    }

  });

};



export const getAircrafts = async()=>{

  return prisma.aircraft.findMany({

    include:{
      airline:true
    },

    orderBy:{
      createdAt:"desc"
    }

  });

};



export const getAircraftById = async(id)=>{

  return prisma.aircraft.findUnique({

    where:{
      id
    },

    include:{
      airline:true
    }

  });

};



export const updateAircraft = async(id,data)=>{

  return prisma.aircraft.update({

    where:{
      id
    },

    data

  });

};



export const deleteAircraft = async(id)=>{

  return prisma.aircraft.delete({

    where:{
      id
    }

  });

};