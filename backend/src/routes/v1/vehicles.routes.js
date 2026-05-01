/**
 * src/routes/v1/vehicles.routes.js
 *
 * -- PHASE 1 STUB --
 * Routes for the 'vehicles' module.
 * Will be fully implemented in Phase 2.
 *
 * NOTE: Do not add real business logic here until the module models, services, and API contracts are implemented in Phase 2.
 */

import { Router } from 'express';
import * as vehicleController from '../../modules/vehicles/controller/vehicles.controller.js';
import { protect, authorize } from '../../middleware/auth.js';

const router = Router();

router.use(protect);
router.use(authorize('admin', 'staff'));

router.post('/', vehicleController.createVehicle);
router.get('/', vehicleController.getVehicles);
router.get('/:id', vehicleController.getVehicleById);
router.patch('/:id', vehicleController.updateVehicle);
router.delete('/:id', vehicleController.deleteVehicle);

export default router;
