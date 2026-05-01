import Driver from '../model/driver.model.js';
import { AppError } from '../../../utils/AppError.js';

export async function createDriver(data) {
  const existingDriver = await Driver.findOne({ 
    $or: [{ phone: data.phone }, { licenseNumber: data.licenseNumber }] 
  });
  
  if (existingDriver) {
    throw AppError.badRequest('Driver with this phone or license number already exists');
  }

  const driver = await Driver.create(data);
  return driver;
}

export async function getAllDrivers(filters = {}) {
  const query = { ...filters, isDeleted: { $ne: true } };
  return Driver.find(query).populate('vehicleCategoryId').sort({ createdAt: -1 });
}

export async function getDriverById(id) {
  const driver = await Driver.findOne({ _id: id, isDeleted: { $ne: true } }).populate('vehicleCategoryId');
  if (!driver) {
    throw AppError.notFound('Driver not found');
  }
  return driver;
}

export async function updateDriver(id, data) {
  const driver = await Driver.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  if (!driver) {
    throw AppError.notFound('Driver not found');
  }

  return driver;
}

export async function deleteDriver(id) {
  const driver = await Driver.findByIdAndUpdate(id, { 
    isDeleted: true, 
    deletedAt: new Date(),
    isActive: false 
  }, { new: true });
  
  if (!driver) {
    throw AppError.notFound('Driver not found');
  }
  return driver;
}

export async function getAvailableDrivers() {
  return Driver.find({ isActive: true, status: 'available', isDeleted: { $ne: true } });
}
