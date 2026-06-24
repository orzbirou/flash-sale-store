import type { Response } from 'express';
import type { Request } from 'express';
import { authService } from '../services/auth.service';
import type { LoginBody } from '../validators/auth.validator';

export async function login(req: Request, res: Response): Promise<void> {
  const body = req.body as LoginBody;
  const user = await authService.login(body.name);
  res.status(200).json({ data: user });
}
