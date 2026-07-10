import {
  validationResult
} from "express-validator";


import ApiResponse from "../../utils/ApiResponse.js";


import {

addAirport,
fetchAirports,
fetchAirport,
editAirport,
removeAirport

} from "./airport.service.js";



export const create=async(req,res)=>{

const errors =
validationResult(req);


if(!errors.isEmpty()){

return res.status(400).json({
success:false,
errors:errors.array()
});

}


const airport =
await addAirport(req.body);


res.status(201).json(
new ApiResponse(
true,
"Airport created successfully",
airport
)
);

};




export const findAll=async(req,res)=>{

const airports =
await fetchAirports();


res.status(200).json(
new ApiResponse(
true,
"Airports fetched successfully",
airports
)
);

};




export const findOne=async(req,res)=>{

const airport =
await fetchAirport(
req.params.id
);


res.status(200).json(
new ApiResponse(
true,
"Airport fetched successfully",
airport
)
);

};




export const update=async(req,res)=>{

const airport =
await editAirport(
req.params.id,
req.body
);


res.status(200).json(
new ApiResponse(
true,
"Airport updated successfully",
airport
)
);

};




export const remove=async(req,res)=>{

await removeAirport(
req.params.id
);


res.status(200).json(
new ApiResponse(
true,
"Airport deleted successfully"
)
);

};