import cors from 'cors';
import express from 'express';
import { errorHandler } from './middlewares/error-handler.middleware';
import apiRoutes from './routes';

const DEFAULT_CORS_ORIGIN = 'http://localhost:4200';

export function createApp(): express.Application {
  const app = express();
  const corsOrigin = process.env['CORS_ORIGIN'] ?? DEFAULT_CORS_ORIGIN;

  app.use(
    cors({
      origin: corsOrigin,
      allowedHeaders: ['Content-Type', 'x-user-id'],
    }),
  );
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.status(200).json({ data: { status: 'ok' } });
  });

  app.use('/api', apiRoutes);
  app.use(errorHandler);

  return app;
}
