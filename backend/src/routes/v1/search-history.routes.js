import { Router } from 'express';
import * as searchHistoryController from '../../modules/analytics/controller/searchHistory.controller.js';
import { protect, authorize } from '../../middleware/auth.js';

const router = Router();

// Public route to log search (can be used by any user)
router.post('/log', searchHistoryController.logSearch);

// Protected routes for admin to view/manage history
router.get('/', protect, authorize('admin', 'staff'), searchHistoryController.getHistories);
router.delete('/:id', protect, authorize('admin', 'staff'), searchHistoryController.deleteHistory);

export default router;
