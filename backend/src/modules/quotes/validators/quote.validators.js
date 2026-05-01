import { body, param } from 'express-validator';

export const createQuoteValidator = [
  body('serviceType').isIn(['airport', 'outstation', 'tours', 'local']).withMessage('Invalid service type'),
  body('tripMode').notEmpty().withMessage('Trip mode is required'),
  body('pickupLocation').notEmpty().withMessage('Pickup location is required'),
  body('dropLocation').custom((value, { req }) => {
    if (['airport', 'outstation'].includes(req.body.serviceType) && (!value || value.trim() === '')) {
      throw new Error('Drop location is required for airport and outstation services');
    }
    return true;
  }),
  body('pickupDate').notEmpty().withMessage('Pickup date is required'),
  body('pickupTime').notEmpty().withMessage('Pickup time is required'),
  body('returnDate').optional().isString(),
  body('phoneNumber').optional().isString(),
];

export const quoteIdValidator = [
  param('id').isMongoId().withMessage('Invalid quote ID'),
];
