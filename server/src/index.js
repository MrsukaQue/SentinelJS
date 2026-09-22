import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { createApp } from './app.js';
import { config } from './config.js';
import { logger } from './utils/logger.js';

const server = createServer(createApp());
export const io = new Server(server, {
  cors: { origin: config.CLIENT_ORIGIN, credentials: true },
});

server.listen(config.PORT, () => logger.info({ port: config.PORT }, 'API listening'));
