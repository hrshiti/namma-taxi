import Booking from '../model/booking.model.js';
import Quote from '../../quotes/model/quote.model.js';
import Customer from '../../customers/model/customer.model.js';
import { AppError } from '../../../utils/AppError.js';
import * as authService from '../../auth/service/auth.service.js';
import * as couponService from '../../coupons/service/coupon.service.js';
import Coupon from '../../coupons/model/coupon.model.js';
import { emitGlobal } from '../../../utils/socket.js';

const bookingPopulate = [
  { path: 'customerId', select: 'name phone email profileImage' },
  { path: 'assignedDriver.driverId', select: 'name phone vehicleNumber licenseNumber' },
  { path: 'selectedVehicleCategory.categoryId', select: 'name image seats luggage ac' }
];

function generateBookingRef() {
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  const randomNums = Math.floor(1000 + Math.random() * 9000);
  return `NT-${randomChars}${randomNums}`;
}

export async function createBooking(data) {
  const { quoteId, categoryId, customerInfo, couponCode } = data;

  // 1. Verify quote and get fare details
  const quote = await Quote.findById(quoteId);
  if (!quote) {
    throw AppError.badRequest('Invalid or expired quote');
  }

  const categoryQuote = quote.availableCategories.find(
    (c) => c.vehicleCategoryId.toString() === categoryId
  );

  if (!categoryQuote) {
    throw AppError.badRequest('Selected vehicle category is not available in this quote');
  }

  // 2. Manage Customer (Upsert or use existing ID)
  let customer;
  if (data.customerId) {
    customer = await Customer.findById(data.customerId);
  }
  
  if (!customer) {
    customer = await Customer.findOne({ phone: customerInfo.phone });
    if (!customer) {
      customer = await Customer.create({
        name: customerInfo.name,
        phone: customerInfo.phone,
        email: customerInfo.email,
      });
    }
  }

  // 3. Handle Coupon if provided
  let discountAmount = 0;
  let finalFare = categoryQuote.computedFare;

  if (couponCode) {
    try {
      const coupon = await couponService.validateCoupon(couponCode, categoryQuote.computedFare);
      
      if (coupon.type === 'percentage') {
        discountAmount = Math.floor((categoryQuote.computedFare * coupon.value) / 100);
        if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
          discountAmount = coupon.maxDiscount;
        }
      } else {
        discountAmount = coupon.value;
      }

      // Ensure discount doesn't exceed fare
      discountAmount = Math.min(discountAmount, categoryQuote.computedFare);
      finalFare = categoryQuote.computedFare - discountAmount;

      // Increment usage count
      await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usageCount: 1 } });
    } catch (err) {
      // If coupon is invalid, we could either throw or just ignore it.
      // For production, if the user explicitly sent a code, it's better to fail than to charge full price unexpectedly.
      throw AppError.badRequest(err.message || 'Invalid coupon code');
    }
  }

  // 4. Create Booking
  const bookingRef = generateBookingRef();

  const booking = await Booking.create({
    bookingRef,
    customerId: customer._id,
    customerInfo,
    tripSummary: {
      serviceType: quote.serviceType,
      tripMode: quote.tripMode,
      pickupLocation: quote.pickupLocation,
      dropLocation: quote.dropLocation,
      pickupDate: quote.pickupDate,
      pickupTime: quote.pickupTime,
      returnDate: quote.returnDate,
      distanceKm: quote.distanceKm,
      estimatedDuration: quote.estimatedDuration,
      quoteSource: quote.quoteSource,
    },
    selectedVehicleCategory: {
      categoryId: categoryQuote.vehicleCategoryId,
      name: categoryQuote.categoryName,
    },
    fareDetails: {
      computedFare: finalFare,
      originalFare: categoryQuote.computedFare,
      discountAmount,
      couponCode: couponCode || null,
      breakdown: categoryQuote.breakdown,
    },
    quoteId: quote._id,
    status: 'new',
  });

  // 4. Trigger Notification
  const notificationService = await import('../../notifications/service/notification.service.js');
  notificationService.triggerNotification('booking_created', {
    bookingId: booking._id,
    customerId: customer._id,
    bookingRef: booking.bookingRef,
    customerName: customerInfo.name,
    customerPhone: customerInfo.phone,
    customerEmail: customerInfo.email,
    pickupLocation: quote.pickupLocation,
    amount: finalFare
  }).catch(err => console.error('Notification failed:', err));

  emitGlobal('booking_created', booking);

  return booking;
}

