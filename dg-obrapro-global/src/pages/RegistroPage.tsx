import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, ArrowRight, Camera, Mic, MicOff, MapPin, Check,
  Plus, Minus, X, CheckCircle2, Zap
} from 'lucide-react'
import { mockProjects, mockActivities } from '../data/mockData'
import { type Activity } from '../types'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const STEPS = ['Atividade', 'Produção', 'Média', 'Revisão'] as const
type Step = (typeof STEPS)[number]

const CATEGORY_LABELS: Record<string, string> = {
  Estruturas: '🏗️ Estruturas',
  Betão: '🧱 Betão',
  Alvenaria: '🪨 Alvenaria',
  Revestimentos: '🎨 Revestimentos',
  Instalações: '⚡ Instalações',
  Terraplenagem: '🚜 Terraplenagem',
  Impermeabilizacao: '💧 Impermeabilização',
  Pavimentacao: '🛣️ Pavimentação',
  Pintura: '🖌️ Pintura',
  Carpintaria: '🪵 Carpintaria',
  Serralharia: '🔩 Serralharia',
  Cobertura: '🏠 Cobertura',
  Fundacoes: '⛏️ Fundações',
  Demolicao: '🔨 Demolição',
  Exterior: '🌿 Exterior',
}

const MOCK_PHOTOS = [
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400',
  'https://images.unsplash.com/photo-1590579491624-f98f36d4c763?w=400',
  'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400',
]

