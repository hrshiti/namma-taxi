import { Router } from 'express';
import * as auditLogController from '../../modules/audit-logs/controller/auditLog.controller.js';
import { protect, authorize } from '../../middleware/auth.js';

const router = Router();

// Only admins can see audit logs
router.use(protect, authorize('admin'));

router.get('/', auditLogController.getAuditLogs);

export default router;
