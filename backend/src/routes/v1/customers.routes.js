import { Router } from 'express';
import * as customerController from '../../modules/customers/controller/customer.controller.js';
import { protect, authorize } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();

// Customer routes
router.get('/me', protect, authorize('customer'), asyncHandler(customerController.getMe));
router.patch('/me', protect, authorize('customer'), asyncHandler(customerController.updateMe));

// Admin routes
router.get('/', protect, authorize('admin', 'staff'), asyncHandler(customerController.getAllCustomers));
router.patch('/:id', protect, authorize('admin'), asyncHandler(customerController.adminUpdateCustomer));

export default router;
