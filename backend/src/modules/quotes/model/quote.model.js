import mongoose from 'mongoose';

const quoteSchema = new mongoose.Schema(
  {
    serviceType: {
      type: String,
      enum: ['airport', 'outstation', 'tours', 'local'],
      required: true,
    },
    tripMode: {
      type: String,
      // For airport: pickup/drop
      // For outstation: oneway/roundtrip
      // For tours: 1day_100km, etc.
      required: true,
    },
    pickupLocation: {
      type: String,
      required: true,
    },
    dropLocation: {
      type: String,
    },
    pickupDate: {
      type: String,
      required: true,
    },
    pickupTime: {
      type: String,
      required: true,
    },
    returnDate: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    
    // Route metadata from map provider or fallback estimation
    distanceKm: {
      type: Number,
    },
    estimatedDuration: {
      type: Number, // in minutes
    },
    quoteSource: {
      type: String,
      enum: ['provider', 'fallback', 'package'],
      default: 'fallback',
    },
    
    // The engine computes the available categories and their fares
    availableCategories: [
      {
        vehicleCategoryId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'VehicleCategory',
        },
        categoryName: String,
        seats: Number,
        luggage: Number,
        ac: Boolean,
        image: String,
        baseDisplayPrice: Number,
        computedFare: Number,
        breakdown: {
          baseFare: Number,
          perKmRate: Number,
          driverAllowance: Number,
        },
      },
    ],
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// TTL index to automatically delete quotes after they expire (e.g., 30 mins)
quoteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('Quote', quoteSchema);
