/**
 * src/routes/v1/index.js
 *
 * Versioned API router — /api/v1/*
 *
 * Register all v1 module routes here.
 * Stub routes are clearly marked as [STUB] so future devs know what needs implementing.
 */

import { Router } from 'express';
import { sendSuccess } from '../../utils/apiResponse.js';

// Active routes
import authRoutes from './auth.routes.js';

// Module routes (stubs — will be implemented in Phase 2+)
import customersRoutes from './customers.routes.js';
import bookingsRoutes from './bookings.routes.js';
import quotesRoutes from './quotes.routes.js';
import pricingRoutes from './pricing.routes.js';
import vehicleCategoriesRoutes from './vehicle-categories.routes.js';
import vehiclesRoutes from './vehicles.routes.js';
import driversRoutes from './drivers.routes.js';
import addressesRoutes from './addresses.routes.js';
import staffRoutes from './staff.routes.js';
import attendanceRoutes from './attendance.routes.js';
import settingsRoutes from './settings.routes.js';
import seoRoutes from './seo.routes.js';
import notificationsRoutes from './notifications.routes.js';
import analyticsRoutes from './analytics.routes.js';
import auditLogsRoutes from './audit-logs.routes.js';
import couponsRoutes from './coupons.routes.js';

import paymentsRoutes from './payments.routes.js';
import driverOpsRoutes from './driver_ops.routes.js';
import financeRoutes from './finance.routes.js';
import supportRoutes from './support.routes.js';
import alertRoutes from './alerts.routes.js';
import uploadRoutes from './upload.routes.js';
import emailTemplatesRoutes from './email-templates.routes.js';
import bannersRoutes from './banners.routes.js';
import postRoutes from './posts.routes.js';
import airportRoutes from './airport.routes.js';
import toursRoutes from './tours.routes.js';
import searchHistoryRoutes from './search-history.routes.js';


const router = Router();

// ── API info endpoint ─────────────────────────────────────────────────────────
router.get('/', (_req, res) => {
  sendSuccess(res, {
    message: 'Namma Taxi API v1',
    data: {
      version: 'v1',
      docs: 'Coming in Phase 2',
      modules: [
        'auth', 'customers', 'bookings', 'quotes', 'pricing',
        'vehicle-categories', 'vehicles', 'drivers', 'addresses',
        'staff', 'attendance', 'settings', 'seo', 'notifications',
        'analytics', 'audit-logs', 'payments',
      ],
    },
  });
});

// ── Route registration ────────────────────────────────────────────────────────
router.use('/auth', authRoutes);
router.use('/customers', customersRoutes);
router.use('/bookings', bookingsRoutes);
router.use('/quotes', quotesRoutes);
router.use('/pricing', pricingRoutes);
router.use('/vehicle-categories', vehicleCategoriesRoutes);
router.use('/vehicles', vehiclesRoutes);
router.use('/drivers', driversRoutes);
router.use('/addresses', addressesRoutes);
router.use('/staff', staffRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/settings', settingsRoutes);
router.use('/seo', seoRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/audit-logs', auditLogsRoutes);
router.use('/payments', paymentsRoutes);
router.use('/driver', driverOpsRoutes);
router.use('/finance', financeRoutes);
router.use('/support', supportRoutes);
router.use('/alerts', alertRoutes);
router.use('/upload', uploadRoutes);
router.use('/coupons', couponsRoutes);
router.use('/email-templates', emailTemplatesRoutes);
router.use('/banners', bannersRoutes);
router.use('/posts', postRoutes);
router.use('/airport', airportRoutes);
router.use('/search-history', searchHistoryRoutes);
router.use('/tours', toursRoutes);


export default router;
