import VehicleCategory from '../model/vehicleCategory.model.js';
import { AppError } from '../../../utils/AppError.js';

export async function createCategory(data) {
  const existing = await VehicleCategory.findOne({ name: data.name });
  if (existing) {
    throw AppError.conflict('Vehicle category with this name already exists');
  }

  const category = await VehicleCategory.create(data);
  return category;
}

export async function getAllCategories(filters = {}) {
  const query = { isDeleted: { $ne: true } };
  if (filters.isActive !== undefined) {
    query.isActive = filters.isActive;
  }
  
  return VehicleCategory.find(query).sort({ sortOrder: 1, name: 1 });
}

export async function getCategoryById(id) {
  const category = await VehicleCategory.findById(id);
  if (!category) {
    throw AppError.notFound('Vehicle category not found');
  }
  return category;
}

export async function updateCategory(id, data) {
  const category = await VehicleCategory.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  if (!category) {
    throw AppError.notFound('Vehicle category not found');
  }

  return category;
}

export async function deleteCategory(id) {
  // Soft delete by setting isDeleted to true
  const category = await VehicleCategory.findByIdAndUpdate(
    id,
    { 
      isDeleted: true, 
      deletedAt: new Date(),
      isActive: false 
    },
    { new: true }
  );

  if (!category) {
    throw AppError.notFound('Vehicle category not found');
  }

  return category;
}
