import { Activity, Radar, ShieldCheck, TriangleAlert } from 'lucide-react';
import { ScoreGauge } from '../components/ScoreGauge.jsx';

const demoScans = [
  { host: 'store.example.test', score: 78, status: 'COMPLETED', age: '4 min ago' },
  { host: 'docs.example.test', score: 91, status: 'COMPLETED', age: '1 hour ago' },
];

export function Dashboard() {
  return (
    <main className="mx-auto max-w-7xl px-5 py-7">
      <header className="mb-8 flex items-center justify-between"><div className="flex items-center gap-3"><div className="rounded-xl bg-emerald-400/10 p-2 text-emerald-300"><ShieldCheck /></div><div><h1 className="m-0 text-xl font-bold">SentinelJS</h1><p className="m-0 text-xs text-slate-500">Passive web security intelligence</p></div></div><span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">System operational</span></header>
      <section className="panel mb-6 p-6"><span className="eyebrow">New authorized audit</span><div className="mt-3 flex flex-col gap-3 md:flex-row"><input aria-label="Website URL" className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 outline-none focus:border-emerald-400" placeholder="https://your-authorized-domain.com"/><button className="flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 font-bold text-slate-950 hover:bg-emerald-300"><Radar size={18}/>Start passive scan</button></div><p className="mb-0 text-xs text-slate-500">Only scan systems you own or have explicit permission to test.</p></section>
      <section className="grid gap-6 lg:grid-cols-[1fr_1.5fr]"><article className="panel flex items-center justify-around p-6"><ScoreGauge score={78}/><div><span className="eyebrow">Latest scan</span><h2 className="mb-1 text-lg">store.example.test</h2><p className="text-sm text-slate-400">Completed in 3.8 seconds</p><div className="mt-5 flex gap-6"><div><b className="text-2xl">8</b><p className="m-0 text-xs text-slate-500">Findings</p></div><div><b className="text-2xl text-red-300">1</b><p className="m-0 text-xs text-slate-500">High</p></div></div></div></article><article className="panel p-6"><div className="mb-5 flex items-center justify-between"><div><span className="eyebrow">Exposure overview</span><h2 className="mt-1 text-lg">Findings by category</h2></div><Activity className="text-slate-600"/></div>{[['Headers',72],['Cookies',45],['Transport',88],['Content',64]].map(([name,value])=><div className="mb-4" key={name}><div className="mb-1 flex justify-between text-sm"><span>{name}</span><span className="text-slate-500">{value}%</span></div><div className="h-2 rounded bg-slate-800"><div className="h-2 rounded bg-emerald-400" style={{width:`${value}%`}}/></div></div>)}</article></section>
      <section className="panel mt-6 overflow-hidden"><div className="flex items-center gap-2 border-b border-slate-800 p-5"><TriangleAlert size={18} className="text-amber-300"/><h2 className="m-0 text-base">Recent scans</h2></div>{demoScans.map((scan)=><div className="grid grid-cols-[1fr_auto_auto] items-center gap-5 border-b border-slate-800/60 px-5 py-4 last:border-0" key={scan.host}><div><b>{scan.host}</b><p className="m-0 text-xs text-slate-500">{scan.age}</p></div><span className="text-sm text-emerald-300">{scan.status}</span><b>{scan.score}</b></div>)}</section>
    </main>
  );
}
