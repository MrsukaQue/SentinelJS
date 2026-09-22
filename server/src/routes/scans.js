import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { deleteScan, exportReport, listFindings, listScans, showScan, startScan } from '../controllers/scan-controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/errors.js';

const statuses = ['QUEUED', 'RESOLVING', 'CONNECTING', 'SCANNING', 'ANALYZING', 'COMPLETED', 'FAILED'];
const severities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFORMATIONAL'];
const empty = z.object({});
const idParams = z.object({ id: z.uuid() });
const scanId = z.object({ body: empty, params: idParams, query: empty });

export const scansRouter = Router();
scansRouter.use(requireAuth);
scansRouter.post('/', rateLimit({ windowMs: 60_000, limit: 10, standardHeaders: 'draft-8', legacyHeaders: false }), validate(z.object({ body: z.object({ url: z.string().min(1).max(2048) }), params: empty, query: empty })), asyncHandler(startScan));
scansRouter.get('/', validate(z.object({ body: empty, params: empty, query: z.object({ status: z.enum(statuses).optional() }) })), asyncHandler(listScans));
scansRouter.get('/:id', validate(scanId), asyncHandler(showScan));
scansRouter.get('/:id/findings', validate(z.object({ body: empty, params: idParams, query: z.object({ severity: z.enum(severities).optional(), category: z.string().max(50).optional() }) })), asyncHandler(listFindings));
scansRouter.get('/:id/report', validate(z.object({ body: empty, params: idParams, query: z.object({ format: z.enum(['json', 'html']).default('json') }) })), asyncHandler(exportReport));
scansRouter.delete('/:id', validate(scanId), asyncHandler(deleteScan));