export async function getBookingById(id) {
  const booking = await Booking.findById(id).populate(bookingPopulate);
  if (!booking) {
    throw AppError.notFound('Booking not found');
  }
  return booking;
}

export async function getPublicBookingInfo(id) {
  const booking = await Booking.findById(id)
    .select('bookingRef status selectedVehicleCategory createdAt fareDetails tripSummary')
    .populate('selectedVehicleCategory.categoryId', 'name image seats');
    
  if (!booking) {
    throw AppError.notFound('Booking not found');
  }
  return booking;
}

export async function getAllBookings(filters = {}) {
  const { range, search, status, paymentMethod, ...restFilters } = filters;
  const matchQuery = { ...restFilters };
  const now = new Date();

  // Search logic
  if (search) {
    matchQuery.$or = [
      { bookingRef: { $regex: search, $options: 'i' } },
      { 'customerInfo.name': { $regex: search, $options: 'i' } },
      { 'customerInfo.phone': { $regex: search, $options: 'i' } }
    ];
  }

  // Handle status: single value or comma-separated multiple values
  if (status && typeof status === 'string') {
    const statuses = status.split(',').map(s => s.trim()).filter(Boolean);
    matchQuery.status = statuses.length === 1 ? statuses[0] : { $in: statuses };
  }

  // Handle paymentMethod: single value or comma-separated
  if (paymentMethod && typeof paymentMethod === 'string') {
    const methods = paymentMethod.split(',').map(m => m.trim()).filter(Boolean);
    matchQuery.paymentMethod = methods.length === 1 ? methods[0] : { $in: methods };
  }
  
  // Date-based grouping (Using local date logic)
  const getLocalDateStr = (d) => {
    return d.toLocaleDateString('en-CA'); // Returns YYYY-MM-DD
  };

  if (range === 'today') {
    matchQuery['tripSummary.pickupDate'] = getLocalDateStr(now);
  } else if (range === 'tomorrow') {
    const tomorrowDate = new Date(now);
    tomorrowDate.setDate(now.getDate() + 1);
    matchQuery['tripSummary.pickupDate'] = getLocalDateStr(tomorrowDate);
  } else if (range === 'upcoming') {
    matchQuery['tripSummary.pickupDate'] = { $gte: getLocalDateStr(now) };
    if (!matchQuery.status) {
        matchQuery.status = { $nin: ['completed', 'cancelled'] };
    }
  } else if (range === 'advanced') {
    const tomorrowDate = new Date(now);
    tomorrowDate.setDate(now.getDate() + 1);
    matchQuery['tripSummary.pickupDate'] = { $gte: getLocalDateStr(tomorrowDate) };
    if (!matchQuery.status) {
        matchQuery.status = { $nin: ['completed', 'cancelled'] };
    }
  } else if (range === 'unassigned') {
    matchQuery.status = 'confirmed';
    matchQuery['assignedDriver.driverId'] = { $exists: false };
  }

  // Admin only logic - Aggregate notification counts for each booking
  return Booking.aggregate([
    { $match: matchQuery },
    {
      $lookup: {
        from: 'customers',
        localField: 'customerId',
        foreignField: '_id',
        as: 'customer'
      }
    },
    { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'drivers',
        localField: 'assignedDriver.driverId',
        foreignField: '_id',
        as: 'driver'
      }
    },
    { $unwind: { path: '$driver', preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        notificationCount: { $size: { $ifNull: ['$notifications', []] } }
      }
    },
    { $project: { notifications: 0, 'customer.password': 0, 'driver.password': 0 } },
    { 
      $sort: ['today', 'tomorrow', 'upcoming', 'advanced', 'unassigned'].includes(range)
        ? { 'tripSummary.pickupDate': 1, 'tripSummary.pickupTime': 1 }
        : { createdAt: -1 } 
    }
  ]);
}

