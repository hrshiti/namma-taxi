import * as bookingService from '../service/booking.service.js';
import { sendSuccess } from '../../../utils/apiResponse.js';
import { generateCSV, sendCSVResponse } from '../../../utils/csvExport.js';

export async function createBooking(req, res) {
  const customerId = req.user?.userId;
  const booking = await bookingService.createBooking({ ...req.body, customerId });
  return sendSuccess(res, {
    status: 201,
    message: 'Booking created successfully',
    data: booking,
  });
}

export async function getBooking(req, res) {
  const booking = await bookingService.getBookingById(req.params.id);
  return sendSuccess(res, {
    message: 'Booking retrieved',
    data: booking,
  });
}

export async function getPublicBooking(req, res) {
  const booking = await bookingService.getPublicBookingInfo(req.params.id);
  return sendSuccess(res, {
    message: 'Booking status retrieved',
    data: booking,
  });
}

export async function getAllBookings(req, res) {
  const bookings = await bookingService.getAllBookings(req.query);
  return sendSuccess(res, {
    message: 'All bookings retrieved',
    data: bookings,
  });
}

export async function exportBookings(req, res) {
  const bookings = await bookingService.getAllBookings(req.query);
  
  const columns = [
    { label: 'Booking Ref', key: 'bookingRef' },
    { label: 'Created At', key: 'createdAt' },
    { label: 'Pickup Date', key: 'tripSummary.pickupDate' },
    { label: 'Pickup Time', key: 'tripSummary.pickupTime' },
    { label: 'Customer Name', key: 'customerInfo.name' },
    { label: 'Customer Phone', key: 'customerInfo.phone' },
    { label: 'Service Type', key: 'tripSummary.serviceType' },
    { label: 'Trip Mode', key: 'tripSummary.tripMode' },
    { label: 'Vehicle Category', key: 'selectedVehicleCategory.name' },
    { label: 'Fare', key: 'fareDetails.computedFare' },
    { label: 'Booking Status', key: 'status' },
    { label: 'Payment Status', key: 'paymentStatus' },
    { label: 'Refund Status', key: 'refundStatus' },
    { label: 'Assigned Driver', key: 'assignedDriver.name' },
    { label: 'Driver Phone', key: 'assignedDriver.phone' },
    { label: 'Quote Source', key: 'tripSummary.quoteSource' }
  ];

  const csv = generateCSV(bookings, columns);
  return sendCSVResponse(res, csv, 'bookings');
}

export async function updateBookingStatus(req, res) {
  const booking = await bookingService.updateBookingStatus(
    req.params.id, 
    req.body.status,
    { id: req.user.userId, role: req.user.role }
  );
  return sendSuccess(res, {
    message: 'Booking status updated',
    data: booking,
  });
}

export async function getMyBookings(req, res) {
  const bookings = await bookingService.getBookingsByCustomerId(req.user.userId);
  return sendSuccess(res, {
    message: 'Customer bookings retrieved',
    data: bookings,
  });
}

import * as auditService from '../service/audit.service.js';

export async function getBookingAudit(req, res) {
  const audit = await auditService.getBookingAuditTrail(req.params.id);
  return sendSuccess(res, {
    message: 'Booking audit trail retrieved',
    data: audit,
  });
}

export async function assignDriver(req, res) {
  const { driverId } = req.body;
  const booking = await bookingService.assignDriver(req.params.id, driverId);
  return sendSuccess(res, {
    message: 'Driver assigned successfully',
    data: booking,
  });
}

export async function cancelBooking(req, res) {
  const { reason, phone, otp } = req.body;
  const authContext = {
    userId: req.user?.userId,
    guestPhone: phone,
    otp,
    role: req.user?.role
  };
  const booking = await bookingService.cancelBooking(req.params.id, authContext, reason);
  return sendSuccess(res, {
    message: 'Booking cancelled successfully',
    data: booking,
  });
}

export async function getDashboardStats(req, res) {
  const stats = await bookingService.getDashboardStats();
  return sendSuccess(res, {
    message: 'Dashboard stats retrieved',
    data: stats,
  });
}
