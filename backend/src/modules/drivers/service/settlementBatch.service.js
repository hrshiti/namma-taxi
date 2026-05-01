import SettlementBatch from '../model/settlementBatch.model.js';
import DriverEarning from '../model/earning.model.js';
import { AppError } from '../../../utils/AppError.js';
import mongoose from 'mongoose';

/**
 * Create a new payout batch from selected earnings
 */
export async function createBatch(earningIds, staffId, notes = '') {
  if (!earningIds || !earningIds.length) {
    throw AppError.badRequest('No earnings selected for batch');
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Validate all earnings are pending and NOT already in another batch
    const earnings = await DriverEarning.find({
      _id: { $in: earningIds },
      settlementStatus: 'pending',
      payoutBatchId: { $exists: false }
    }).session(session);

    if (earnings.length !== earningIds.length) {
      throw AppError.badRequest('Some selected earnings are already settled or assigned to another draft batch');
    }

    // 2. Calculate totals
    const totalAmount = earnings.reduce((sum, e) => sum + e.earningAmount, 0);
    const totalTrips = earnings.length;

    // 3. Create batch
    const batch = await SettlementBatch.create([{
      batchRef: await SettlementBatch.generateBatchRef(),
      earningIds,
      totalAmount,
      totalTrips,
      createdBy: staffId,
      notes
    }], { session });

    const newBatch = batch[0];

    // 4. Reserve these earnings for this batch
    await DriverEarning.updateMany(
      { _id: { $in: earningIds } },
      { $set: { payoutBatchId: newBatch._id } },
      { session }
    );

    await session.commitTransaction();
    return newBatch;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

/**
 * Process a batch - Mark all earnings as settled
 */
export async function processBatch(batchId, staffId) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const batch = await SettlementBatch.findById(batchId).session(session);
    if (!batch) throw AppError.notFound('Batch not found');
    if (batch.status !== 'draft') throw AppError.badRequest('Batch already processed or cancelled');

    const now = new Date();

    // 1. Update all earnings to settled
    await DriverEarning.updateMany(
      { _id: { $in: batch.earningIds } },
      { 
        $set: { 
          settlementStatus: 'settled',
          settledAt: now,
          settledBy: staffId,
          payoutBatchId: batch._id
        } 
      },
      { session }
    );

    // 2. Update batch status
    batch.status = 'processed';
    batch.processedBy = staffId;
    batch.processedAt = now;
    await batch.save({ session });

    await session.commitTransaction();
    return batch;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

/**
 * Cancel a draft batch
 */
export async function cancelBatch(batchId) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const batch = await SettlementBatch.findById(batchId).session(session);
    if (!batch) throw AppError.notFound('Batch not found');
    if (batch.status !== 'draft') throw AppError.badRequest('Only draft batches can be cancelled');

    // 1. Release earnings
    await DriverEarning.updateMany(
      { payoutBatchId: batch._id, settlementStatus: 'pending' },
      { $unset: { payoutBatchId: "" } },
      { session }
    );

    // 2. Update batch status
    batch.status = 'cancelled';
    await batch.save({ session });

    await session.commitTransaction();
    return batch;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

/**
 * Get batch details with populated earnings
 */
export async function getBatchDetails(batchId) {
  const batch = await SettlementBatch.findById(batchId)
    .populate('createdBy', 'name')
    .populate('processedBy', 'name')
    .populate({
      path: 'earningIds',
      populate: { path: 'driverId', select: 'name phone bankDetails' }
    });
    
  if (!batch) throw AppError.notFound('Batch not found');
  return batch;
}

/**
 * List batches
 */
export async function listBatches(query = {}) {
  return SettlementBatch.find(query)
    .populate('createdBy', 'name')
    .populate('processedBy', 'name')
    .sort({ createdAt: -1 });
}
