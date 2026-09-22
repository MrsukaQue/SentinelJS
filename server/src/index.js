import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { createApp } from './app.js';
import { config } from './config.js';
import { logger } from './utils/logger.js';
import { scanEvents } from './jobs/queue.js';
import cookieParser from 'cookie-parser';
import { sessionToken, verifyAccessToken } from './services/auth-service.js';
import { db } from './database/client.js';

const server = createServer(createApp());
export const io = new Server(server, {
  cors: { origin: config.CLIENT_ORIGIN, credentials: true },
});

scanEvents.on('progress', ({ jobId, data }) =>
  io.to(`scan:${jobId}`).emit('scan:progress', { scanId: jobId, ...data }),
);
scanEvents.on('completed', ({ jobId, returnvalue }) =>
  io.to(`scan:${jobId}`).emit('scan:completed', returnvalue),
);
io.use((socket, next) => {
  try {
    const cookies = cookieParser.JSONCookies(
      Object.fromEntries(
        (socket.handshake.headers.cookie || '')
          .split(';')
          .filter(Boolean)
          .map((part) => {
            const index = part.indexOf('=');
            return [part.slice(0, index).trim(), decodeURIComponent(part.slice(index + 1))];
          }),
      ),
    );
    const payload = verifyAccessToken(sessionToken(cookies));
    socket.userId = payload.sub;
    next();
  } catch {
    next(new Error('Authentication required'));
  }
});
io.on('connection', (socket) =>
  socket.on('scan:watch', async (scanId) => {
    if (typeof scanId !== 'string' || !/^[0-9a-f-]{36}$/i.test(scanId)) return;
    const owned = await db.scan.findFirst({
      where: { id: scanId, userId: socket.userId },
      select: { id: true },
    });
    if (owned) socket.join(`scan:${scanId}`);
  }),
);

server.listen(config.PORT, () => logger.info({ port: config.PORT }, 'API listening'));
