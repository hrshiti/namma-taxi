/**
 * src/routes/v1/analytics.routes.js
 *
 * -- PHASE 1 STUB --
 * Routes for the 'analytics' module.
 * Will be fully implemented in Phase 2.
 *
 * NOTE: Do not add real business logic here until the module models, services, and API contracts are implemented in Phase 2.
 */

import { Router } from 'express';
import * as analyticsController from '../../modules/analytics/controller/analytics.controller.js';
import { protect, authorize } from '../../middleware/auth.js';

const router = Router();

// Protect all analytics routes to admin/staff only
router.use(protect, authorize('admin', 'staff'));

// GET /api/v1/analytics/dashboard-summary
router.get('/dashboard-summary', analyticsController.getDashboardSummary);

router.get('/bookings-summary', analyticsController.getBookingsSummary);
router.get('/payments-summary', authorize('admin'), analyticsController.getPaymentsSummary);
router.get('/drivers-summary', analyticsController.getDriversSummary);

export default router;
