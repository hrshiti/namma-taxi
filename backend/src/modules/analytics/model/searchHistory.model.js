import mongoose from 'mongoose';

const searchHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    pickup: {
      type: String,
      required: true,
      trim: true,
    },
    drop: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['NAMMATAXI', 'BANGALORE_AIRPORT'],
      default: 'NAMMATAXI',
    },
    device: {
      type: String,
      trim: true,
    },
    ip: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('SearchHistory', searchHistorySchema);
