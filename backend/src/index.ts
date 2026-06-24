import 'dotenv/config';
import { createServer } from 'node:http';
import { createApp } from './app';
import { createSocketServer } from './lib/socket';
import { cartCleanerService } from './services/cart-cleaner.service';
import { stockBroadcastService } from './services/stock-broadcast.service';

const PORT = Number(process.env['PORT'] ?? 3000);

const app = createApp();
const httpServer = createServer(app);
const io = createSocketServer(httpServer);

stockBroadcastService.init(io);
cartCleanerService.start();

httpServer.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
