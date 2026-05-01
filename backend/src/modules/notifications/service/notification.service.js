import Notification from '../model/notification.model.js';

const TEMPLATES = {
  booking_created: (data) => ({
    sms: `Namma Taxi: Booking received! ID: ${data.bookingRef}. Pickup: ${data.pickupLocation}. Total: ₹${data.amount}. We will notify you when a driver is assigned.`,
    emailSubject: `Booking Received - ${data.bookingRef}`,
    emailBody: `Hello ${data.customerName},\n\nWe have received your taxi booking request.\n\nBooking Reference: ${data.bookingRef}\nPickup: ${data.pickupLocation}\nDrop: ${data.dropLocation}\nTotal Amount: ₹${data.amount}\n\nWe are currently looking for a driver and will notify you once assigned.\n\nThank you for choosing Namma Taxi!`
  }),
  payment_success: (data) => ({
    sms: `Namma Taxi: Payment of ₹${data.amount} for booking ${data.bookingRef} was successful. Thank you!`,
    emailSubject: `Payment Successful - ${data.bookingRef}`,
    emailBody: `Hello ${data.customerName},\n\nWe have successfully received your payment of ₹${data.amount} for booking ${data.bookingRef}.\n\nYour ride is now fully settled.\n\nThank you!`
  }),
  driver_assigned: (data) => ({
    sms: `Namma Taxi: Driver assigned! ${data.driverName} (${data.vehicleNumber}) will reach you soon. Call: ${data.driverPhone}.`,
    emailSubject: `Driver Assigned - ${data.bookingRef}`,
    emailBody: `Hello ${data.customerName},\n\nA driver has been assigned to your booking ${data.bookingRef}.\n\nDriver: ${data.driverName}\nPhone: ${data.driverPhone}\nVehicle: ${data.vehicleNumber}\n\nSafe travels!`
  }),
  booking_cancelled: (data) => ({
    sms: `Namma Taxi: Your booking ${data.bookingRef} has been cancelled. Refund status: ${data.refundStatus}.`,
    emailSubject: `Booking Cancelled - ${data.bookingRef}`,
    emailBody: `Hello ${data.customerName},\n\nYour booking ${data.bookingRef} has been cancelled as requested.\n\nRefund Status: ${data.refundStatus}\n\nWe hope to serve you again soon.`
  }),
  refund_processed: (data) => ({
    sms: `Namma Taxi: Refund of ₹${data.amount} for booking ${data.bookingRef} has been processed successfully.`,
    emailSubject: `Refund Processed - ${data.bookingRef}`,
    emailBody: `Hello ${data.customerName},\n\nA refund of ₹${data.amount} for your booking ${data.bookingRef} has been processed.\n\nIt should reflect in your account within 5-7 business days.\n\nThank you.`
  }),
  support_update: (data) => ({
    sms: `Namma Taxi: Support Case ${data.caseRef} status updated to ${data.status.toUpperCase()}. Sub: ${data.subject}`,
    emailSubject: `Support Case Update - ${data.caseRef}`,
    emailBody: `Hello,\n\nYour support case (${data.caseRef}) regarding booking ${data.bookingRef || 'N/A'} has been updated.\n\nNew Status: ${data.status.toUpperCase()}\nSubject: ${data.subject}\n\nOur team is working on your request.\n\nThank you for your patience.`
  })
};

export const triggerNotification = async (eventKey, data) => {
  const template = TEMPLATES[eventKey];
  if (!template) {
    console.warn(`No template found for event: ${eventKey}`);
    return;
  }

  const { customerName, customerPhone, customerEmail, bookingId, customerId } = data;
  const rendered = template(data);

  // 1. Prepare SMS
  if (customerPhone) {
    await sendNotification({
      bookingId,
      customerId,
      channel: 'sms',
      eventKey,
      recipient: customerPhone,
      messageBody: rendered.sms
    });
  }

  // 2. Prepare Email
  if (customerEmail) {
    await sendNotification({
      bookingId,
      customerId,
      channel: 'email',
      eventKey,
      recipient: customerEmail,
      subject: rendered.emailSubject,
      messageBody: rendered.emailBody
    });
  }
};

const sendNotification = async (payload) => {
  const { bookingId, customerId, channel, eventKey, recipient, subject, messageBody } = payload;
  
  // Persist record as queued
  const notification = await Notification.create({
    bookingId,
    customerId,
    channel,
    eventKey,
    recipient,
    subject,
    messageBody,
    status: 'queued'
  });

  try {
    // Check for provider configuration
    const isSmsEnabled = channel === 'sms' && process.env.TWILIO_ACCOUNT_SID;
    const isEmailEnabled = channel === 'email' && process.env.SMTP_HOST;

    if (!isSmsEnabled && !isEmailEnabled) {
      // DEV MODE / SKIPPED
      console.log(`[DEV NOTIFICATION] Channel: ${channel} | Event: ${eventKey} | Recipient: ${recipient}`);
      console.log(`Body: ${messageBody}`);
      
      notification.status = 'skipped';
      notification.errorMessage = 'Provider not configured (Dev Mode)';
      await notification.save();
      return;
    }

    // REAL SENDING LOGIC (Placeholders for real integration)
    if (isSmsEnabled) {
      // Example Twilio logic implementation
      // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      // const msg = await client.messages.create({ body: messageBody, from: process.env.TWILIO_PHONE_NUMBER, to: recipient });
      // notification.providerMessageId = msg.sid;
      // notification.status = 'sent';
      
      // For now, if providers are NOT fully imported/active, we remain truthful:
      notification.status = 'skipped';
      notification.errorMessage = 'SMS provider logic present but not fully activated';
    } else if (isEmailEnabled) {
      // Example Nodemailer logic implementation
      // const transporter = nodemailer.createTransport({...});
      // const info = await transporter.sendMail({ from: process.env.SMTP_FROM, to: recipient, subject, text: messageBody });
      // notification.providerMessageId = info.messageId;
      // notification.status = 'sent';

      // For now, if providers are NOT fully imported/active, we remain truthful:
      notification.status = 'skipped';
      notification.errorMessage = 'Email provider logic present but not fully activated';
    }

    await notification.save();
  } catch (error) {
    console.error(`Failed to send ${channel} notification:`, error);
    notification.status = 'failed';
    notification.errorMessage = error.message;
    await notification.save();
  }
};
