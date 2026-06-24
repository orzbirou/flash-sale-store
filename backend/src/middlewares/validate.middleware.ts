import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { ZodSchema } from 'zod';
import { AppError } from '../lib/app-error';

type RequestHandlerWithBody<T> = RequestHandler<
  Record<string, string>,
  unknown,
  T,
  Record<string, unknown>
>;

export function validateBody<T>(schema: ZodSchema<T>): RequestHandlerWithBody<T> {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const message = result.error.issues.map((issue) => issue.message).join('; ');
      next(new AppError(400, message));
      return;
    }

    req.body = result.data;
    next();
  };
}

export function validateParams<T>(schema: ZodSchema<T>): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      const message = result.error.issues.map((issue) => issue.message).join('; ');
      next(new AppError(400, message));
      return;
    }

    Object.assign(req.params, result.data);
    next();
  };
}

export function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<void>,
): RequestHandler {
  return (req, res, next) => {
    void handler(req, res, next).catch(next);
  };
}
