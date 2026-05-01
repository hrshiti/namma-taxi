import Payment from '../model/payment.model.js';
import Booking from '../../bookings/model/booking.model.js';
import * as razorpayService from './razorpay.service.js';
import { AppError } from '../../../utils/AppError.js';

export const initiatePayment = async (bookingId, authContext = {}) => {
  const { userId, guestPhone } = authContext;
  
  const booking = await Booking.findById(bookingId);
  if (!booking) throw AppError.notFound('Booking not found');

  // 1. Ownership / Eligibility Check
  if (booking.customerId) {
    // Authenticated booking: must own the booking
    if (!userId || booking.customerId.toString() !== userId.toString()) {
      throw AppError.forbidden('You do not have permission to pay for this booking');
    }
  } else {
    // Guest flow: must provide phone that matches the booking
    const normalize = (p) => p ? p.replace(/\D/g, '') : '';
    if (!guestPhone || normalize(booking.customerInfo.phone) !== normalize(guestPhone)) {
      throw AppError.forbidden('Guest verification failed for this booking. Phone mismatch.');
    }
  }

  if (booking.paymentStatus === 'paid') {
    throw AppError.badRequest('Booking is already paid');
  }

  // 2. Create Razorpay Order
  const amount = booking.fareDetails.computedFare;
  const razorpayOrder = await razorpayService.createOrder(amount, `receipt_${booking.bookingRef}`);

  // 3. Create/Update Payment Record
  // We use findOneAndUpdate to handle potential retries or multiple initiation attempts for the same booking
  const payment = await Payment.findOneAndUpdate(
    { bookingId: booking._id, status: { $ne: 'paid' } },
    {
      bookingId: booking._id,
      customerId: booking.customerId || null,
      provider: 'razorpay',
      providerOrderId: razorpayOrder.id,
      amount: amount,
      status: 'created',
      receipt: razorpayOrder.receipt,
    },
    { upsert: true, new: true }
  );

  // Update Booking with latest payment info
  booking.paymentStatus = 'pending';
  booking.paymentId = payment._id;
  await booking.save();

  return {
    orderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    paymentId: payment._id,
    key: process.env.RAZORPAY_KEY_ID,
  };
};

export const verifyPayment = async (paymentData) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentData;

  const isValid = razorpayService.verifySignature(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  );

  if (!isValid) {
    throw AppError.badRequest('Invalid payment signature');
  }

  const payment = await Payment.findOne({ providerOrderId: razorpay_order_id });
  if (!payment) throw AppError.notFound('Payment record not found');

  // Protection: If already paid, just return
  if (payment.status === 'paid') return { payment };

  payment.status = 'paid';
  payment.providerPaymentId = razorpay_payment_id;
  payment.providerSignature = razorpay_signature;
  await payment.save();

  const booking = await Booking.findById(payment.bookingId);
  if (booking) {
    booking.paymentStatus = 'paid';
    await booking.save();

    // Trigger Notification
    const notificationService = await import('../../notifications/service/notification.service.js');
    notificationService.triggerNotification('payment_success', {
      bookingId: booking._id,
      customerId: booking.customerId,
      bookingRef: booking.bookingRef,
      customerName: booking.customerInfo.name,
      customerPhone: booking.customerInfo.phone,
      customerEmail: booking.customerInfo.email,
      amount: payment.amount
    }).catch(err => console.error('Notification failed:', err));
  }

  return { payment, booking };
};

export const handlePaymentFailure = async (orderId, errorData) => {
  const payment = await Payment.findOne({ providerOrderId: orderId });
  
  // Protection: Never downgrade a PAID payment
  if (!payment || payment.status === 'paid') {
    return;
  }

  payment.status = 'failed';
  payment.rawPayload = errorData;
  await payment.save();

  const booking = await Booking.findById(payment.bookingId);
  // Protection: Never downgrade a PAID booking
  if (booking && booking.paymentStatus !== 'paid') {
    booking.paymentStatus = 'failed';
    await booking.save();
  }
};

export const initiateRefund = async (bookingId, reason = 'Customer cancellation', initiatedBy = null) => {
  const Refund = (await import('../model/refund.model.js')).default;
  const booking = await Booking.findById(bookingId).populate('paymentId');
  if (!booking) throw AppError.notFound('Booking not found');

  const payment = booking.paymentId;
  if (!payment || payment.status !== 'paid') {
    // If not paid, no refund required
    booking.refundStatus = 'not_required';
    await booking.save();
    return { status: 'not_required' };
  }

  if (booking.refundStatus === 'processed') {
    throw AppError.badRequest('Refund already processed');
  }

  // Record initial refund entry
  const refundRecord = await Refund.create({
    bookingId: booking._id,
    paymentId: payment._id,
    provider: payment.provider,
    amount: payment.amount,
    currency: payment.currency,
    status: 'pending',
    reason,
    initiatedBy: initiatedBy?.id,
  });

  booking.refundStatus = 'pending';
  booking.refundId = refundRecord._id;
  await booking.save();

  try {
    if (payment.provider === 'razorpay') {
      const rpRefund = await razorpayService.createRefund(payment.providerPaymentId, payment.amount, {
        bookingId: booking._id.toString(),
        bookingRef: booking.bookingRef,
      });

      refundRecord.status = 'processed';
      refundRecord.providerRefundId = rpRefund.id;
      refundRecord.rawPayload = rpRefund;
      await refundRecord.save();

      // Sync Payment and Booking state to 'refunded'
      payment.status = 'refunded';
      await payment.save();

      booking.paymentStatus = 'refunded';
      booking.refundStatus = 'processed';
      await booking.save();

      // Trigger Notification
      const notificationService = await import('../../notifications/service/notification.service.js');
      notificationService.triggerNotification('refund_processed', {
        bookingId: booking._id,
        customerId: booking.customerId,
        bookingRef: booking.bookingRef,
        customerName: booking.customerInfo.name,
        customerPhone: booking.customerInfo.phone,
        customerEmail: booking.customerInfo.email,
        amount: payment.amount
      }).catch(err => console.error('Notification failed:', err));
    } else {
      // Manual review if other providers (unlikely in this stack)
      booking.refundStatus = 'manual_review';
      await booking.save();
    }
  } catch (error) {
    console.error('Refund Failed:', error);
    refundRecord.status = 'failed';
    refundRecord.rawPayload = error;
    await refundRecord.save();

    booking.refundStatus = 'failed';
    // If it's a "payment not found" or "already refunded" error from RP, we might mark as manual_review
    if (error.statusCode === 400) {
      booking.refundStatus = 'manual_review';
    }
    await booking.save();
  }

  return { refund: refundRecord, booking };
};
