import { config } from '../config.js';
import { db } from '../database/client.js';
import { enqueueScan } from '../jobs/queue.js';
import { normalizeUrl, resolvePublicTarget } from '../scanner/network-policy.js';
import { AppError } from '../utils/errors.js';

export async function createScan(userId, inputUrl) {
  const url = normalizeUrl(inputUrl);
  await resolvePublicTarget(url);
  const target = await db.target.upsert({
    where: { userId_url: { userId, url: url.href } },
    create: { userId, url: url.href, hostname: url.hostname }, update: {},
  });
  const scan = await db.scan.create({ data: { userId, targetId: target.id, scannerVersion: config.SCANNER_VERSION, job: { create: {} } }, include: { target: true } });
  try {
    const job = await enqueueScan(scan.id, url.href);
    await db.scanJob.update({ where: { scanId: scan.id }, data: { queueId: job.id } });
    return scan;
  } catch (error) {
    await db.scan.update({ where: { id: scan.id }, data: { status: 'FAILED', errorMessage: 'The scan could not be queued' } });
    throw error;
  }
}

export async function getScan(userId, id) {
  const scan = await db.scan.findFirst({ where: { id, userId }, include: { target: true, findings: { orderBy: { deduction: 'desc' } } } });
  if (!scan) throw new AppError(404, 'SCAN_NOT_FOUND', 'Scan not found');
  return scan;
}
