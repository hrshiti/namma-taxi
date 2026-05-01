import { Router } from 'express';
import * as vehicleCategoryController from '../../modules/vehicle-categories/controller/vehicleCategory.controller.js';
import * as validators from '../../modules/vehicle-categories/validators/vehicleCategory.validators.js';
import { validate } from '../../middleware/validate.js';
import { protect, authorize } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();

// Public routes
router.get('/', asyncHandler(vehicleCategoryController.getAllCategories));

// Admin routes
router.use(protect, authorize('admin', 'staff'));

router.post(
  '/',
  validators.createCategoryValidator,
  validate,
  asyncHandler(vehicleCategoryController.createCategory)
);

router.get(
  '/:id',
  validators.categoryIdValidator,
  validate,
  asyncHandler(vehicleCategoryController.getCategory)
);

router.patch(
  '/:id',
  validators.updateCategoryValidator,
  validate,
  asyncHandler(vehicleCategoryController.updateCategory)
);

router.delete(
  '/:id',
  validators.categoryIdValidator,
  validate,
  asyncHandler(vehicleCategoryController.deleteCategory)
);

export default router;
