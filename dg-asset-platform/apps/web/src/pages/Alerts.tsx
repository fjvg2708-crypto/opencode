import { useEffect, useState } from 'react';
import { api } from '../api/client';

interface AlertRow {
  id: string;
  type: string;
  severity: string;
  message: string;
  status: string;
  createdAt: string;
}

export default function Alerts() {
  const [alerts, setAlerts] = useState<AlertRow[]>([]);

  function load() {
    api.get<AlertRow[]>('/alerts').then(setAlerts);
  }

  useEffect(load, []);

  async function acknowledge(id: string) {
    await api.patch(`/alerts/${id}/acknowledge`);
    load();
  }

  async function resolve(id: string) {
    await api.patch(`/alerts/${id}/resolve`);
    load();
  }

  return (
    <div>
      <h2>Alertas</h2>
      {alerts.length === 0 && <p>Sem alertas em aberto.</p>}
      {alerts.map((a) => (
        <div key={a.id} className="dg-card">
          <span className={`dg-badge ${a.severity === 'CRITICAL' || a.severity === 'HIGH' ? 'danger' : 'warning'}`}>{a.severity}</span>
          <p>{a.message}</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="dg-btn secondary" onClick={() => acknowledge(a.id)}>Reconhecer</button>
            <button className="dg-btn" onClick={() => resolve(a.id)}>Resolver</button>
          </div>
        </div>
      ))}
    </div>
  );
}
