import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/auth';
import { syncOfflineQueue, watchConnectivity } from '../offline/sync-manager';

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [online, setOnline] = useState(navigator.onLine);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const stop = watchConnectivity(() => setOnline(true));
    window.addEventListener('offline', () => setOnline(false));
    return stop;
  }, []);

  useEffect(() => {
    if (!online) return;
    setSyncing(true);
    syncOfflineQueue()
      .catch(() => undefined)
      .finally(() => setSyncing(false));
  }, [online]);

  return (
    <div className="dg-app-shell">
      {!online && <div className="dg-offline-banner">Sem ligação — as operações ficam guardadas e serão sincronizadas automaticamente.</div>}
      {online && syncing && <div className="dg-offline-banner">A sincronizar operações guardadas offline…</div>}
      <header className="dg-header">
        <h1>Grupo DG · Gestão de Ativos</h1>
        {user && (
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span>{user.name}</span>
            <button
              className="dg-btn secondary"
              style={{ minHeight: 36, padding: '0 12px', fontSize: 13 }}
              onClick={() => {
                logout();
                navigate('/login');
              }}
            >
              Sair
            </button>
          </div>
        )}
      </header>
      {user && (
        <nav className="dg-nav">
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/assets">Ativos</NavLink>
          <NavLink to="/assets/new">Nova Ficha</NavLink>
          <NavLink to="/scan">Ler QR</NavLink>
          <NavLink to="/alerts">Alertas</NavLink>
        </nav>
      )}
      <main className="dg-main">
        <Outlet />
      </main>
    </div>
  );
}
