import { LogOut, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AppShell({ children, onLogout }) {
  return (
    <main className="mx-auto max-w-7xl px-5 py-7">
      <header className="mb-8 flex items-center justify-between">
        <Link className="flex items-center gap-3 text-inherit no-underline" to="/">
          <div className="rounded-xl bg-emerald-400/10 p-2 text-emerald-300">
            <ShieldCheck />
          </div>
          <div>
            <h1 className="m-0 text-xl font-bold">SentinelJS</h1>
            <p className="m-0 text-xs text-slate-500">Passive web security intelligence</p>
          </div>
        </Link>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 rounded-lg border border-slate-700 bg-transparent px-3 py-2 text-sm text-slate-300 hover:border-slate-500"
        >
          <LogOut size={15} />
          Log out
        </button>
      </header>
      {children}
    </main>
  );
}
