import type { Response, Request } from 'express';
import { getUserId } from '../middlewares/require-user.middleware';
import { cartService } from '../services/cart.service';
import type {
  AddToCartBody,
  RemoveFromCartParams,
} from '../validators/cart.validator';

export async function getCart(req: Request, res: Response): Promise<void> {
  const cart = await cartService.getCart(getUserId(req));
  res.status(200).json({ data: cart });
}

export async function addToCart(req: Request, res: Response): Promise<void> {
  const body = req.body as AddToCartBody;
  const product = await cartService.addToCart(
    getUserId(req),
    body.productId,
    body.quantity,
  );
  res.status(200).json({ data: product });
}

export async function removeFromCart(req: Request, res: Response): Promise<void> {
  const params = req.params as RemoveFromCartParams;
  const product = await cartService.removeFromCart(getUserId(req), params.productId);
  res.status(200).json({ data: product });
}
