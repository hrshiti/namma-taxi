import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    bookingRef: {
      type: String,
      unique: true,
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      // Optional for guest bookings
    },
    customerInfo: {
      name: { type: String, required: true },
      email: { type: String },
      phone: { type: String, required: true },
      address: { type: String },
    },
    tripSummary: {
      serviceType: { type: String, required: true },
      tripMode: { type: String, required: true },
      pickupLocation: { type: String, required: true },
      dropLocation: { type: String },
      pickupDate: { type: String, required: true },
      pickupTime: { type: String, required: true },
      returnDate: { type: String },
      distanceKm: { type: Number },
      estimatedDuration: { type: Number },
      quoteSource: { type: String },
    },
    selectedVehicleCategory: {
      categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VehicleCategory',
        required: true,
      },
      name: { type: String, required: true },
    },
    fareDetails: {
      computedFare: { type: Number, required: true }, // Final fare after discount
      originalFare: { type: Number }, // Fare before discount
      discountAmount: { type: Number, default: 0 },
      couponCode: { type: String },
      breakdown: {
        baseFare: Number,
        perKmRate: Number,
        driverAllowance: Number,
      },
    },
    quoteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quote',
    },
    assignedDriver: {
      driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
      name: String,
      phone: String,
      vehicleNumber: String,
      licenseNumber: String,
      assignedAt: Date,
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'pending', 'paid', 'failed', 'refunded'],
      default: 'unpaid',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'online'],
      default: 'online',
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
    },
    refundStatus: {
      type: String,
      enum: ['none', 'pending', 'processed', 'failed', 'not_required', 'manual_review'],
      default: 'none',
    },
    refundId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Refund',
    },
    status: {
      type: String,
      enum: ['new', 'confirmed', 'assigned', 'enroute', 'arrived', 'started', 'completed', 'cancelled'],
      default: 'new',
    },
    statusHistory: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        note: String,
        updatedBy: { type: mongoose.Schema.Types.ObjectId, refPath: 'statusHistory.updatedByModel' },
        updatedByModel: { type: String, enum: ['Staff', 'Customer', 'Driver'] }
      }
    ]
  },
  { timestamps: true }
);

// Indexes for common query patterns
bookingSchema.index({ status: 1, createdAt: -1 });
bookingSchema.index({ 'tripSummary.pickupDate': 1, 'tripSummary.pickupTime': 1 });
bookingSchema.index({ customerId: 1, createdAt: -1 });
bookingSchema.index({ 'assignedDriver.driverId': 1, status: 1 });
bookingSchema.index({ paymentStatus: 1, createdAt: -1 });
bookingSchema.index({ refundStatus: 1, createdAt: -1 });

export default mongoose.model('Booking', bookingSchema);
