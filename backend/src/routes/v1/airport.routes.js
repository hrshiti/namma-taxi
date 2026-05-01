import { Router } from 'express';
import * as airportController from '../../modules/airport/controller/airport.controller.js';
import { protect, authorize } from '../../middleware/auth.js';

const router = Router();

// Public route for viewing data
router.get('/', airportController.getData);

// Admin/Staff only routes for modification
router.post('/', protect, authorize('admin', 'staff'), airportController.createData);
router.patch('/:id', protect, authorize('admin', 'staff'), airportController.updateData);
router.delete('/:id', protect, authorize('admin', 'staff'), airportController.deleteData);

export default router;
