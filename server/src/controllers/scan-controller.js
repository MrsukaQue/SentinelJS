import { db } from '../database/client.js';
import { createScan, getScan } from '../services/scan-service.js';
import { AppError } from '../utils/errors.js';

export async function startScan(req, res) {
  const scan = await createScan(req.user.id, req.validated.body.url);
  res.status(202).json({ data: scan });
}

export async function listScans(req, res) {
  const { status } = req.validated.query;
  const scans = await db.scan.findMany({ where: { userId: req.user.id, ...(status && { status }) }, include: { target: true, _count: { select: { findings: true } } }, orderBy: { createdAt: 'desc' }, take: 100 });
  res.json({ data: scans });
}

export async function showScan(req, res) { res.json({ data: await getScan(req.user.id, req.validated.params.id) }); }

export async function listFindings(req, res) {
  const scan = await getScan(req.user.id, req.validated.params.id);
  let findings = scan.findings;
  const { severity, category } = req.validated.query;
  if (severity) findings = findings.filter((item) => item.severity === severity);
  if (category) findings = findings.filter((item) => item.category === category);
  res.json({ data: findings });
}

export async function deleteScan(req, res) {
  const scan = await getScan(req.user.id, req.validated.params.id);
  if (!['COMPLETED', 'FAILED'].includes(scan.status)) throw new AppError(409, 'SCAN_ACTIVE', 'Active scans cannot be deleted');
  await db.scan.delete({ where: { id: scan.id } });
  res.status(204).end();
}
