import { Activity, Radar, TriangleAlert } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { ScoreGauge } from '../components/ScoreGauge.jsx';

const colors = {
  CRITICAL: '#e879f9',
  HIGH: '#ff6577',
  MEDIUM: '#f6c85f',
  LOW: '#55b9f3',
  INFORMATIONAL: '#718096',
};

export function Dashboard({ scans, onCreate }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('ALL');
  const navigate = useNavigate();
  const filtered = scans.filter((scan) => status === 'ALL' || scan.status === status);
  const latest = scans.find((scan) => scan.status === 'COMPLETED');
  const chart = Object.entries(latest?.severityCounts || {}).map(([name, value]) => ({
    name,
    value,
  }));

  async function submit(event) {
    event.preventDefault();
    setError('');
    try {
      const scan = await onCreate(url);
      navigate(`/scans/${scan.id}`);
    } catch (reason) {
      setError(reason.message);
    }
  }

  return (
    <>
      <section className="panel mb-6 p-6">
        <span className="eyebrow">New authorized audit</span>
        <form onSubmit={submit} className="mt-3 flex flex-col gap-3 md:flex-row">
          <input
            required
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            aria-label="Website URL"
            className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 outline-none focus:border-emerald-400"
            placeholder="https://your-authorized-domain.com"
          />
          <button className="flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 font-bold text-slate-950 hover:bg-emerald-300">
            <Radar size={18} />
            Start passive scan
          </button>
        </form>
        {error && (
          <p role="alert" className="text-sm text-red-300">
            {error}
          </p>
        )}
        <p className="mb-0 text-xs text-slate-500">
          Only scan systems you own or have explicit permission to test.
        </p>
      </section>
      <section className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
        <article className="panel flex min-h-64 items-center justify-around p-6">
          <ScoreGauge score={latest?.score || 0} />
          <div>
            <span className="eyebrow">Latest completed scan</span>
            <h2 className="mb-1 text-lg">{latest?.target.hostname || 'No scans yet'}</h2>
            <p className="text-sm text-slate-400">
              {latest
                ? `${latest._count.findings} findings`
                : 'Submit an authorized target to begin'}
            </p>
          </div>
        </article>
        <article className="panel p-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="eyebrow">Exposure overview</span>
              <h2 className="mt-1 text-lg">Latest severity distribution</h2>
            </div>
            <Activity className="text-slate-600" />
          </div>
          {chart.length ? (
            <div className="h-48">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={chart}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={45}
                    outerRadius={72}
                  >
                    {chart.map((entry) => (
                      <Cell key={entry.name} fill={colors[entry.name]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#101c2a', border: '1px solid #23344a' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="mt-16 text-center text-sm text-slate-500">
              Distribution appears after a completed scan.
            </p>
          )}
        </article>
      </section>
      <section className="panel mt-6 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 p-5">
          <div className="flex items-center gap-2">
            <TriangleAlert size={18} className="text-amber-300" />
            <h2 className="m-0 text-base">Scan history</h2>
          </div>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
          >
            <option>ALL</option>
            {[
              'QUEUED',
              'RESOLVING',
              'CONNECTING',
              'SCANNING',
              'ANALYZING',
              'COMPLETED',
              'FAILED',
            ].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </div>
        {filtered.length ? (
          filtered.map((scan) => (
            <Link
              to={`/scans/${scan.id}`}
              className="grid grid-cols-[1fr_auto_auto] items-center gap-5 border-b border-slate-800/60 px-5 py-4 text-inherit no-underline last:border-0 hover:bg-slate-800/20"
              key={scan.id}
            >
              <div>
                <b>{scan.target.hostname}</b>
                <p className="m-0 text-xs text-slate-500">
                  {new Date(scan.createdAt).toLocaleString()}
                </p>
              </div>
              <span
                className={
                  scan.status === 'FAILED' ? 'text-sm text-red-300' : 'text-sm text-emerald-300'
                }
              >
                {scan.status}
              </span>
              <b>{scan.score ?? '—'}</b>
            </Link>
          ))
        ) : (
          <p className="p-6 text-center text-sm text-slate-500">No matching scans.</p>
        )}
      </section>
    </>
  );
}
