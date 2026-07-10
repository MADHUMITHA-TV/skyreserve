import {
validationResult
} from "express-validator";


import ApiResponse from "../../utils/ApiResponse.js";


import {

addAircraft,
fetchAircrafts,
fetchAircraft,
editAircraft,
removeAircraft

} from "./aircraft.service.js";




export const create = async(req,res)=>{


const errors =
validationResult(req);


if(!errors.isEmpty()){

return res.status(400).json({

success:false,
errors:errors.array()

});

}


const aircraft =
await addAircraft(
req.body
);



return res.status(201).json(

new ApiResponse(
true,
"Aircraft created successfully",
aircraft
)

);

};





export const findAll = async(req,res)=>{


const aircrafts =
await fetchAircrafts();



return res.status(200).json(

new ApiResponse(
true,
"Aircrafts fetched successfully",
aircrafts
)

);

};





export const findOne = async(req,res)=>{


const aircraft =
await fetchAircraft(
req.params.id
);



return res.status(200).json(

new ApiResponse(
true,
"Aircraft fetched successfully",
aircraft
)

);

};





export const update = async(req,res)=>{


const aircraft =
await editAircraft(
req.params.id,
req.body
);



return res.status(200).json(

new ApiResponse(
true,
"Aircraft updated successfully",
aircraft
)

);

};





export const remove = async(req,res)=>{


await removeAircraft(
req.params.id
);



return res.status(200).json(

new ApiResponse(
true,
"Aircraft deleted successfully"
)

);

};