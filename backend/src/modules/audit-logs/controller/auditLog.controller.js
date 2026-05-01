import * as auditLogService from '../service/auditLog.service.js';
import { sendSuccess } from '../../../utils/apiResponse.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';

export const getAuditLogs = asyncHandler(async (req, res) => {
  const { limit, page, userId, module, action } = req.query;
  const logs = await auditLogService.getAllLogs(
    { userId, module, action },
    parseInt(limit) || 100,
    parseInt(page) || 100
  );
  
  return sendSuccess(res, {
    message: 'Audit logs retrieved successfully',
    data: logs,
  });
});
