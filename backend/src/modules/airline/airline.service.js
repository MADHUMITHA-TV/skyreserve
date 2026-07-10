import {

createAirline,
getAirlines,
getAirlineById,
updateAirline,
deleteAirline

} from "./airline.repository.js";



export const addAirline = async(data)=>{

  return createAirline(data);

};



export const fetchAirlines = async()=>{

  return getAirlines();

};



export const fetchAirline = async(id)=>{

  const airline =
    await getAirlineById(id);


  if(!airline){

    throw new Error(
      "Airline not found"
    );

  }


  return airline;

};



export const editAirline = async(id,data)=>{

  return updateAirline(
    id,
    data
  );

};



export const removeAirline = async(id)=>{

  return deleteAirline(id);

};