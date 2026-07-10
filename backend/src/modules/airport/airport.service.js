import {

  createAirport,
  getAirports,
  getAirportById,
  updateAirport,
  deleteAirport

} from "./airport.repository.js";



export const addAirport = async(data)=>{

  return createAirport(data);

};



export const fetchAirports = async()=>{

  return getAirports();

};



export const fetchAirport = async(id)=>{

  const airport =
    await getAirportById(id);


  if(!airport){

    throw new Error(
      "Airport not found"
    );

  }


  return airport;

};



export const editAirport = async(id,data)=>{

  return updateAirport(
    id,
    data
  );

};



export const removeAirport = async(id)=>{

  return deleteAirport(id);

};