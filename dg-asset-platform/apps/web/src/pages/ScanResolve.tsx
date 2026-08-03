import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, ApiError } from '../api/client';

export default function ScanResolve() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    api
      .get<{ id: string }>(`/qr/${token}`)
      .then((asset) => navigate(`/assets/${asset.id}`, { replace: true }))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'QR Code inválido.'));
  }, [token, navigate]);

  return <p>{error ?? 'A resolver QR Code…'}</p>;
}
