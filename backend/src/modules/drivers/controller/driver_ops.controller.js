import * as bookingService from '../../bookings/service/booking.service.js';
import { sendSuccess } from '../../../utils/apiResponse.js';

export async function getDriverBookings(req, res) {
  const driverId = req.user.userId;
  const bookings = await bookingService.getDriverBookings(driverId);
  return sendSuccess(res, {
    message: 'Assigned bookings retrieved',
    data: bookings,
  });
}

export async function getDriverBookingDetail(req, res) {
  const driverId = req.user.userId;
  const booking = await bookingService.getDriverBookingById(req.params.id, driverId);
  return sendSuccess(res, {
    data: booking,
  });
}

export async function updateBookingStatus(req, res) {
  const driverId = req.user.userId;
  const { status, otp } = req.body;
  const booking = await bookingService.updateBookingStatusByDriver(req.params.id, driverId, status, otp);
  return sendSuccess(res, {
    message: `Booking status updated to ${status}`,
    data: booking,
  });
}