const VALID_TRANSITIONS = {
  'new': ['confirmed', 'cancelled'],
  'confirmed': ['assigned', 'cancelled'],
  'assigned': ['enroute', 'cancelled'],
  'enroute': ['arrived', 'cancelled'],
  'arrived': ['started', 'cancelled'],
  'started': ['completed'],
  'completed': [],
  'cancelled': []
};

export async function updateBookingStatus(id, newStatus, updatedBy = null) {
  const booking = await Booking.findById(id);
  if (!booking) {
    throw AppError.notFound('Booking not found');
  }

  const currentStatus = booking.status;
  
  // 1. Validate transition
  if (!VALID_TRANSITIONS[currentStatus]?.includes(newStatus)) {
    throw AppError.badRequest(`Invalid status transition from ${currentStatus} to ${newStatus}`);
  }

  // 2. Perform transition
  booking.status = newStatus;
  booking.statusHistory.push({
    status: newStatus,
    timestamp: new Date(),
    updatedBy: updatedBy?.id,
    updatedByModel: updatedBy?.role === 'staff' || updatedBy?.role === 'admin' ? 'Staff' : (updatedBy?.role === 'driver' ? 'Driver' : 'Customer')
  });

  // 3. Driver Status Synchronization
  if (booking.assignedDriver?.driverId) {
    const Driver = (await import('../../drivers/model/driver.model.js')).default;
    
    // If completed or cancelled, make driver available again IF they have no other active bookings
    if (['completed', 'cancelled'].includes(newStatus)) {
      const activeBookingsCount = await Booking.countDocuments({
        _id: { $ne: booking._id },
        'assignedDriver.driverId': booking.assignedDriver.driverId,
        status: { $in: ['assigned', 'enroute', 'arrived', 'started'] }
      });

      if (activeBookingsCount === 0) {
        await Driver.findByIdAndUpdate(booking.assignedDriver.driverId, { status: 'available' });
      }
    }
  }

  await booking.save();
  
  // 4. Earnings Integration
  if (newStatus === 'completed') {
    const earningService = await import('../../drivers/service/earning.service.js');
    earningService.recordTripEarning(booking._id).catch(err => console.error('Earning creation failed:', err));
  }

  emitGlobal('booking_updated', booking);

  return booking;
}

export async function getBookingsByCustomerId(customerId) {
  return Booking.find({ customerId }).sort({ createdAt: -1 });
}

