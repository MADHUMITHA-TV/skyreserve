import { validationResult } from "express-validator";

import ApiResponse from "../../utils/ApiResponse.js";

import {
  addFlight,
  fetchFlights,
  fetchFlight,
  editFlight,
  removeFlight
} from "./flight.service.js";

export const create = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const flight = await addFlight(req.body);

  return res.status(201).json(
    new ApiResponse(
      true,
      "Flight created successfully",
      flight
    )
  );
};

export const findAll = async (req, res) => {
  const flights = await fetchFlights();

  return res.status(200).json(
    new ApiResponse(
      true,
      "Flights fetched successfully",
      flights
    )
  );
};

export const findOne = async (req, res) => {
  const flight = await fetchFlight(req.params.id);

  return res.status(200).json(
    new ApiResponse(
      true,
      "Flight fetched successfully",
      flight
    )
  );
};

export const update = async (req, res) => {
  const flight = await editFlight(
    req.params.id,
    req.body
  );

  return res.status(200).json(
    new ApiResponse(
      true,
      "Flight updated successfully",
      flight
    )
  );
};

export const remove = async (req, res) => {
  await removeFlight(req.params.id);

  return res.status(200).json(
    new ApiResponse(
      true,
      "Flight deleted successfully"
    )
  );
};