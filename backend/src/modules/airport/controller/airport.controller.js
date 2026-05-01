import * as airportService from '../service/airport.service.js';
import { sendSuccess } from '../../../utils/apiResponse.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';

export const getData = asyncHandler(async (req, res) => {
  const data = await airportService.getAllData(req.query.type);
  return sendSuccess(res, { data });
});

export const createData = asyncHandler(async (req, res) => {
  const item = await airportService.createData(req.body);
  return sendSuccess(res, { message: 'Item created successfully', data: item });
});

export const updateData = asyncHandler(async (req, res) => {
  const item = await airportService.updateData(req.params.id, req.body);
  return sendSuccess(res, { message: 'Item updated successfully', data: item });
});

export const deleteData = asyncHandler(async (req, res) => {
  await airportService.deleteData(req.params.id);
  return sendSuccess(res, { message: 'Item deleted successfully' });
});