export async function assignDriver(bookingId, driverId) {
  const Driver = (await import('../../drivers/model/driver.model.js')).default;
  
  const booking = await Booking.findById(bookingId);
  if (!booking) throw AppError.notFound('Booking not found');

  // 1. Validate booking eligibility
  // We only allow assignment for 'confirmed' (first time) or 'assigned' (reassignment)
  // We block 'new' because it must be confirmed first to follow strict lifecycle
  if (!['confirmed', 'assigned'].includes(booking.status)) {
    throw AppError.badRequest(`Booking in ${booking.status} state cannot be dispatched`);
  }

  const driver = await Driver.findById(driverId);
  if (!driver) throw AppError.notFound('Driver not found');
  
  if (!driver.isActive || driver.status !== 'available') {
    throw AppError.badRequest('Driver is not available for assignment');
  }

  // 2. Handle old driver if reassignment
  const oldDriverId = booking.assignedDriver?.driverId;
  if (oldDriverId && oldDriverId.toString() !== driverId.toString()) {
    // If reassigned, check if old driver is now free
    const activeBookingsCount = await Booking.countDocuments({
      _id: { $ne: booking._id },
      'assignedDriver.driverId': oldDriverId,
      status: { $in: ['assigned', 'enroute', 'arrived', 'started'] }
    });

    if (activeBookingsCount === 0) {
      await Driver.findByIdAndUpdate(oldDriverId, { status: 'available' });
    }
  }

  // 3. Update booking assignment
  booking.assignedDriver = {
    driverId: driver._id,
    name: driver.name,
    phone: driver.phone,
    vehicleNumber: driver.vehicleNumber,
    licenseNumber: driver.licenseNumber,
    assignedAt: new Date(),
  };

  const oldStatus = booking.status;
  booking.status = 'assigned';
  
  // Only push history if it's a real status change or first assignment
  if (oldStatus === 'confirmed') {
    booking.statusHistory.push({
      status: 'assigned',
      timestamp: new Date(),
      note: 'Driver assigned for the first time'
    });
  } else if (oldStatus === 'assigned') {
    booking.statusHistory.push({
      status: 'assigned',
      timestamp: new Date(),
      note: 'Driver reassigned by dispatch'
    });
  }

  // 4. Mark new driver busy
  driver.status = 'busy';

  await Promise.all([booking.save(), driver.save()]);

  // 5. Trigger Notification
  const notificationService = await import('../../notifications/service/notification.service.js');
  notificationService.triggerNotification('driver_assigned', {
    bookingId: booking._id,
    customerId: booking.customerId,
    bookingRef: booking.bookingRef,
    customerName: booking.customerInfo.name,
    customerPhone: booking.customerInfo.phone,
    customerEmail: booking.customerInfo.email,
    driverName: driver.name,
    driverPhone: driver.phone,
    vehicleNumber: driver.vehicleNumber
  }).catch(err => console.error('Notification failed:', err));

  emitGlobal('booking_updated', booking);
  emitGlobal('driver_assigned', { bookingId: booking._id, driverId: driver._id });

  return booking;
}

export async function cancelBooking(id, authContext = {}, reason = 'Customer cancelled') {
  const { userId, guestPhone, otp } = authContext;
  const booking = await Booking.findById(id);
  if (!booking) {
    throw AppError.notFound('Booking not found');
  }

  // 1. Ownership / Eligibility Check (Safe parity with initiatePayment)
  const isAdmin = authContext.role === 'admin' || authContext.role === 'staff';
  if (!isAdmin) {
    if (userId) {
      // Authenticated user: must own the booking
      if (!booking.customerId || booking.customerId.toString() !== userId.toString()) {
        throw AppError.forbidden('You do not have permission to cancel this booking');
      }
    } else {
      // Guest flow: must provide phone that matches the booking AND a valid OTP
      if (!guestPhone || booking.customerInfo.phone !== guestPhone) {
        throw AppError.forbidden('Guest verification failed for this booking');
      }

      if (!otp) {
        throw AppError.badRequest('OTP verification required for guest cancellation', 'AUTH_OTP_REQUIRED');
      }

      await authService.verifyOtpOnly({ phone: guestPhone, code: otp });
    }
  }

  const currentStatus = booking.status;

  // 2. Validate if cancellable
  const CANCELLABLE_STATUSES = ['new', 'confirmed', 'assigned', 'enroute', 'arrived'];
  if (!CANCELLABLE_STATUSES.includes(currentStatus)) {
    throw AppError.badRequest(`Booking in ${currentStatus} state cannot be cancelled`);
  }

  // 3. Perform cancellation
  booking.status = 'cancelled';
  booking.statusHistory.push({
    status: 'cancelled',
    timestamp: new Date(),
    note: reason,
    updatedBy: userId,
    updatedByModel: userId ? 'Customer' : null // Simplification for guest
  });

  // 4. Driver Status Synchronization
  if (booking.assignedDriver?.driverId) {
    const Driver = (await import('../../drivers/model/driver.model.js')).default;
    const activeBookingsCount = await Booking.countDocuments({
      _id: { $ne: booking._id },
      'assignedDriver.driverId': booking.assignedDriver.driverId,
      status: { $in: ['assigned', 'enroute', 'arrived', 'started'] }
    });

    if (activeBookingsCount === 0) {
      await Driver.findByIdAndUpdate(booking.assignedDriver.driverId, { status: 'available' });
    }
  }

  await booking.save();

  // 4. Refund Policy Integration
  const paymentService = await import('../../payments/service/payment.service.js');
  await paymentService.initiateRefund(booking._id, reason, userId ? { id: userId, role: 'customer' } : null);

  // Refresh booking to get updated refund status before notification
  const updatedBooking = await Booking.findById(booking._id);

  // 5. Trigger Cancellation Notification
  const notificationService = await import('../../notifications/service/notification.service.js');
  notificationService.triggerNotification('booking_cancelled', {
    bookingId: updatedBooking._id,
    customerId: updatedBooking.customerId,
    bookingRef: updatedBooking.bookingRef,
    customerName: updatedBooking.customerInfo.name,
    customerPhone: updatedBooking.customerInfo.phone,
    customerEmail: updatedBooking.customerInfo.email,
    refundStatus: updatedBooking.refundStatus
  }).catch(err => console.error('Notification failed:', err));

  emitGlobal('booking_cancelled', updatedBooking);

  return updatedBooking;
}

