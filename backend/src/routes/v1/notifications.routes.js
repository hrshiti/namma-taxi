import { Router } from 'express';
import * as notificationController from '../../modules/notifications/controller/notification.controller.js';
import { protect, authorize } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();

// User routes (any protected user can see their own)
router.get('/my', protect, asyncHandler(notificationController.getMyNotifications));

// Admin/Staff routes
router.use(authorize('admin', 'staff'));
router.get('/', asyncHandler(notificationController.getAllNotifications));
router.get('/booking/:bookingId', asyncHandler(notificationController.getBookingNotifications));

export default router;
