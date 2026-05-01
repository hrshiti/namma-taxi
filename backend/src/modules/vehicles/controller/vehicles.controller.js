import * as vehicleService from '../service/vehicle.service.js';
import { sendSuccess } from '../../../utils/apiResponse.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';

export const createVehicle = asyncHandler(async (req, res) => {
  const vehicle = await vehicleService.createVehicle(req.body);
  return sendSuccess(res, {
    message: 'Vehicle created successfully',
    data: vehicle,
  });
});

export const getVehicles = asyncHandler(async (req, res) => {
  const vehicles = await vehicleService.getAllVehicles(req.query);
  return sendSuccess(res, {
    message: 'Vehicles retrieved successfully',
    data: vehicles,
  });
});

export const getVehicleById = asyncHandler(async (req, res) => {
  const vehicle = await vehicleService.getVehicleById(req.params.id);
  return sendSuccess(res, {
    data: vehicle,
  });
});

export const updateVehicle = asyncHandler(async (req, res) => {
  const vehicle = await vehicleService.updateVehicle(req.params.id, req.body);
  return sendSuccess(res, {
    message: 'Vehicle updated successfully',
    data: vehicle,
  });
});

export const deleteVehicle = asyncHandler(async (req, res) => {
  await vehicleService.deleteVehicle(req.params.id);
  return sendSuccess(res, {
    message: 'Vehicle deleted successfully',
  });
});
