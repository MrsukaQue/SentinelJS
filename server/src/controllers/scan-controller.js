import { db } from '../database/client.js';
import { createScan, getScan } from '../services/scan-service.js';
import { AppError } from '../utils/errors.js';
import { htmlReport, reportData } from '../services/report-service.js';

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

export async function exportReport(req, res) {
  const scan = await getScan(req.user.id, req.validated.params.id);
  if (scan.status !== 'COMPLETED') throw new AppError(409, 'SCAN_INCOMPLETE', 'Reports are available only for completed scans');
  const format = req.validated.query.format;
  const filename = `sentineljs-${scan.target.hostname}-${scan.id}.${format}`;
  res.setHeader('Content-Disposition', `attachment; filename="${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}"`);
  if (format === 'html') return res.type('html').send(htmlReport(scan));
  return res.type('json').send(JSON.stringify(reportData(scan), null, 2));
}
