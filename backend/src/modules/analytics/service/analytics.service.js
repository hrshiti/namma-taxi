import Booking from '../../bookings/model/booking.model.js';
import Driver from '../../drivers/model/driver.model.js';
import Payment from '../../payments/model/payment.model.js';
import Refund from '../../payments/model/refund.model.js';
import SupportCase from '../../support/model/supportCase.model.js';

/**
 * Get dashboard metrics summary
 */
export async function getDashboardStats(range = 'all') {
  const dateFilter = getDateFilter(range);
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const [
    bookingStats,
    paymentStats,
    refundStats,
    driverStats,
    recentBookings,
    settlementStats,
    planningStats,
    payoutBatchCount,
    supportStats,
    alertSummary,
    customerCount,
    vehicleCount
  ] = await Promise.all([
    // 1. Booking counts by status
    Booking.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),

    // 2. Revenue (Gross Paid) - Include both paid and refunded since both were captured
    Payment.aggregate([
      { $match: { ...dateFilter, status: { $in: ['paid', 'refunded'] } } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]),

    // 3. Refunds
    Refund.aggregate([
      { $match: { ...dateFilter, status: 'processed' } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]),

    // 4. Driver Activity
    Driver.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),

    // 5. Recent Activity - Respect the selected range
    Booking.find(dateFilter).sort({ createdAt: -1 }).limit(10).lean(),

    // 6. Settlement Summary - Respect selected range
    (await import('../../drivers/model/earning.model.js')).default.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$settlementStatus', total: { $sum: '$earningAmount' } } }
    ]),

    // 7. Dispatch/Planning Snapshot
    Booking.aggregate([
      { 
        $facet: {
          unassignedUpcoming: [
            { $match: { 
              status: 'confirmed', 
              'assignedDriver.driverId': { $exists: false },
              'tripSummary.pickupDate': { $gte: todayStr }
            } },
            { $count: 'count' }
          ],
          late: [
            { $match: { 
              status: { $nin: ['completed', 'cancelled'] },
              'tripSummary.pickupDate': { $lt: todayStr }
            } },
            { $count: 'count' }
          ]
        }
      }
    ]),

    // 8. Payout Batch Stats
    (await import('../../drivers/model/settlementBatch.model.js')).default.countDocuments(dateFilter),

    // 9. Support Case Stats
    SupportCase.aggregate([
      { 
        $facet: {
          open: [
            { $match: { ...dateFilter, status: { $in: ['open', 'in_progress', 'waiting_customer'] } } },
            { $count: 'count' }
          ],
          stale: [
            { 
              $match: { 
                ...dateFilter,
                status: { $in: ['open', 'in_progress', 'waiting_customer'] },
                createdAt: { $lt: new Date(Date.now() - 48 * 3600000) }
              } 
            },
            { $count: 'count' }
          ]
        }
      }
    ]),

    // 10. Alert Summary
    (await import('../../alerts/service/alert.service.js')).getAlertSummary(range),

    // 11. Customer Count
    (await import('../../customers/model/customer.model.js')).default.countDocuments({ isDeleted: { $ne: true } }),

    // 12. Vehicle Count
    (await import('../../vehicles/model/vehicle.model.js')).default.countDocuments({ isDeleted: { $ne: true } })
  ]);

  // Format booking stats
  const bookings = { total: 0 };
  bookingStats.forEach(s => {
    bookings[s._id] = s.count;
    bookings.total += s.count;
  });

  const revenue = {
    gross: paymentStats[0]?.total || 0,
    refunded: refundStats[0]?.total || 0,
    net: (paymentStats[0]?.total || 0) - (refundStats[0]?.total || 0),
    count: paymentStats[0]?.count || 0,
    refundCount: refundStats[0]?.count || 0
  };

  const drivers = { total: 0 };
  driverStats.forEach(s => {
    drivers[s._id] = s.count;
    drivers.total += s.count;
  });

  const settlements = {
    pending: settlementStats.find(s => s._id === 'pending')?.total || 0,
    settled: settlementStats.find(s => s._id === 'settled')?.total || 0,
    payoutBatches: payoutBatchCount
  };

  const planning = {
    unassignedUpcoming: planningStats[0]?.unassignedUpcoming[0]?.count || 0,
    late: planningStats[0]?.late[0]?.count || 0
  };

  const support = {
    open: supportStats[0]?.open[0]?.count || 0,
    stale: supportStats[0]?.stale[0]?.count || 0
  };

  // Calculate Finance Health Metrics
  const finance = {
    realizedNet: revenue.net - settlements.settled,
    pendingLiability: settlements.pending,
    exceptionCount: 0
  };

  // Quick exception count (Simplified for dashboard performance)
  // 1. Completed + Paid + No Earning
  // 2. Refunded + Payout Settled
  const exceptions = await Booking.aggregate([
    { $match: dateFilter },
    {
      $lookup: {
        from: 'driverearnings',
        localField: '_id',
        foreignField: 'bookingId',
        as: 'earning'
      }
    },
    {
      $lookup: {
        from: 'refunds',
        localField: '_id',
        foreignField: 'bookingId',
        as: 'refund'
      }
    },
    {
      $project: {
        isMissingEarning: {
          $and: [
            { $eq: ['$status', 'completed'] },
            { $eq: ['$paymentStatus', 'paid'] },
            { $eq: [{ $size: { $ifNull: ['$earning', []] } }, 0] }
          ]
        },
        isRefundedButPaid: {
          $and: [
            { $eq: [{ $arrayElemAt: ['$refund.status', 0] }, 'processed'] },
            { $eq: [{ $arrayElemAt: ['$earning.settlementStatus', 0] }, 'settled'] }
          ]
        }
      }
    },
    {
      $match: {
        $or: [{ isMissingEarning: true }, { isRefundedButPaid: true }]
      }
    },
    { $count: 'count' }
  ]);

  // 13. Revenue Trend (Daily for the last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const trendData = await Payment.aggregate([
    { $match: { createdAt: { $gte: thirtyDaysAgo }, status: 'paid' } },
    {
      $group: {
        _id: { $dateToString: { format: "%b %d", date: "$createdAt" } },
        total: { $sum: "$amount" },
        rawDate: { $first: "$createdAt" }
      }
    },
    { $sort: { rawDate: 1 } },
    { $project: { date: "$_id", value: "$total", _id: 0 } }
  ]);

  finance.exceptionCount = exceptions[0]?.count || 0;

  return {
    bookings,
    revenue,
    revenueTrend: trendData,
    drivers,
    settlements,
    planning,
    support,
    alerts: alertSummary,
    finance,
    recentBookings,
    customerCount,
    vehicleCount,
    range
  };
}