export default function RegistroPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const project = mockProjects.find((p) => p.id === id) ?? mockProjects[0]

  const [step, setStep] = useState<Step>('Atividade')
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [quantity, setQuantity] = useState(0)
  const [notes, setNotes] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [search, setSearch] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const stepIndex = STEPS.indexOf(step)

  const filteredActivities = mockActivities.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.category.toLowerCase().includes(search.toLowerCase())
  )

  const grouped = filteredActivities.reduce((acc, act) => {
    const cat = act.category as string
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(act)
    return acc
  }, {} as Record<string, Activity[]>)

  const next = () => {
    const idx = STEPS.indexOf(step)
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1])
  }

  const back = () => {
    const idx = STEPS.indexOf(step)
    if (idx > 0) setStep(STEPS[idx - 1])
  }

  const canNext = () => {
    if (step === 'Atividade') return selectedActivity !== null
    if (step === 'Produção') return quantity > 0
    return true
  }

  const handleAddMockPhoto = () => {
    if (photos.length < 4) {
      setPhotos([...photos, MOCK_PHOTOS[photos.length % MOCK_PHOTOS.length]])
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 1200))
    setSubmitting(false)
    toast.success('Registo guardado com sucesso! ✅')
    navigate(`/obras/${project.id}`)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate(`/obras/${project.id}`)}
          className="flex items-center gap-2 text-dg-gray-light hover:text-dg-white text-sm mb-4 transition-colors"
        >
          <ArrowLeft size={16} />
          Voltar à Obra
        </button>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge-yellow flex items-center gap-1"><Zap size={10} /> Registo Rápido</span>
            </div>
            <h1 className="text-xl font-black text-dg-white">{project.name}</h1>
          </div>
        </div>
      </div>

      {/* Progress steps */}
      <div className="card py-4">
        <div className="flex items-center gap-0">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-1 flex-1">
                <div
                  className={clsx(
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                    i < stepIndex ? 'bg-dg-yellow text-dg-black' :
                    i === stepIndex ? 'bg-dg-yellow text-dg-black ring-4 ring-dg-yellow/20' :
                    'bg-dg-gray-3 text-dg-gray-light'
                  )}
                >
                  {i < stepIndex ? <Check size={14} /> : i + 1}
                </div>
                <span className={clsx(
                  'text-[10px] font-medium text-center',
                  i === stepIndex ? 'text-dg-yellow' : 'text-dg-gray-light'
                )}>{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={clsx('flex-1 h-0.5 mb-5', i < stepIndex ? 'bg-dg-yellow' : 'bg-dg-gray-3')} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="min-h-[400px]">
        {step === 'Atividade' && (
          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Pesquisar atividade..."
                className="input"
              />
            </div>
            {Object.entries(grouped).map(([cat, acts]) => (
              <div key={cat}>
                <p className="text-xs font-semibold text-dg-gray-light mb-2 px-1">
                  {CATEGORY_LABELS[cat] ?? cat}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {acts.map((act) => (
                    <button
                      key={act.id}
                      onClick={() => setSelectedActivity(act)}
                      className={clsx(
                        'flex flex-col items-center gap-2 p-4 rounded-xl border transition-all text-center',
                        selectedActivity?.id === act.id
                          ? 'bg-dg-yellow/10 border-dg-yellow text-dg-yellow'
                          : 'bg-dg-gray-2 border-dg-gray-4 text-dg-gray-light hover:border-dg-gray-light hover:text-dg-white'
                      )}
                    >
                      <span className="text-2xl">{act.icon}</span>
                      <div>
                        <p className="text-xs font-semibold leading-tight">{act.name}</p>
                        <p className="text-[10px] mt-0.5 opacity-70">{act.unit}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {step === 'Produção' && selectedActivity && (
          <div className="space-y-6">
            <div className="card text-center">
              <div className="inline-flex items-center gap-3 mb-4">
                <span className="text-4xl">{selectedActivity.icon}</span>
                <div className="text-left">
                  <p className="font-bold text-dg-white text-lg">{selectedActivity.name}</p>
                  <p className="text-dg-gray-light text-sm">Unidade: <strong className="text-dg-yellow">{selectedActivity.unit}</strong></p>
                </div>
              </div>

              {/* Big quantity input */}
              <div className="flex items-center justify-center gap-6 mt-6">
                <button
                  onClick={() => setQuantity(Math.max(0, quantity - (quantity >= 100 ? 10 : 1)))}
                  className="w-14 h-14 rounded-2xl bg-dg-gray-3 border border-dg-gray-4 flex items-center justify-center text-dg-white hover:bg-dg-gray-4 transition-colors active:scale-95"
                >
                  <Minus size={24} />
                </button>
                <div className="text-center">
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(0, Number(e.target.value)))}
                    className="w-40 text-center text-5xl font-black text-dg-yellow bg-transparent border-none outline-none"
                    min={0}
                  />
                  <p className="text-dg-gray-light text-lg font-semibold">{selectedActivity.unit}</p>
                </div>
                <button
                  onClick={() => setQuantity(quantity + (quantity >= 100 ? 10 : 1))}
                  className="w-14 h-14 rounded-2xl bg-dg-yellow text-dg-black flex items-center justify-center hover:bg-dg-yellow-light transition-colors active:scale-95"
                >
                  <Plus size={24} />
                </button>
              </div>

              {/* Quick preset buttons */}
              <div className="flex flex-wrap gap-2 justify-center mt-6">
                {[10, 25, 50, 100, 200, 500].map((v) => (
                  <button
                    key={v}
                    onClick={() => setQuantity(v)}
                    className={clsx(
                      'px-3 py-1.5 rounded-lg text-sm font-semibold transition-all',
                      quantity === v ? 'bg-dg-yellow text-dg-black' : 'bg-dg-gray-3 text-dg-gray-light hover:bg-dg-gray-4'
                    )}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* GPS */}
            <div className="card flex items-center gap-3">
              <MapPin size={18} className="text-dg-yellow flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-dg-white">Localização GPS</p>
                <p className="text-xs text-dg-gray-light">38.7683° N, 9.0937° W — capturado automaticamente</p>
              </div>
              <span className="badge-green">Ativo</span>
            </div>
          </div>
        )}

        {step === 'Média' && (
          <div className="space-y-4">
            {/* Photo upload */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-dg-white">Fotografias</h3>
                <span className="text-xs text-dg-gray-light">{photos.length}/4 fotos</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {photos.map((p, i) => (
                  <div key={i} className="relative aspect-video rounded-xl overflow-hidden">
                    <img src={p} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setPhotos(photos.filter((_, j) => j !== i))}
                      className="absolute top-2 right-2 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {photos.length < 4 && (
                  <button
                    onClick={handleAddMockPhoto}
                    className="aspect-video rounded-xl border-2 border-dashed border-dg-gray-4 hover:border-dg-yellow flex flex-col items-center justify-center gap-2 text-dg-gray-light hover:text-dg-yellow transition-all"
                  >
                    <Camera size={24} />
                    <span className="text-xs font-medium">Adicionar foto</span>
                  </button>
                )}
              </div>
            </div>

            {/* Voice note */}
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-dg-white">Nota de Voz</h3>
                {isRecording && <span className="badge-red flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" /> A gravar</span>}
              </div>
              <button
                onClick={() => setIsRecording(!isRecording)}
                className={clsx(
                  'w-full flex items-center justify-center gap-3 py-4 rounded-xl border transition-all',
                  isRecording
                    ? 'bg-red-500/10 border-red-500/30 text-red-400'
                    : 'bg-dg-gray-2 border-dg-gray-4 text-dg-gray-light hover:border-dg-yellow hover:text-dg-yellow'
                )}
              >
                {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                <span className="font-medium">{isRecording ? 'Parar Gravação' : 'Iniciar Gravação de Voz'}</span>
              </button>
              {isRecording && (
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-red-400 rounded-full"
                        style={{ height: `${4 + Math.random() * 16}px`, animationDelay: `${i * 0.05}s` }}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-red-400 font-mono">00:12</span>
                </div>
              )}
            </div>

            {/* Text notes */}
            <div className="card">
              <h3 className="font-bold text-dg-white mb-3">Observações</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Adicione notas, observações ou comentários sobre a produção..."
                className="input resize-none"
              />
            </div>
          </div>
        )}

        {step === 'Revisão' && selectedActivity && (
          <div className="space-y-4">
            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle2 size={20} className="text-dg-yellow" />
                <h3 className="font-bold text-dg-white">Revisão do Registo</h3>
              </div>
              <dl className="space-y-4">
                <ReviewRow label="Obra" value={project.name} />
                <ReviewRow label="Atividade" value={`${selectedActivity.icon} ${selectedActivity.name}`} />
                <ReviewRow label="Quantidade" value={<span className="text-2xl font-black text-dg-yellow">{quantity} <span className="text-sm font-normal text-dg-gray-light">{selectedActivity.unit}</span></span>} />
                <ReviewRow label="Fotografias" value={`${photos.length} foto${photos.length !== 1 ? 's' : ''}`} />
                {notes && <ReviewRow label="Observações" value={notes} />}
                <ReviewRow label="GPS" value="38.7683° N, 9.0937° W" />
                <ReviewRow label="Data" value={new Date().toLocaleDateString('pt-PT')} />
              </dl>
            </div>

            {photos.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {photos.map((p, i) => (
                  <div key={i} className="aspect-square rounded-xl overflow-hidden">
                    <img src={p} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}

            <div className="bg-dg-yellow/10 border border-dg-yellow/20 rounded-xl p-4 flex items-center gap-3">
              <Zap size={16} className="text-dg-yellow flex-shrink-0" />
              <p className="text-sm text-dg-yellow">
                Este registo será submetido para validação pelo encarregado e diretor de obra.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        {stepIndex > 0 && (
          <button onClick={back} className="btn-secondary flex items-center gap-2">
            <ArrowLeft size={16} />
            Anterior
          </button>
        )}
        <div className="flex-1" />
        {stepIndex < STEPS.length - 1 ? (
          <button
            onClick={next}
            disabled={!canNext()}
            className={clsx('btn-primary flex items-center gap-2', !canNext() && 'opacity-40 cursor-not-allowed')}
          >
            Seguinte
            <ArrowRight size={16} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-primary flex items-center gap-2 px-8"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-dg-black/30 border-t-dg-black rounded-full animate-spin" />
                A guardar...
              </>
            ) : (
              <>
                <Check size={16} />
                Guardar Registo
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

function ReviewRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 pb-3 border-b border-dg-gray-3 last:border-0 last:pb-0">
      <dt className="text-sm text-dg-gray-light w-28 flex-shrink-0">{label}</dt>
      <dd className="text-sm text-dg-white font-medium flex-1">{value}</dd>
    </div>
  )
}
