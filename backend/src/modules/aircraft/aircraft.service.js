import {

createAircraft,
getAircrafts,
getAircraftById,
updateAircraft,
deleteAircraft

} from "./aircraft.repository.js";



export const addAircraft = async(data)=>{

  return createAircraft(data);

};



export const fetchAircrafts = async()=>{

  return getAircrafts();

};



export const fetchAircraft = async(id)=>{

  const aircraft =
    await getAircraftById(id);


  if(!aircraft){

    throw new Error(
      "Aircraft not found"
    );

  }


  return aircraft;

};



export const editAircraft = async(id,data)=>{

  return updateAircraft(
    id,
    data
  );

};



export const removeAircraft = async(id)=>{

  return deleteAircraft(id);

};