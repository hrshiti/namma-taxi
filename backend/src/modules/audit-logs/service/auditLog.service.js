import AuditLog from '../model/auditLog.model.js';

export async function logAction(data) {
  try {
    await AuditLog.create(data);
  } catch (error) {
    console.error('Failed to log audit action:', error);
  }
}

export async function getAllLogs(filters = {}, limit = 100, page = 1) {
  const query = {};
  if (filters.userId) query.userId = filters.userId;
  if (filters.module) query.module = filters.module;
  if (filters.action) query.action = filters.action;

  return AuditLog.find(query)
    .populate('userId', 'name role')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip((page - 1) * limit);
}
