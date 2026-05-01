import mongoose from 'mongoose';

const airportDataSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ['DISTANCE', 'ROUTE', 'CONTACT'],
      index: true,
    },
    // For DISTANCE and ROUTE
    from: { type: String, trim: true },
    to: { type: String, trim: true },
    // For DISTANCE
    distance: { type: String, trim: true },
    duration: { type: String, trim: true },
    // For ROUTE
    priceStart: { type: String, trim: true },
    description: { type: String, trim: true },
    // For CONTACT
    department: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true },
    hours: { type: String, trim: true },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('AirportData', airportDataSchema);
