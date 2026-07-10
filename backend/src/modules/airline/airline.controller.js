import {
validationResult
} from "express-validator";


import ApiResponse from "../../utils/ApiResponse.js";


import {

addAirline,
fetchAirlines,
fetchAirline,
editAirline,
removeAirline

} from "./airline.service.js";



export const create=async(req,res)=>{


const errors =
validationResult(req);


if(!errors.isEmpty()){

return res.status(400).json({
success:false,
errors:errors.array()
});

}


const airline =
await addAirline(
req.body
);


return res.status(201).json(

new ApiResponse(
true,
"Airline created successfully",
airline
)

);

};




export const findAll=async(req,res)=>{


const airlines =
await fetchAirlines();


return res.status(200).json(

new ApiResponse(
true,
"Airlines fetched successfully",
airlines
)

);

};




export const findOne=async(req,res)=>{


const airline =
await fetchAirline(
req.params.id
);


return res.status(200).json(

new ApiResponse(
true,
"Airline fetched successfully",
airline
)

);

};




export const update=async(req,res)=>{


const airline =
await editAirline(
req.params.id,
req.body
);


return res.status(200).json(

new ApiResponse(
true,
"Airline updated successfully",
airline
)

);

};




export const remove=async(req,res)=>{


await removeAirline(
req.params.id
);


return res.status(200).json(

new ApiResponse(
true,
"Airline deleted successfully"
)

);

};