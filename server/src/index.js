import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { createApp } from './app.js';
import { config } from './config.js';
import { logger } from './utils/logger.js';
import { scanEvents } from './jobs/queue.js';

const server = createServer(createApp());
export const io = new Server(server, {
  cors: { origin: config.CLIENT_ORIGIN, credentials: true },
});

scanEvents.on('progress', ({ jobId, data }) => io.to(`scan:${jobId}`).emit('scan:progress', { scanId: jobId, ...data }));
scanEvents.on('completed', ({ jobId, returnvalue }) => io.to(`scan:${jobId}`).emit('scan:completed', returnvalue));
io.on('connection', (socket) => socket.on('scan:watch', (scanId) => {
  if (typeof scanId === 'string' && /^[0-9a-f-]{36}$/i.test(scanId)) socket.join(`scan:${scanId}`);
}));

server.listen(config.PORT, () => logger.info({ port: config.PORT }, 'API listening'));
