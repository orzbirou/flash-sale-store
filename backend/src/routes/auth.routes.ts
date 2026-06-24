import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { asyncHandler, validateBody } from '../middlewares/validate.middleware';
import { loginBodySchema } from '../validators/auth.validator';

const router = Router();

router.post(
  '/login',
  validateBody(loginBodySchema),
  asyncHandler(authController.login),
);

export default router;
