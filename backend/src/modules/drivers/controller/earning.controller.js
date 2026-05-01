import * as earningService from '../service/earning.service.js';
import { sendSuccess } from '../../../utils/apiResponse.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { generateCSV, sendCSVResponse } from '../../../utils/csvExport.js';

/**
 * Get driver earnings (Driver view)
 */
export const getMyEarnings = asyncHandler(async (req, res) => {
  const driverId = req.user.id;
  const earnings = await earningService.getDriverEarnings(driverId);
  const summary = await earningService.getDriverEarningsSummary(driverId);
  
  const Driver = (await import('../model/driver.model.js')).default;
  const driver = await Driver.findById(driverId).select('bankDetails');
  const hasBankDetails = !!(driver?.bankDetails?.accountNumber || driver?.bankDetails?.upiId);

  return sendSuccess(res, {
    data: {
      earnings,
      summary,
      hasBankDetails
    }
  });
});

/**
 * Get all earnings (Admin view)
 */
export const getAllEarnings = asyncHandler(async (req, res) => {
  const { driverId, status } = req.query;
  const query = {};
  if (driverId) query.driverId = driverId;
  if (status) query.settlementStatus = status;

  const DriverEarning = (await import('../model/earning.model.js')).default;
  const earnings = await DriverEarning.find(query)
    .populate('driverId', 'name phone')
    .sort({ createdAt: -1 });

  return sendSuccess(res, { data: earnings });
});

export const exportEarnings = asyncHandler(async (req, res) => {
  const { driverId, status } = req.query;
  const query = {};
  if (driverId) query.driverId = driverId;
  if (status) query.settlementStatus = status;

  const DriverEarning = (await import('../model/earning.model.js')).default;
  const earnings = await DriverEarning.find(query)
    .populate('driverId', 'name phone')
    .sort({ createdAt: -1 });
  
  const columns = [
    { label: 'Booking Ref', key: 'bookingRef' },
    { label: 'Driver Name', key: 'driverId.name' },
    { label: 'Trip Fare', key: 'tripFare' },
    { label: 'Earning Amount', key: 'earningAmount' },
    { label: 'Settlement Status', key: 'settlementStatus' },
    { label: 'Settled At', key: 'settledAt' },
    { label: 'Notes', key: 'notes' },
    { label: 'Created At', key: 'createdAt' }
  ];

  const csv = generateCSV(earnings, columns);
  return sendCSVResponse(res, csv, 'settlements');
});

/**
 * Settle an earning (Admin action)
 */
export const settleEarning = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { notes } = req.body;
  const staffId = req.user.id;

  const earning = await earningService.settleEarning(id, staffId, notes);

  return sendSuccess(res, {
    message: 'Earning record marked as settled',
    data: earning
  });
});
