import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema(
  {
    plateNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    modelName: {
      type: String,
      required: true,
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
    },
    color: {
      type: String,
      trim: true,
    },
    year: {
      type: Number,
    },
    vehicleCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VehicleCategory',
      required: true,
    },
    currentDriverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
    },
    status: {
      type: String,
      enum: ['active', 'maintenance', 'retired', 'inactive'],
      default: 'active',
    },
    insuranceExpiry: Date,
    permitExpiry: Date,
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
  },
  { timestamps: true }
);

// Indexes for performance
vehicleSchema.index({ vehicleCategoryId: 1 });
vehicleSchema.index({ currentDriverId: 1 });
vehicleSchema.index({ status: 1 });

export default mongoose.model('Vehicle', vehicleSchema);
