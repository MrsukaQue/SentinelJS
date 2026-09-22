import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { config } from '../config.js';
import { db } from '../database/client.js';
import { runScan } from '../scanner/run-scan.js';
import { logger } from '../utils/logger.js';

const connection = new IORedis(config.REDIS_URL, { maxRetriesPerRequest: null });

const worker = new Worker('security-scans', async (job) => {
  const { scanId, url } = job.data;
  await db.scan.update({ where: { id: scanId }, data: { status: 'RESOLVING', startedAt: new Date() } });
  try {
    const result = await runScan(url, async (status, progress) => {
      await Promise.all([job.updateProgress({ status, progress }), db.scan.update({ where: { id: scanId }, data: { status } })]);
    });
    await db.$transaction([
      db.finding.createMany({ data: result.findings.map((finding) => ({ ...finding, scanId })) }),
      db.scan.update({ where: { id: scanId }, data: { status: 'COMPLETED', score: result.score, completedAt: new Date() } }),
    ]);
    return { scanId, score: result.score };
  } catch (error) {
    await db.scan.update({ where: { id: scanId }, data: { status: 'FAILED', completedAt: new Date(), errorMessage: 'The scan could not be completed' } });
    throw error;
  }
}, { connection, concurrency: 3 });

worker.on('failed', (job, error) => logger.error({ err: error, scanId: job?.data.scanId }, 'Scan job failed'));
logger.info('Scan worker started');
