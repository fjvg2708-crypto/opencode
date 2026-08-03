import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import type { AssetDto } from '@dg/shared';

export default function AssetsList() {
  const [assets, setAssets] = useState<AssetDto[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<AssetDto[]>('/assets')
      .then(setAssets)
      .finally(() => setLoading(false));
  }, []);

  const filtered = assets.filter((a) => {
    const haystack = `${a.internalCode} ${a.designation} ${a.brand ?? ''} ${a.model ?? ''} ${a.plate ?? ''} ${a.serialNumber ?? ''}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  return (
    <div>
      <h2>Ativos</h2>
      <input
        placeholder="Pesquisar por código, matrícula, marca, modelo…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ width: '100%', minHeight: 46, borderRadius: 10, border: '1px solid var(--dg-border)', padding: '8px 12px', marginBottom: 16, fontSize: 16 }}
      />
      {loading && <p>A carregar…</p>}
      <div className="dg-grid">
        {filtered.map((asset) => (
          <Link key={asset.id} to={`/assets/${asset.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="dg-card">
              <div className="dg-badge">{asset.assetType}</div>
              <h3 style={{ margin: '8px 0 4px' }}>{asset.designation}</h3>
              <p style={{ margin: 0, color: '#556' }}>
                {asset.internalCode} {asset.plate ? `· ${asset.plate}` : ''} {asset.serialNumber ? `· ${asset.serialNumber}` : ''}
              </p>
              <span className="dg-badge" style={{ marginTop: 8, display: 'inline-block' }}>{asset.status}</span>
            </div>
          </Link>
        ))}
      </div>
      {!loading && filtered.length === 0 && <p>Nenhum ativo encontrado.</p>}
    </div>
  );
}
