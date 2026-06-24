import { Router } from 'express';
import * as cartController from '../controllers/cart.controller';
import { requireUser } from '../middlewares/require-user.middleware';
import {
  asyncHandler,
  validateBody,
  validateParams,
} from '../middlewares/validate.middleware';
import {
  addToCartBodySchema,
  removeFromCartParamsSchema,
} from '../validators/cart.validator';

const router = Router();

router.use(requireUser);

router.get('/', asyncHandler(cartController.getCart));

router.post(
  '/items',
  validateBody(addToCartBodySchema),
  asyncHandler(cartController.addToCart),
);

router.delete(
  '/items/:productId',
  validateParams(removeFromCartParamsSchema),
  asyncHandler(cartController.removeFromCart),
);

export default router;
