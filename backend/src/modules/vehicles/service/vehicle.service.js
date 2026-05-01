import Vehicle from '../model/vehicle.model.js';
import { AppError } from '../../../utils/AppError.js';

export async function createVehicle(data) {
  const existing = await Vehicle.findOne({ plateNumber: data.plateNumber.toUpperCase() });
  if (existing) {
    throw AppError.conflict('Vehicle with this plate number already exists');
  }

  const vehicle = await Vehicle.create(data);
  return vehicle;
}

export async function getAllVehicles(filters = {}) {
  const query = { ...filters, isDeleted: { $ne: true } };
  return Vehicle.find(query)
    .populate('vehicleCategoryId', 'name')
    .populate('currentDriverId', 'name phone')
    .sort({ createdAt: -1 });
}

export async function getVehicleById(id) {
  const vehicle = await Vehicle.findOne({ _id: id, isDeleted: { $ne: true } })
    .populate('vehicleCategoryId')
    .populate('currentDriverId');
    
  if (!vehicle) {
    throw AppError.notFound('Vehicle not found');
  }
  return vehicle;
}

export async function updateVehicle(id, data) {
  const vehicle = await Vehicle.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).populate('vehicleCategoryId');

  if (!vehicle) {
    throw AppError.notFound('Vehicle not found');
  }

  return vehicle;
}

export async function deleteVehicle(id) {
  const vehicle = await Vehicle.findByIdAndUpdate(
    id,
    { isDeleted: true, deletedAt: new Date(), status: 'inactive' },
    { new: true }
  );

  if (!vehicle) {
    throw AppError.notFound('Vehicle not found');
  }

  return vehicle;
}
