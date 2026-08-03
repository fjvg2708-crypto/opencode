import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, ApiError } from '../api/client';

const ASSET_TYPES = [
  'VEHICLE', 'MACHINE', 'EQUIPMENT', 'HEAVY_EQUIPMENT', 'TOOL', 'ACCESSORY', 'PART', 'CONTROLLED_MATERIAL', 'OTHER',
];

const PHOTO_KINDS = [
  'OVERVIEW', 'FRONT', 'BACK', 'SIDE', 'INTERIOR', 'PLATE', 'DATA_PLATE', 'SERIAL', 'VIN', 'ODOMETER', 'HOUR_METER', 'DAMAGE',
];

interface ExtractedField {
  id: string;
  field: string;
  value: string;
  confidence: number;
  status: string;
}

interface DuplicateMatch {
  assetId: string;
  internalCode: string;
  matchedBy: string[];
  score: number;
}

const STEPS = ['Tipo', 'Fotografias', 'Documentos', 'Validação IA', 'Duplicados', 'Confirmar'];

export default function NewAssetWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [assetType, setAssetType] = useState('VEHICLE');
  const [draftId, setDraftId] = useState<string | null>(null);
  const [fields, setFields] = useState<ExtractedField[]>([]);
  const [duplicates, setDuplicates] = useState<DuplicateMatch[]>([]);
  const [form, setForm] = useState({ designation: '', brand: '', model: '', plate: '', vin: '', serialNumber: '' });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function startDraft() {
    setBusy(true);
    setError(null);
    try {
      const draft = await api.post<{ id: string }>('/assets/drafts', { assetType });
      setDraftId(draft.id);
      setStep(1);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao criar rascunho.');
    } finally {
      setBusy(false);
    }
  }

  async function uploadPhoto(kind: string, file: File) {
    if (!draftId) return;
    // Numa instalação real, o ficheiro é primeiro enviado para o object
    // storage (S3/MinIO) e aqui regista-se apenas a storageKey devolvida.
    // Para o scaffold, usa-se o nome do ficheiro como chave simbólica.
    await api.post(`/assets/drafts/${draftId}/photos`, { kind, storageKey: `local/${draftId}/${kind}/${file.name}` });
  }

  async function loadExtractedFields() {
    if (!draftId) return;
    setBusy(true);
    try {
      const draft = await api.get<{ extractedFields: ExtractedField[] }>(`/assets/drafts/${draftId}`);
      setFields(draft.extractedFields);
      const populated: Record<string, string> = {};
      for (const f of draft.extractedFields) {
        if (['plate', 'vin', 'serialNumber', 'brand'].includes(f.field)) populated[f.field] = f.value;
      }
      setForm((prev) => ({ ...prev, ...populated }));
      setStep(3);
    } finally {
      setBusy(false);
    }
  }

  async function reviewField(fieldId: string, decision: 'CONFIRMED' | 'REJECTED') {
    await api.patch(`/assets/drafts/fields/${fieldId}/review`, { decision });
    setFields((prev) => prev.map((f) => (f.id === fieldId ? { ...f, status: decision } : f)));
  }

  async function checkDuplicates() {
    if (!draftId) return;
    const found = await api.get<DuplicateMatch[]>(`/assets/drafts/${draftId}/duplicates`);
    setDuplicates(found);
    setStep(4);
  }

  async function createAsset() {
    setBusy(true);
    setError(null);
    try {
      const asset = await api.post<{ id: string }>('/assets', {
        assetType,
        designation: form.designation,
        brand: form.brand || undefined,
        model: form.model || undefined,
        plate: form.plate || undefined,
        vin: form.vin || undefined,
        serialNumber: form.serialNumber || undefined,
        sourceDraftId: draftId ?? undefined,
      });
      navigate(`/assets/${asset.id}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setDuplicates((err.details as any)?.duplicates ?? []);
        setStep(4);
        setError('Foi detetado um possível duplicado. Reveja antes de continuar.');
      } else {
        setError(err instanceof ApiError ? err.message : 'Erro ao criar ativo.');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h2>Nova ficha de ativo</h2>
      <div className="dg-stepper">
        {STEPS.map((label, i) => (
          <span key={label} className={`dg-step ${i === step ? 'active' : ''}`}>{i + 1}. {label}</span>
        ))}
      </div>
      {error && <p style={{ color: 'var(--dg-danger)' }}>{error}</p>}

      {step === 0 && (
        <div className="dg-card">
          <div className="dg-field">
            <label>Tipo de ativo</label>
            <select value={assetType} onChange={(e) => setAssetType(e.target.value)}>
              {ASSET_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <button className="dg-btn" onClick={startDraft} disabled={busy}>Continuar</button>
        </div>
      )}

      {step === 1 && (
        <div className="dg-card">
          <h3>Fotografias</h3>
          <p>Carregue as fotografias relevantes (matrícula, placa técnica, nº série, danos, etc.). O processamento por IA corre automaticamente após o carregamento.</p>
          {PHOTO_KINDS.map((kind) => (
            <div key={kind} className="dg-field">
              <label>{kind}</label>
              <input type="file" accept="image/*" capture="environment" onChange={(e) => e.target.files?.[0] && uploadPhoto(kind, e.target.files[0])} />
            </div>
          ))}
          <button className="dg-btn" onClick={() => setStep(2)}>Continuar</button>
        </div>
      )}

      {step === 2 && (
        <div className="dg-card">
          <h3>Documentos</h3>
          <p>Carregue documentos (livrete, seguro, fatura de compra, ficha técnica, etc.) — opcional nesta fase.</p>
          <button className="dg-btn" onClick={loadExtractedFields} disabled={busy}>
            {busy ? 'A processar…' : 'Continuar para validação'}
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="dg-card">
          <h3>Validação dos dados extraídos por IA/OCR</h3>
          {fields.length === 0 && <p>Nenhum campo foi extraído automaticamente — preencha manualmente no passo seguinte.</p>}
          {fields.map((f) => (
            <div key={f.id} className="dg-card" style={{ background: '#f9fafc' }}>
              <p><strong>{f.field}</strong>: {f.value} <span className="dg-badge">{Math.round(f.confidence * 100)}% confiança</span></p>
              <p>Estado: {f.status}</p>
              {f.status === 'PENDING' && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="dg-btn secondary" onClick={() => reviewField(f.id, 'CONFIRMED')}>Confirmar</button>
                  <button className="dg-btn danger" onClick={() => reviewField(f.id, 'REJECTED')}>Rejeitar</button>
                </div>
              )}
            </div>
          ))}
          <button className="dg-btn" onClick={checkDuplicates}>Continuar</button>
        </div>
      )}

      {step === 4 && (
        <div className="dg-card">
          <h3>Deteção de duplicados</h3>
          {duplicates.length === 0 && <p>Nenhum duplicado provável encontrado.</p>}
          {duplicates.map((d) => (
            <div key={d.assetId} className="dg-card">
              <p>{d.internalCode} — correspondência: {d.matchedBy.join(', ')} (score {d.score})</p>
            </div>
          ))}
          <button className="dg-btn" onClick={() => setStep(5)} disabled={duplicates.some((d) => d.score >= 1)}>
            Continuar
          </button>
          {duplicates.some((d) => d.score >= 1) && (
            <p style={{ color: 'var(--dg-danger)' }}>Existe um duplicado exato — corrija os dados antes de prosseguir.</p>
          )}
        </div>
      )}

      {step === 5 && (
        <div className="dg-card">
          <h3>Confirmar dados</h3>
          <div className="dg-field"><label>Designação</label><input value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} /></div>
          <div className="dg-field"><label>Marca</label><input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} /></div>
          <div className="dg-field"><label>Modelo</label><input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} /></div>
          {assetType === 'VEHICLE' && (
            <>
              <div className="dg-field"><label>Matrícula</label><input value={form.plate} onChange={(e) => setForm({ ...form, plate: e.target.value })} /></div>
              <div className="dg-field"><label>VIN</label><input value={form.vin} onChange={(e) => setForm({ ...form, vin: e.target.value })} /></div>
            </>
          )}
          {assetType !== 'VEHICLE' && (
            <div className="dg-field"><label>Nº de série</label><input value={form.serialNumber} onChange={(e) => setForm({ ...form, serialNumber: e.target.value })} /></div>
          )}
          <button className="dg-btn" onClick={createAsset} disabled={busy || !form.designation}>
            {busy ? 'A criar…' : 'Criar ficha'}
          </button>
        </div>
      )}
    </div>
  );
}
