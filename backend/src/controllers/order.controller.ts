import type { Response, Request } from 'express';
import { getUserId } from '../middlewares/require-user.middleware';
import { checkoutService } from '../services/checkout.service';

export async function checkout(req: Request, res: Response): Promise<void> {
  const order = await checkoutService.checkout(getUserId(req));
  res.status(201).json({ data: order });
}
