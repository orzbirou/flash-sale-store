import type { Response } from 'express';
import type { Request } from 'express';
import { productService } from '../services/product.service';

export async function list(req: Request, res: Response): Promise<void> {
  const products = await productService.list();
  res.status(200).json({ data: products });
}
