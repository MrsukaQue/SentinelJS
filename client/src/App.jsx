import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { AppShell } from './components/AppShell.jsx';
import { AuthPage } from './pages/AuthPage.jsx';
import { api } from './services/api.js';

const Dashboard = lazy(() =>
  import('./pages/Dashboard.jsx').then((module) => ({ default: module.Dashboard })),
);
const ScanDetail = lazy(() =>
  import('./pages/ScanDetail.jsx').then((module) => ({ default: module.ScanDetail })),
);

export function App() {
  const [authenticated, setAuthenticated] = useState(null);
  const [scans, setScans] = useState([]);
  const navigate = useNavigate();
  const load = useCallback(async () => {
    try {
      const data = await api.scans();
      setScans(data);
      setAuthenticated(true);
    } catch {
      setAuthenticated(false);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  async function authenticate(mode, form) {
    await api[mode](form);
    setAuthenticated(true);
    await load();
  }
  async function logout() {
    await api.logout();
    setAuthenticated(false);
    setScans([]);
    navigate('/');
  }
  if (authenticated === null)
    return (
      <main className="grid min-h-screen place-items-center text-slate-400">
        Loading SentinelJS…
      </main>
    );
  if (!authenticated) return <AuthPage onAuthenticate={authenticate} />;
  return (
    <AppShell onLogout={logout}>
      <Suspense fallback={<p className="panel p-6">Loading view…</p>}>
        <Routes>
          <Route
            path="/"
            element={
              <Dashboard
                scans={scans}
                onCreate={async (url) => {
                  const scan = await api.createScan(url);
                  setScans((items) => [scan, ...items]);
                  return scan;
                }}
              />
            }
          />
          <Route path="/scans/:id" element={<ScanDetail />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AppShell>
  );
}
