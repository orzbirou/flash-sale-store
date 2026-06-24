import { Router } from 'express';
import * as orderController from '../controllers/order.controller';
import { requireUser } from '../middlewares/require-user.middleware';
import { asyncHandler } from '../middlewares/validate.middleware';

const router = Router();

router.use(requireUser);

router.post('/checkout', asyncHandler(orderController.checkout));

export default router;
