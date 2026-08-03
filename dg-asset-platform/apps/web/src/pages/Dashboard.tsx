import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

interface FleetStatusRow {
  assetType: string;
  status: string;
  count: number;
}

interface AlertRow {
  id: string;
  type: string;
  severity: string;
  message: string;
}

export default function Dashboard() {
  const [fleetStatus, setFleetStatus] = useState<FleetStatusRow[]>([]);
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get<FleetStatusRow[]>('/reports/fleet-status'), api.get<AlertRow[]>('/alerts')])
      .then(([fs, al]) => {
        setFleetStatus(fs);
        setAlerts(al);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalByType = fleetStatus.reduce<Record<string, number>>((acc, row) => {
    acc[row.assetType] = (acc[row.assetType] ?? 0) + row.count;
    return acc;
  }, {});

  const activeStatuses = ['AVAILABLE', 'IN_USE', 'RESERVED', 'IN_TRANSIT'];
  const inMaintenance = fleetStatus.filter((r) => r.status === 'IN_MAINTENANCE').reduce((s, r) => s + r.count, 0);
  const broken = fleetStatus.filter((r) => r.status === 'BROKEN').reduce((s, r) => s + r.count, 0);
  const inUse = fleetStatus.filter((r) => activeStatuses.includes(r.status)).reduce((s, r) => s + r.count, 0);

  if (loading) return <p>A carregar…</p>;

  return (
    <div>
      <h2>Dashboard</h2>
      <div className="dg-grid">
        {Object.entries(totalByType).map(([type, count]) => (
          <div key={type} className="dg-card">
            <div className="dg-badge">{type}</div>
            <h3 style={{ fontSize: 32, margin: '8px 0' }}>{count}</h3>
            <span>ativos registados</span>
          </div>
        ))}
        <div className="dg-card">
          <div className="dg-badge success">Em utilização</div>
          <h3 style={{ fontSize: 32, margin: '8px 0' }}>{inUse}</h3>
        </div>
        <div className="dg-card">
          <div className="dg-badge warning">Em manutenção</div>
          <h3 style={{ fontSize: 32, margin: '8px 0' }}>{inMaintenance}</h3>
        </div>
        <div className="dg-card">
          <div className="dg-badge danger">Avariados</div>
          <h3 style={{ fontSize: 32, margin: '8px 0' }}>{broken}</h3>
        </div>
      </div>

      <h3 style={{ marginTop: 24 }}>Alertas abertos</h3>
      {alerts.length === 0 && <p>Sem alertas em aberto.</p>}
      {alerts.map((a) => (
        <div key={a.id} className="dg-card" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>{a.message}</span>
          <span className={`dg-badge ${a.severity === 'CRITICAL' || a.severity === 'HIGH' ? 'danger' : 'warning'}`}>{a.severity}</span>
        </div>
      ))}

      <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
        <Link className="dg-btn" to="/assets/new">+ Nova ficha</Link>
        <Link className="dg-btn secondary" to="/scan">Ler QR Code</Link>
      </div>
    </div>
  );
}
