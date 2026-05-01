import { Router } from 'express';
import * as bookingController from '../../modules/bookings/controller/booking.controller.js';
import * as validators from '../../modules/bookings/validators/booking.validators.js';
import { validate } from '../../middleware/validate.js';
import { protect, authorize, optionalAuth } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();

// Public routes (guest booking)
router.post(
  '/',
  optionalAuth,
  validators.createBookingValidator,
  validate,
  asyncHandler(bookingController.createBooking)
);

// We allow fetching a specific booking status by ID publicly (PII stripped)
router.get(
  '/:id/status',
  validators.bookingIdValidator,
  validate,
  asyncHandler(bookingController.getPublicBooking)
);

router.post(
  '/:id/cancel',
  optionalAuth,
  validators.bookingIdValidator,
  validate,
  asyncHandler(bookingController.cancelBooking)
);

// Customer route
router.get(
  '/my',
  protect,
  authorize('customer'),
  asyncHandler(bookingController.getMyBookings)
);

// Admin routes
router.use(protect, authorize('admin', 'staff'));

router.get('/stats', asyncHandler(bookingController.getDashboardStats));
router.get('/', validators.listBookingsValidator, validate, asyncHandler(bookingController.getAllBookings));
router.get('/export', authorize('admin'), validators.listBookingsValidator, validate, asyncHandler(bookingController.exportBookings));

// Full booking detail is protected
router.get(
  '/:id/audit',
  validators.bookingIdValidator,
  validate,
  asyncHandler(bookingController.getBookingAudit)
);

router.get(
  '/:id',
  validators.bookingIdValidator,
  validate,
  asyncHandler(bookingController.getBooking)
);

router.patch(
  '/:id/status',
  validators.updateStatusValidator,
  validate,
  asyncHandler(bookingController.updateBookingStatus)
);

router.patch(
  '/:id/assign-driver',
  validators.bookingIdValidator,
  validate,
  asyncHandler(bookingController.assignDriver)
);

// Dispatch Assistance
import * as dispatchController from '../../modules/bookings/controller/dispatch.controller.js';
router.get('/:id/recommendations', asyncHandler(dispatchController.getRecommendations));
router.get('/:id/conflicts', asyncHandler(dispatchController.getConflicts));

export default router;
