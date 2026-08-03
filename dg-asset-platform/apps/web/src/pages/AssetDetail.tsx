import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api, ApiError } from '../api/client';
import { cacheAsset, enqueueOperation, generateClientOperationId, getCachedAsset } from '../offline/db';
import type { AssetDto } from '@dg/shared';

export default function AssetDetail() {
  const { id } = useParams<{ id: string }>();
  const [asset, setAsset] = useState<AssetDto | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [offlineData, setOfflineData] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const data = await api.get<AssetDto>(`/assets/${id}`);
      setAsset(data);
      setOfflineData(false);
      await cacheAsset(id, data);
    } catch (err) {
      if (!navigator.onLine) {
        const cached = await getCachedAsset(id);
        if (cached) {
          setAsset(cached.data as AssetDto);
          setOfflineData(true);
          return;
        }
      }
      throw err;
    }
  }, [id]);

  useEffect(() => {
    load().catch((err) => setMessage((err as Error).message));
  }, [load]);

  useEffect(() => {
    if (!id || !navigator.onLine) return;
    api
      .get<Blob>(`/assets/${id}/qrcode.png`)
      .then((blob) => setQrUrl(URL.createObjectURL(blob)))
      .catch(() => setQrUrl(null));
  }, [id, asset?.status]);

  async function issueQr() {
    if (!id) return;
    try {
      await api.post(`/assets/${id}/qrcode`);
      setMessage('QR Code gerado.');
      load();
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : 'Erro ao gerar QR Code.');
    }
  }

  async function validate() {
    if (!id) return;
    try {
      await api.patch(`/assets/${id}/validate`);
      setMessage('Ficha validada.');
      load();
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : 'Erro ao validar ficha.');
    }
  }

  async function reportBreakdown() {
    if (!id) return;
    const description = prompt('Descreva a avaria:');
    if (!description) return;
    const payload = { assetId: id, priority: 'NORMAL', description, safetyRisk: false };
    if (navigator.onLine) {
      await api.post('/breakdowns', payload);
      setMessage('Avaria reportada.');
    } else {
      await enqueueOperation({ clientOperationId: generateClientOperationId(), type: 'BREAKDOWN', payload });
      setMessage('Sem ligação — avaria guardada e será enviada automaticamente.');
    }
  }

  if (!asset) return <p>{message ?? 'A carregar…'}</p>;

  return (
    <div>
      {offlineData && <p className="dg-badge warning">A mostrar dados guardados offline (podem estar desatualizados).</p>}
      <h2>{asset.designation}</h2>
      <p style={{ color: '#556' }}>{asset.internalCode} · {asset.assetType}</p>
      <span className="dg-badge">{asset.status}</span>

      {message && <p style={{ marginTop: 12 }}>{message}</p>}

      <div className="dg-grid" style={{ marginTop: 16 }}>
        <div className="dg-card">
          <h3>Identificação</h3>
          <p>Marca: {asset.brand ?? '—'}</p>
          <p>Modelo: {asset.model ?? '—'}</p>
          <p>Matrícula: {asset.plate ?? '—'}</p>
          <p>VIN: {asset.vin ?? '—'}</p>
          <p>Nº série: {asset.serialNumber ?? '—'}</p>
        </div>

        <div className="dg-card">
          <h3>QR Code</h3>
          {qrUrl ? <img src={qrUrl} alt="QR Code do ativo" style={{ width: '100%', maxWidth: 220 }} /> : <p>Sem QR Code ativo.</p>}
          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            <button className="dg-btn" onClick={issueQr}>Gerar QR Code</button>
          </div>
        </div>

        <div className="dg-card">
          <h3>Ações</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button className="dg-btn secondary" onClick={validate}>Validar ficha</button>
            <button className="dg-btn danger" onClick={reportBreakdown}>Reportar avaria</button>
          </div>
        </div>
      </div>
    </div>
  );
}
