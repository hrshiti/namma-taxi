import SupportCase from '../model/supportCase.model.js';
import Booking from '../../bookings/model/booking.model.js';
import Staff from '../../staff/model/staff.model.js';
import { AppError } from '../../../utils/AppError.js';
import { triggerNotification } from '../../notifications/service/notification.service.js';

/**
 * Create a new support case
 */
export async function createCase(data, user) {
  const { bookingId, subject, description, category, priority, assignedTo } = data;
  const actor = await resolveActorInfo(user);

  const caseData = {
    subject,
    description,
    category,
    priority,
    createdBy: actor.id,
    createdByName: actor.name,
    createdByRole: actor.role,
    latestActivityAt: new Date()
  };

  if (bookingId) {
    const booking = await Booking.findById(bookingId).lean();
    if (!booking) throw AppError.notFound('Booking not found');
    
    caseData.bookingId = bookingId;
    caseData.bookingRef = booking.bookingRef;
    caseData.customerId = booking.customerId;
    caseData.customerPhone = booking.customerInfo.phone;
  }

  if (assignedTo) {
    caseData.assignedTo = assignedTo;
  }

  const newCase = await SupportCase.create(caseData);

  // Trigger internal notification/log if needed (Future)
  
  return newCase;
}

/**
 * Get cases with filters
 */
export async function getCases(filters = {}) {
  const { status, priority, category, assignedTo, search, bookingId, range = 'all' } = filters;
  
  const query = {};
  
  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (category) query.category = category;
  if (assignedTo) query.assignedTo = assignedTo;
  if (bookingId) query.bookingId = bookingId;
  
  if (search) {
    query.$or = [
      { caseRef: { $regex: search, $options: 'i' } },
      { bookingRef: { $regex: search, $options: 'i' } },
      { customerPhone: { $regex: search, $options: 'i' } },
      { subject: { $regex: search, $options: 'i' } }
    ];
  }

  const dateFilter = getDateFilter(range);
  if (dateFilter.createdAt) query.createdAt = dateFilter.createdAt;

  return SupportCase.find(query)
    .populate('assignedTo', 'name')
    .sort({ latestActivityAt: -1 });
}

/**
 * Get single case by reference
 */
export async function getCaseByRef(caseRef) {
  const supportCase = await SupportCase.findOne({ caseRef })
    .populate('assignedTo', 'name')
    .populate('createdBy', 'name');
  
  if (!supportCase) throw AppError.notFound(`Case ${caseRef} not found`);
  return supportCase;
}

/**
 * Update case status / assignment
 */
export async function updateCase(caseId, updates, user) {
  const supportCase = await SupportCase.findById(caseId);
  if (!supportCase) throw AppError.notFound('Support case not found');

  if (updates.status) {
    supportCase.status = updates.status;
    if (updates.status === 'resolved') {
      const actor = await resolveActorInfo(user);
      supportCase.resolvedBy = actor.id;
      supportCase.resolvedByName = actor.name;
      supportCase.resolvedByRole = actor.role;
      supportCase.resolvedAt = new Date();
    } else if (updates.status === 'closed') {
      supportCase.closedAt = new Date();
    }
  }

  if (updates.assignedTo) {
    supportCase.assignedTo = updates.assignedTo;
  }

  if (updates.priority) {
    supportCase.priority = updates.priority;
  }

  supportCase.latestActivityAt = new Date();
  const updatedCase = await supportCase.save();

  // Trigger notification to customer on status change
  if (updates.status && updatedCase.customerId) {
    await triggerNotification('support_update', {
      customerId: updatedCase.customerId,
      customerPhone: updatedCase.customerPhone,
      bookingId: updatedCase.bookingId,
      bookingRef: updatedCase.bookingRef,
      caseRef: updatedCase.caseRef,
      status: updatedCase.status,
      subject: updatedCase.subject
    });
  }

  return updatedCase;
}

/**
 * Add internal note
 */
export async function addNote(caseId, body, user) {
  const supportCase = await SupportCase.findById(caseId);
  if (!supportCase) throw AppError.notFound('Support case not found');

  const actor = await resolveActorInfo(user);
  
  supportCase.notes.push({
    authorId: actor.id,
    authorName: actor.name,
    authorRole: actor.role,
    body
  });

  supportCase.latestActivityAt = new Date();
  return supportCase.save();
}

/**
 * Get case summary for a booking
 */
export async function getBookingSupportSummary(bookingId) {
  const cases = await SupportCase.find({ bookingId }).lean();
  return {
    total: cases.length,
    open: cases.filter(c => ['open', 'in_progress', 'waiting_customer'].includes(c.status)).length,
    cases: cases.map(c => ({
      caseRef: c.caseRef,
      status: c.status,
      priority: c.priority,
      subject: c.subject
    }))
  };
}

/**
 * Get support health metrics
 */
export async function getSupportMetrics(range = 'all') {
  const dateFilter = getDateFilter(range);
  
  const [statusStats, priorityStats, agingStats] = await Promise.all([
    SupportCase.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    SupportCase.aggregate([
      { $match: { ...dateFilter, status: { $ne: 'closed' } } },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]),
    SupportCase.aggregate([
      { $match: { ...dateFilter, status: { $nin: ['resolved', 'closed'] } } },
      {
        $project: {
          ageHours: {
            $divide: [
              { $subtract: [new Date(), '$createdAt'] },
              3600000
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgAge: { $avg: '$ageHours' },
          staleCount: {
            $sum: { $cond: [{ $gt: ['$ageHours', 48] }, 1, 0] }
          }
        }
      }
    ])
  ]);

  return {
    byStatus: statusStats,
    byPriority: priorityStats,
    aging: agingStats[0] || { avgAge: 0, staleCount: 0 }
  };
}

function getDateFilter(range) {
  const now = new Date();
  const filter = {};

  if (range === 'today') {
    const start = new Date(now.setHours(0, 0, 0, 0));
    filter.createdAt = { $gte: start };
  } else if (range === '7d') {
    const start = new Date(now.setDate(now.getDate() - 7));
    filter.createdAt = { $gte: start };
  } else if (range === '30d') {
    const start = new Date(now.setDate(now.getDate() - 30));
    filter.createdAt = { $gte: start };
  }

  return filter;
}

/**
 * Resolve actor info safely (handles admin/staff diversity)
 */
async function resolveActorInfo(user) {
  const { userId, role } = user;
  
  // Try to find in Staff collection first
  const staff = await Staff.findById(userId).lean();
  if (staff) {
    return { id: staff._id, name: staff.name, role: staff.role };
  }

  // Fallback for Admins not in Staff collection
  if (role === 'admin') {
    return { id: userId, name: 'System Admin', role: 'admin' };
  }

  // Final safety fallback
  return { id: userId, name: 'Unknown Actor', role: role || 'staff' };
}
