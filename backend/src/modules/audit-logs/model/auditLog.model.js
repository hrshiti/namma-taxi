import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff',
      required: true,
    },
    action: {
      type: String,
      required: true, // e.g., 'CREATE_BOOKING', 'UPDATE_PRICING', 'DELETE_VEHICLE'
    },
    module: {
      type: String,
      required: true, // e.g., 'bookings', 'pricing', 'vehicles'
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    oldData: {
      type: mongoose.Schema.Types.Mixed,
    },
    newData: {
      type: mongoose.Schema.Types.Mixed,
    },
    ipAddress: String,
    userAgent: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Indexes for performance
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ module: 1, action: 1 });
auditLogSchema.index({ createdAt: -1 });

export default mongoose.model('AuditLog', auditLogSchema);
