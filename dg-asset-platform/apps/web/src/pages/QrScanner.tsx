import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Leitor de QR Code. Usa a BarcodeDetector API nativa quando disponível
 * (Chrome/Edge em Android e desktop); nos restantes navegadores (ex. Safari
 * iOS sem suporte) apresenta introdução manual do código/URL — a app
 * continua totalmente utilizável em obra sem depender de uma lib externa
 * de deteção de imagem.
 */
export default function QrScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [manualToken, setManualToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [supported, setSupported] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let stream: MediaStream | null = null;
    let cancelled = false;

    async function start() {
      if (!('BarcodeDetector' in window)) {
        setSupported(false);
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
        const tick = async () => {
          if (cancelled || !videoRef.current) return;
          try {
            const codes = await detector.detect(videoRef.current);
            if (codes.length > 0) {
              handleScanned(codes[0].rawValue);
              return;
            }
          } catch {
            // ignora falhas pontuais de deteção
          }
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      } catch {
        setError('Não foi possível aceder à câmara. Use a introdução manual abaixo.');
        setSupported(false);
      }
    }

    start();
    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  function handleScanned(rawValue: string) {
    const token = rawValue.split('/').pop();
    if (token) navigate(`/scan/${token}`);
  }

  return (
    <div>
      <h2>Ler QR Code</h2>
      {supported ? (
        <video ref={videoRef} style={{ width: '100%', maxWidth: 480, borderRadius: 12 }} muted playsInline />
      ) : (
        <p>{error ?? 'Leitura por câmara não suportada neste navegador.'}</p>
      )}

      <div className="dg-card" style={{ marginTop: 16 }}>
        <h3>Introdução manual</h3>
        <div className="dg-field">
          <label>Token do QR Code ou URL completo</label>
          <input value={manualToken} onChange={(e) => setManualToken(e.target.value)} />
        </div>
        <button className="dg-btn" onClick={() => manualToken && handleScanned(manualToken)}>Ver ficha</button>
      </div>
    </div>
  );
}
