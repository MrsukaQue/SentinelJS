import { Queue, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';
import { config } from '../config.js';

export const redis = new IORedis(config.REDIS_URL, { maxRetriesPerRequest: null });
export const scanQueue = new Queue('security-scans', { connection: redis });
export const scanEvents = new QueueEvents('security-scans', { connection: redis.duplicate() });

export function enqueueScan(scanId, url) {
  return scanQueue.add(
    'scan',
    { scanId, url },
    {
      jobId: scanId,
      attempts: 2,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: 1000,
      removeOnFail: 1000,
    },
  );
}
