import { ShieldCheck } from 'lucide-react';
import { useState } from 'react';

export function AuthPage({ onAuthenticate }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await onAuthenticate(mode, form);
    } catch (reason) {
      setError(reason.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="grid min-h-screen place-items-center p-5">
      <section className="panel w-full max-w-md p-8">
        <div className="mb-7 flex items-center gap-3">
          <div className="rounded-xl bg-emerald-400/10 p-3 text-emerald-300">
            <ShieldCheck size={30} />
          </div>
          <div>
            <h1 className="m-0 text-2xl">SentinelJS</h1>
            <p className="m-0 text-sm text-slate-500">Authorized passive audits</p>
          </div>
        </div>
        <h2 className="text-lg">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
        <form className="space-y-4" onSubmit={submit}>
          <label className="block text-sm text-slate-300">
            Email
            <input
              required
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              className="mt-2 w-full box-border rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-400"
            />
          </label>
          <label className="block text-sm text-slate-300">
            Password
            <input
              required
              minLength="12"
              maxLength="128"
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              className="mt-2 w-full box-border rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-400"
            />
          </label>
          {error && (
            <p role="alert" className="text-sm text-red-300">
              {error}
            </p>
          )}
          <button
            disabled={busy}
            className="w-full rounded-xl bg-emerald-400 px-4 py-3 font-bold text-slate-950 disabled:opacity-60"
          >
            {busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Register'}
          </button>
        </form>
        <button
          className="mt-5 w-full bg-transparent text-sm text-slate-400"
          onClick={() => {
            setMode(mode === 'login' ? 'register' : 'login');
            setError('');
          }}
        >
          {mode === 'login' ? 'Need an account? Register' : 'Already registered? Log in'}
        </button>
      </section>
    </main>
  );
}