export async function getDriverBookings(driverId) {
  return Booking.find({ 'assignedDriver.driverId': driverId }).sort({ createdAt: -1 });
}

export async function getDriverBookingById(bookingId, driverId) {
  const booking = await Booking.findOne({ _id: bookingId, 'assignedDriver.driverId': driverId });
  if (!booking) throw AppError.notFound('Booking not found or not assigned to you');
  return booking;
}

export async function updateBookingStatusByDriver(bookingId, driverId, newStatus, otp) {
  const booking = await Booking.findOne({ _id: bookingId, 'assignedDriver.driverId': driverId });
  if (!booking) throw AppError.notFound('Booking not found or not assigned to you');

  // Verify OTP only for "started" status
  if (newStatus === 'started') {
    if (!otp) {
      throw AppError.badRequest('Start OTP is required to begin the ride', 'OTP_REQUIRED');
    }
    if (booking.startOTP !== otp) {
      throw AppError.badRequest('Invalid Start OTP. Please check with the customer.', 'INVALID_OTP');
    }
  }

  const DRIVER_ALLOWED_TRANSITIONS = {
    'assigned': ['enroute'],
    'enroute': ['arrived'],
    'arrived': ['started'],
    'started': ['completed']
  };

  const currentStatus = booking.status;
  if (!DRIVER_ALLOWED_TRANSITIONS[currentStatus]?.includes(newStatus)) {
    throw AppError.badRequest(`Driver cannot transition from ${currentStatus} to ${newStatus}`);
  }

  // Reuse the existing status update logic but with driver context
  return updateBookingStatus(bookingId, newStatus, { id: driverId, role: 'driver' });
}

export async function getDashboardStats() {
  const Driver = (await import('../../drivers/model/driver.model.js')).default;
  const Customer = (await import('../../customers/model/customer.model.js')).default;

  const [
    totalBookings,
    pendingBookings,
    completedBookings,
    totalRevenue,
    totalDrivers,
    activeDrivers,
    totalCustomers
  ] = await Promise.all([
    Booking.countDocuments(),
    Booking.countDocuments({ status: { $in: ['new', 'confirmed', 'assigned'] } }),
    Booking.countDocuments({ status: 'completed' }),
    Booking.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$fareDetails.computedFare' } } }
    ]),
    Driver.countDocuments({ isDeleted: false }),
    Driver.countDocuments({ status: 'available', isActive: true }),
    Customer.countDocuments()
  ]);

  return {
    bookings: {
      total: totalBookings,
      pending: pendingBookings,
      completed: completedBookings,
    },
    revenue: totalRevenue[0]?.total || 0,
    drivers: {
      total: totalDrivers,
      active: activeDrivers,
    },
    customers: totalCustomers,
    recentBookings: await Booking.find().sort({ createdAt: -1 }).limit(5).populate('customerId', 'name')
  };
}
