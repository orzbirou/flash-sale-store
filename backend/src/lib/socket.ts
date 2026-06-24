import type { Server as HttpServer } from 'node:http';
import { Server } from 'socket.io';

const DEFAULT_CORS_ORIGIN = 'http://localhost:4200';

export function createSocketServer(httpServer: HttpServer): Server {
  const corsOrigin = process.env['CORS_ORIGIN'] ?? DEFAULT_CORS_ORIGIN;

  return new Server(httpServer, {
    cors: {
      origin: corsOrigin,
      methods: ['GET', 'POST'],
    },
  });
}
