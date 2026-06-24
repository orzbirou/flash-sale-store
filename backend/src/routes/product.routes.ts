import { Router } from 'express';
import * as productController from '../controllers/product.controller';
import { asyncHandler } from '../middlewares/validate.middleware';

const router = Router();

router.get('/', asyncHandler(productController.list));

export default router;
