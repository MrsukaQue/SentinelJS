import { ArrowLeft, Download, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ScoreGauge } from '../components/ScoreGauge.jsx';
import { SeverityBadge } from '../components/SeverityBadge.jsx';
import { useScanProgress } from '../hooks/useScanProgress.js';
import { api } from '../services/api.js';

export function ScanDetail() {
  const { id } = useParams();
  const [scan, setScan] = useState(null);
  const [error, setError] = useState('');
  const [severity, setSeverity] = useState('ALL');
  const [category, setCategory] = useState('ALL');
  const load = useCallback(
    () =>
      api
        .scan(id)
        .then(setScan)
        .catch((reason) => setError(reason.message)),
    [id],
  );
  useEffect(() => {
    load();
  }, [load]);
  useScanProgress(
    id,
    useCallback(() => load(), [load]),
  );
  useEffect(() => {
    if (!scan || ['COMPLETED', 'FAILED'].includes(scan.status)) return undefined;
    const timer = setInterval(load, 3000);
    return () => clearInterval(timer);
  }, [scan, load]);
  const findings = useMemo(
    () =>
      scan?.findings.filter(
        (item) =>
          (severity === 'ALL' || item.severity === severity) &&
          (category === 'ALL' || item.category === category),
      ) || [],
    [scan, severity, category],
  );
  if (error)
    return (
      <p role="alert" className="panel p-6 text-red-300">
        {error}
      </p>
    );
  if (!scan) return <p className="panel p-6">Loading scan…</p>;
  const active = !['COMPLETED', 'FAILED'].includes(scan.status);
  const categories = [...new Set(scan.findings.map((item) => item.category))];
  return (
    <>
      <Link
        to="/"
        className="mb-5 inline-flex items-center gap-2 text-sm text-slate-400 no-underline"
      >
        <ArrowLeft size={16} />
        Back to dashboard
      </Link>
      <section className="panel grid gap-6 p-6 md:grid-cols-[auto_1fr_auto]">
        <ScoreGauge score={scan.score || 0} />
        <div>
          <span className="eyebrow">Target</span>
          <h1 className="break-all text-2xl">{scan.target.url}</h1>
          <span className={scan.status === 'FAILED' ? 'text-red-300' : 'text-emerald-300'}>
            {active && <RefreshCw className="mr-2 inline animate-spin" size={14} />} {scan.status}
          </span>
          <p className="text-sm text-slate-500">
            Scanner {scan.scannerVersion}
            {scan.startedAt && scan.completedAt
              ? ` · ${((new Date(scan.completedAt) - new Date(scan.startedAt)) / 1000).toFixed(1)} seconds`
              : ''}
          </p>
        </div>
        {scan.status === 'COMPLETED' && (
          <div className="flex flex-col gap-2">
            <a
              className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 no-underline"
              href={`/api/scans/${id}/report?format=json`}
            >
              <Download size={15} />
              JSON report
            </a>
            <a
              className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 no-underline"
              href={`/api/scans/${id}/report?format=html`}
            >
              <Download size={15} />
              HTML report
            </a>
          </div>
        )}
      </section>
      <section className="mt-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="eyebrow">Findings</span>
            <h2 className="m-0 mt-1">{findings.length} observed</h2>
          </div>
          <div className="flex gap-2">
            <select
              aria-label="Filter severity"
              value={severity}
              onChange={(event) => setSeverity(event.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            >
              <option>ALL</option>
              {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFORMATIONAL'].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
            <select
              aria-label="Filter category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            >
              <option>ALL</option>
              {categories.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="space-y-4">
          {findings.map((item) => (
            <article className="panel p-6" key={item.id}>
              <SeverityBadge severity={item.severity} />
              <h3 className="mb-1 mt-3 text-lg">{item.name}</h3>
              <p className="text-xs text-slate-500">
                {item.category} · {item.component} · −{item.deduction} points
              </p>
              <div className="grid gap-5 text-sm md:grid-cols-2">
                <div>
                  <h4 className="text-slate-400">Evidence</h4>
                  <p>{item.evidence}</p>
                  <h4 className="text-slate-400">Impact</h4>
                  <p>{item.impact}</p>
                </div>
                <div>
                  <h4 className="text-slate-400">Recommendation</h4>
                  <p>{item.recommendation}</p>
                  {item.reference && (
                    <a
                      className="text-emerald-300"
                      href={item.reference}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Relevant security reference
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
          {!active && !findings.length && (
            <p className="panel p-6 text-center text-slate-500">
              No findings match these filters. This does not prove the target is secure.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
