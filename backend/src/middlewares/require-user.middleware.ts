import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../lib/app-error';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export function requireUser(req: Request, _res: Response, next: NextFunction): void {
  const userId = req.header('x-user-id');

  if (!userId || userId.trim().length === 0) {
    next(new AppError(401, 'x-user-id header is required'));
    return;
  }

  req.userId = userId;
  next();
}

function getUserId(req: Request): string {
  if (!req.userId) {
    throw new AppError(401, 'x-user-id header is required');
  }

  return req.userId;
}

export { getUserId };
