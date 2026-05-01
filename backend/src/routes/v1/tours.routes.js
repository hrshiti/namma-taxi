import { Router } from 'express';
import * as toursController from '../../modules/taxi/controller/tours.controller.js';

const router = Router();

router.get('/', toursController.getToursPackages);

export default router;