/**
 * Get detailed bookings summary
 */
export async function getBookingsSummary(range = 'all') {
  const dateFilter = getDateFilter(range);

  const [byStatus, byCategory] = await Promise.all([
    Booking.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    Booking.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$selectedVehicleCategory.name', count: { $sum: 1 } } }
    ])
  ]);

  return { byStatus, byCategory };
}

/**
 * Get detailed payments summary
 */
export async function getPaymentsSummary(range = 'all') {
  const dateFilter = getDateFilter(range);

  const [byStatus, byMethod] = await Promise.all([
    Payment.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$amount' } } }
    ]),
    Payment.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$method', count: { $sum: 1 }, total: { $sum: '$amount' } } }
    ])
  ]);

  return { byStatus, byMethod };
}

/**
 * Get detailed drivers summary
 */
export async function getDriversSummary() {
  const [byStatus, byCategory] = await Promise.all([
    Driver.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    Driver.aggregate([
      {
        $lookup: {
          from: 'vehiclecategories',
          localField: 'vehicleCategoryId',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: '$category' },
      { $group: { _id: '$category.name', count: { $sum: 1 } } }
    ])
  ]);

  return { byStatus, byCategory };
}

/**
 * Helper to generate date filter based on range
 */
function getDateFilter(range) {
  const now = new Date();
  const filter = {};

  if (range === 'today') {
    const start = new Date(now.setHours(0, 0, 0, 0));
    filter.createdAt = { $gte: start };
  } else if (range === '7d') {
    const start = new Date(now.setDate(now.getDate() - 7));
    filter.createdAt = { $gte: start };
  } else if (range === '30d') {
    const start = new Date(now.setDate(now.getDate() - 30));
    filter.createdAt = { $gte: start };
  }

  return filter;
}
