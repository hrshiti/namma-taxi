import { body, param, query } from 'express-validator';

export const listBookingsValidator = [
  query('status').optional().isString(),
  query('paymentStatus').optional().isIn(['unpaid', 'pending', 'paid', 'failed', 'refunded']),
  query('refundStatus').optional().isIn(['none', 'pending', 'processed', 'failed', 'not_required', 'manual_review']),
  query('range').optional().isIn(['today', 'tomorrow', 'upcoming', 'unassigned', 'advanced', 'all']),
  query('search').optional().isString().trim(),
];

export const createBookingValidator = [
  body('quoteId').isMongoId().withMessage('Invalid quote ID'),
  body('categoryId').isMongoId().withMessage('Invalid category ID'),
  body('customerInfo').isObject().withMessage('Customer info is required'),
  body('customerInfo.name').notEmpty().withMessage('Customer name is required'),
  body('customerInfo.phone').notEmpty().withMessage('Customer phone is required'),
  body('customerInfo.email').optional().isEmail().withMessage('Valid email required'),
];

export const bookingIdValidator = [
  param('id').isMongoId().withMessage('Invalid booking ID'),
];

export const updateStatusValidator = [
  param('id').isMongoId().withMessage('Invalid booking ID'),
  body('status')
    .isIn(['new', 'confirmed', 'assigned', 'enroute', 'arrived', 'started', 'completed', 'cancelled'])
    .withMessage('Invalid status'),
];
