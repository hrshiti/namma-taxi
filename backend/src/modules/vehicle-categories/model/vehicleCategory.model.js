import mongoose from 'mongoose';

const vehicleCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
    },
    seats: {
      type: Number,
      required: true,
      min: 1,
    },
    luggage: {
      type: Number,
      required: true,
      min: 0,
    },
    ac: {
      type: Boolean,
      default: true,
    },
    image: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    baseDisplayPrice: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model('VehicleCategory', vehicleCategorySchema);
