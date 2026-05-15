// ============================================================
// RegistroPage — Daily Record Creation Wizard
// DG ObraPro Global
// ============================================================

import { useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Mic,
  MicOff,
  MapPin,
  Check,
  Plus,
  Minus,
  X,
  CheckCircle2,
  Zap,
  Search,
  Image,
  FileText,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { mockProjects, mockActivities } from '../data/mockData'
import { type Activity } from '../types'

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const STEPS = ['Atividade', 'Produção', 'Media', 'Revisão'] as const
type Step = (typeof STEPS)[number]

const STEP_INFO: Record<Step, { description: string }> = {
  Atividade: { description: 'Selecione o tipo de trabalho executado' },
  Produção: { description: 'Introduza a quantidade produzida' },
  Media: { description: 'Adicione fotos, voz e observações' },
  Revisão: { description: 'Confirme os dados e submeta' },
}

const CATEGORY_COLORS: Record<string, string> = {
  Estruturas: 'border-orange-500/30 hover:border-orange-400/50',
  Betão: 'border-gray-500/30 hover:border-gray-400/50',
  Alvenaria: 'border-amber-500/30 hover:border-amber-400/50',
  Revestimentos: 'border-blue-500/30 hover:border-blue-400/50',
  Instalações: 'border-yellow-500/30 hover:border-yellow-400/50',
  Terraplenagem: 'border-stone-500/30 hover:border-stone-400/50',
  Impermeabilização: 'border-cyan-500/30 hover:border-cyan-400/50',
  Pavimentação: 'border-indigo-500/30 hover:border-indigo-400/50',
  Pintura: 'border-pink-500/30 hover:border-pink-400/50',
  Carpintaria: 'border-lime-500/30 hover:border-lime-400/50',
  Serralharia: 'border-slate-500/30 hover:border-slate-400/50',
  Cobertura: 'border-teal-500/30 hover:border-teal-400/50',
  Fundações: 'border-red-500/30 hover:border-red-400/50',
  Demolição: 'border-rose-500/30 hover:border-rose-400/50',
  Exterior: 'border-green-500/30 hover:border-green-400/50',
}

const MOCK_PHOTO_URLS = [
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&q=80',
  'https://images.unsplash.com/photo-1590579491624-f98f36d4c763?w=400&q=80',
  'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&q=80',
  'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&q=80',
]

const MOCK_GPS = {
  lat: '38.768432',
  lng: '-9.094187',
}

// ─────────────────────────────────────────────
// Progress Indicator
// ─────────────────────────────────────────────

function StepIndicator({ current }: { current: Step }) {
  const currentIdx = STEPS.indexOf(current)
  return (
    <div className="flex items-center">
      {STEPS.map((s, i) => {
        const isCompleted = i < currentIdx
        const isCurrent = i === currentIdx
        return (
          <div key={s} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1.5 flex-1">
              <div
                className={clsx(
                  'w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300',
                  isCompleted
                    ? 'bg-dg-yellow text-dg-black shadow-md shadow-dg-yellow/30'
                    : isCurrent
                    ? 'bg-dg-yellow text-dg-black shadow-lg shadow-dg-yellow/30 ring-4 ring-dg-yellow/20 scale-110'
                    : 'bg-dg-gray-3 text-dg-gray-light border border-dg-gray-5'
                )}
              >
                {isCompleted ? <Check size={15} /> : i + 1}
              </div>
              <span
                className={clsx(
                  'text-[10px] font-semibold text-center transition-colors',
                  isCurrent ? 'text-dg-yellow' : isCompleted ? 'text-dg-white' : 'text-dg-gray-light'
                )}
              >
                {s}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={clsx(
                  'flex-1 h-0.5 mb-5 mx-1 transition-all duration-500',
                  i < currentIdx ? 'bg-dg-yellow' : 'bg-dg-gray-3'
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─────────────────────────────────────────────
// Step 1: Atividade
// ─────────────────────────────────────────────

function StepAtividade({
  selected,
  onSelect,
}: {
  selected: Activity | null
  onSelect: (a: Activity) => void
}) {
  const [search, setSearch] = useState('')

  const filtered = mockActivities.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase())
  )

  const grouped = filtered.reduce(
    (acc, act) => {
      const cat = act.category as string
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(act)
      return acc
    },
    {} as Record<string, Activity[]>
  )

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dg-gray-light" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pesquisar atividade ou categoria..."
          className="input pl-10"
          autoFocus
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-dg-gray-light hover:text-dg-white"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Selected activity pill */}
      {selected && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-dg-yellow/10 border border-dg-yellow/30 animate-fade-in">
          <span className="text-2xl">{selected.icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-dg-yellow">{selected.name}</p>
            <p className="text-xs text-dg-yellow/70">{selected.unit} · {selected.category}</p>
          </div>
          <CheckCircle2 size={18} className="text-dg-yellow flex-shrink-0" />
        </div>
      )}

      {/* Category groups */}
      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-12">
          <Search size={32} className="text-dg-gray-4 mx-auto mb-3" />
          <p className="text-dg-gray-light text-sm">Nenhuma atividade para "{search}"</p>
        </div>
      ) : (
        Object.entries(grouped).map(([cat, acts]) => {
          const borderCls = CATEGORY_COLORS[cat] ?? 'border-dg-gray-4 hover:border-dg-gray-light'
          return (
            <div key={cat}>
              <p className="text-xs font-bold text-dg-gray-light mb-2.5 uppercase tracking-wider flex items-center gap-2">
                <span>{acts[0]?.icon}</span>
                {cat}
                <span className="text-dg-gray-5 font-normal normal-case tracking-normal">
                  ({acts.length})
                </span>
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {acts.map((act) => {
                  const isSelected = selected?.id === act.id
                  return (
                    <button
                      key={act.id}
                      onClick={() => onSelect(act)}
                      className={clsx(
                        'relative flex flex-col items-center gap-2.5 p-4 rounded-xl border bg-dg-gray-2 transition-all duration-200 text-center group',
                        isSelected
                          ? 'border-dg-yellow bg-dg-yellow/10 shadow-lg shadow-dg-yellow/10 scale-[1.02]'
                          : `${borderCls} hover:bg-dg-gray-3 hover:scale-[1.01]`
                      )}
                    >
                      {/* Selected checkmark */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-dg-yellow rounded-full flex items-center justify-center">
                          <Check size={11} className="text-dg-black" />
                        </div>
                      )}

                      <div
                        className={clsx(
                          'w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all',
                          isSelected ? 'bg-dg-yellow/20 scale-110' : 'bg-dg-gray-3 group-hover:bg-dg-gray-4'
                        )}
                      >
                        {act.icon}
                      </div>
                      <div>
                        <p
                          className={clsx(
                            'text-xs font-bold leading-tight',
                            isSelected ? 'text-dg-yellow' : 'text-dg-white'
                          )}
                        >
                          {act.name}
                        </p>
                        <p className="text-[10px] text-dg-gray-light mt-0.5">por {act.unit}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// Step 2: Produção
// ─────────────────────────────────────────────

function StepProducao({
  activity,
  quantity,
  onQuantityChange,
}: {
  activity: Activity
  quantity: number
  onQuantityChange: (q: number) => void
}) {
  function adjust(delta: number) {
    onQuantityChange(Math.max(0, quantity + delta))
  }

  const presets = [5, 10, 25, 50, 100, 200, 500, 1000]

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Activity summary */}
      <div className="flex items-center gap-4 p-4 rounded-2xl bg-dg-gray-2 border border-dg-gray-4">
        <div className="w-14 h-14 rounded-xl bg-dg-gray-3 border border-dg-gray-4 flex items-center justify-center text-3xl flex-shrink-0">
          {activity.icon}
        </div>
        <div>
          <p className="font-bold text-dg-white text-base">{activity.name}</p>
          <p className="text-sm text-dg-gray-light">
            {activity.category} · unidade:{' '}
            <strong className="text-dg-yellow">{activity.unit}</strong>
          </p>
          {activity.description && (
            <p className="text-xs text-dg-gray-5 mt-1">{activity.description}</p>
          )}
        </div>
      </div>

      {/* Big quantity input block */}
      <div className="card text-center py-8">
        <p className="text-xs text-dg-gray-light uppercase tracking-widest mb-6 font-semibold">
          Quantidade Executada
        </p>

        <div className="flex items-center justify-center gap-6">
          {/* Minus side */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => adjust(-10)}
              className="w-12 h-8 rounded-lg bg-dg-gray-3 border border-dg-gray-5 text-dg-gray-light hover:bg-dg-gray-4 hover:text-dg-white transition-all active:scale-95 text-xs font-bold"
            >
              -10
            </button>
            <button
              onClick={() => adjust(-1)}
              className="w-12 h-14 rounded-2xl bg-dg-gray-3 border border-dg-gray-5 flex items-center justify-center text-dg-white hover:bg-dg-gray-4 transition-all active:scale-95"
            >
              <Minus size={22} />
            </button>
          </div>

          {/* Number display */}
          <div className="flex flex-col items-center">
            <input
              type="number"
              value={quantity || ''}
              onChange={(e) => onQuantityChange(Math.max(0, Number(e.target.value)))}
              placeholder="0"
              className="w-44 text-center text-6xl font-black text-dg-yellow bg-transparent border-none outline-none tracking-tight leading-none"
              min={0}
            />
            <div className="h-px w-40 bg-gradient-to-r from-transparent via-dg-yellow/50 to-transparent mt-2" />
            <p className="text-dg-gray-light text-xl font-semibold mt-3">{activity.unit}</p>
          </div>

          {/* Plus side */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => adjust(10)}
              className="w-12 h-8 rounded-lg bg-dg-yellow/20 border border-dg-yellow/30 text-dg-yellow hover:bg-dg-yellow/30 transition-all active:scale-95 text-xs font-bold"
            >
              +10
            </button>
            <button
              onClick={() => adjust(1)}
              className="w-12 h-14 rounded-2xl bg-dg-yellow text-dg-black flex items-center justify-center hover:bg-dg-yellow-light transition-all active:scale-95 shadow-lg shadow-dg-yellow/30"
            >
              <Plus size={22} />
            </button>
          </div>
        </div>

        {/* Quick presets */}
        <div className="flex flex-wrap gap-2 justify-center mt-8">
          {presets.map((v) => (
            <button
              key={v}
              onClick={() => onQuantityChange(v)}
              className={clsx(
                'px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95',
                quantity === v
                  ? 'bg-dg-yellow text-dg-black shadow-md shadow-dg-yellow/20'
                  : 'bg-dg-gray-3 text-dg-gray-light hover:bg-dg-gray-4 hover:text-dg-white border border-dg-gray-5'
              )}
            >
              {v}
            </button>
          ))}
        </div>

        {quantity > 0 && (
          <p className="text-xs text-dg-yellow/60 mt-4">
            {quantity.toLocaleString('pt-PT')} {activity.unit} registados
          </p>
        )}
      </div>

      {/* GPS row */}
      <div className="flex items-center gap-4 p-4 rounded-2xl bg-green-500/5 border border-green-500/20">
        <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
          <MapPin size={18} className="text-green-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-dg-white">Localização GPS capturada</p>
          <p className="text-xs text-dg-gray-light font-mono mt-0.5">
            {MOCK_GPS.lat}° N, {MOCK_GPS.lng.replace('-', '')}° W
          </p>
        </div>
        <span className="badge-green">Ativo</span>
      </div>

      {/* Date row */}
      <div className="flex items-center gap-4 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
          <FileText size={18} className="text-blue-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-dg-white">Data do Registo</p>
          <p className="text-xs text-dg-gray-light mt-0.5">
            {new Date().toLocaleDateString('pt-PT', {
              weekday: 'long',
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
        <span className="badge-blue">Hoje</span>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Step 3: Media
// ─────────────────────────────────────────────

function StepMedia({
  photos,
  onAddPhoto,
  onRemovePhoto,
  notes,
  onNotesChange,
  isRecording,
  onToggleRecording,
  recordingSeconds,
}: {
  photos: string[]
  onAddPhoto: () => void
  onRemovePhoto: (i: number) => void
  notes: string
  onNotesChange: (v: string) => void
  isRecording: boolean
  onToggleRecording: () => void
  recordingSeconds: number
}) {
  function formatTime(s: number) {
    return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Photos */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-dg-white flex items-center gap-2">
              <Image size={16} className="text-dg-yellow" />
              Fotografias
            </h3>
            <p className="text-xs text-dg-gray-light mt-0.5">Máximo 4 fotos por registo</p>
          </div>
          <span
            className={clsx(
              'text-xs font-semibold px-2.5 py-1 rounded-lg',
              photos.length >= 4
                ? 'bg-dg-yellow/20 text-dg-yellow'
                : 'bg-dg-gray-3 text-dg-gray-light'
            )}
          >
            {photos.length}/4
          </span>
        </div>

        {/* 2×2 grid */}
        <div className="grid grid-cols-2 gap-3">
          {photos.map((p, i) => (
            <div
              key={i}
              className="relative aspect-[4/3] rounded-xl overflow-hidden bg-dg-gray-3 border border-dg-gray-4 group"
            >
              <img src={p} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => onRemovePhoto(i)}
                  className="w-9 h-9 bg-red-500/80 hover:bg-red-500 rounded-full flex items-center justify-center text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded-md font-medium">
                {i + 1}
              </div>
            </div>
          ))}

          {/* Empty / add slots */}
          {Array.from({ length: Math.max(0, 4 - photos.length) }).map((_, i) => {
            const isNextSlot = i === 0
            return (
              <button
                key={`empty-${i}`}
                onClick={isNextSlot ? onAddPhoto : undefined}
                disabled={!isNextSlot}
                className={clsx(
                  'aspect-[4/3] rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all',
                  isNextSlot
                    ? 'border-dg-yellow/40 bg-dg-yellow/5 hover:bg-dg-yellow/10 hover:border-dg-yellow/60 cursor-pointer active:scale-[0.98]'
                    : 'border-dg-gray-4 bg-dg-gray-2/50 cursor-default'
                )}
              >
                <Camera
                  size={isNextSlot ? 24 : 18}
                  className={isNextSlot ? 'text-dg-yellow' : 'text-dg-gray-5'}
                />
                {isNextSlot && (
                  <span className="text-xs font-semibold text-dg-yellow">Adicionar foto</span>
                )}
              </button>
            )
          })}
        </div>

        {photos.length === 0 && (
          <p className="text-center text-xs text-dg-gray-light mt-3">
            Clique no quadrado para adicionar uma foto
          </p>
        )}
      </div>

      {/* Voice note */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-dg-white flex items-center gap-2">
              <Mic size={16} className="text-dg-yellow" />
              Nota de Voz
            </h3>
            <p className="text-xs text-dg-gray-light mt-0.5">
              {isRecording ? 'Gravação em curso — clique para parar' : 'Toque no microfone para gravar'}
            </p>
          </div>
          {isRecording && (
            <span className="badge-red flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              {formatTime(recordingSeconds)}
            </span>
          )}
        </div>

        {/* Record button */}
        <button
          onClick={onToggleRecording}
          className={clsx(
            'w-full flex items-center justify-center gap-3 py-5 rounded-2xl border transition-all duration-300',
            isRecording
              ? 'bg-red-500/10 border-red-500/40 text-red-400 hover:bg-red-500/15'
              : 'bg-dg-gray-2 border-dg-gray-4 text-dg-gray-light hover:border-dg-yellow/40 hover:text-dg-yellow hover:bg-dg-yellow/5'
          )}
        >
          <div
            className={clsx(
              'w-12 h-12 rounded-full flex items-center justify-center transition-all',
              isRecording
                ? 'bg-red-500/20 ring-4 ring-red-500/20 animate-pulse-slow'
                : 'bg-dg-gray-3'
            )}
          >
            {isRecording ? (
              <MicOff size={20} className="text-red-400" />
            ) : (
              <Mic size={20} className="text-dg-gray-light" />
            )}
          </div>
          <span className="font-semibold text-sm">
            {isRecording ? 'Parar Gravação' : 'Iniciar Gravação de Voz'}
          </span>
        </button>

        {/* Waveform animation when recording */}
        {isRecording && (
          <div className="mt-4 p-3 bg-red-500/5 rounded-xl border border-red-500/10">
            <div className="flex items-end justify-center gap-0.5 h-10 overflow-hidden">
              {Array.from({ length: 36 }).map((_, i) => {
                const base = Math.sin(i * 0.5) * 0.5 + 0.5
                const h = 4 + base * 26
                return (
                  <div
                    key={i}
                    className="w-1 rounded-full bg-red-400"
                    style={{ height: `${h}px`, opacity: 0.3 + base * 0.7 }}
                  />
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Text notes */}
      <div className="card">
        <h3 className="font-bold text-dg-white mb-3 flex items-center gap-2">
          <FileText size={16} className="text-dg-yellow" />
          Observações e Notas
        </h3>
        <textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          rows={5}
          placeholder="Descreva as condições da obra, materiais utilizados, ocorrências, equipa envolvida, observações relevantes..."
          className="input resize-none leading-relaxed"
        />
        <div className="flex justify-between mt-2">
          <p className="text-[11px] text-dg-gray-5">Opcional mas recomendado</p>
          <p className="text-[11px] text-dg-gray-5">{notes.length} caracteres</p>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Step 4: Revisão
// ─────────────────────────────────────────────

function StepRevisao({
  projectName,
  activity,
  quantity,
  photos,
  notes,
}: {
  projectName: string
  activity: Activity
  quantity: number
  photos: string[]
  notes: string
}) {
  const validationItems = [
    { label: 'Atividade selecionada', ok: true, optional: false },
    { label: 'Quantidade preenchida', ok: quantity > 0, optional: false },
    { label: 'GPS capturado', ok: true, optional: false },
    { label: 'Data registada', ok: true, optional: false },
    { label: 'Fotos adicionadas', ok: photos.length > 0, optional: true },
    { label: 'Observações escritas', ok: notes.length > 0, optional: true },
  ]

  const allRequired = validationItems.filter((v) => !v.optional).every((v) => v.ok)

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Summary card */}
      <div className="card border-dg-yellow/20">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-dg-yellow/10 flex items-center justify-center">
            <CheckCircle2 size={20} className="text-dg-yellow" />
          </div>
          <div>
            <h3 className="font-bold text-dg-white">Resumo do Registo</h3>
            <p className="text-xs text-dg-gray-light">Verifique os dados antes de submeter</p>
          </div>
        </div>

        <dl className="space-y-0">
          {[
            { label: 'Obra', value: projectName },
            {
              label: 'Atividade',
              value: (
                <span className="flex items-center gap-2">
                  <span className="text-lg">{activity.icon}</span>
                  <span>{activity.name}</span>
                </span>
              ),
            },
            {
              label: 'Quantidade',
              value: (
                <span className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-dg-yellow">
                    {quantity.toLocaleString('pt-PT')}
                  </span>
                  <span className="text-sm text-dg-gray-light">{activity.unit}</span>
                </span>
              ),
            },
            { label: 'Categoria', value: activity.category },
            {
              label: 'GPS',
              value: (
                <span className="font-mono text-sm text-green-400">
                  {MOCK_GPS.lat}° N, {MOCK_GPS.lng.replace('-', '')}° W
                </span>
              ),
            },
            {
              label: 'Data',
              value: new Date().toLocaleDateString('pt-PT', {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              }),
            },
            {
              label: 'Fotografias',
              value: photos.length > 0
                ? `${photos.length} foto${photos.length !== 1 ? 's' : ''}`
                : <span className="text-dg-gray-5">Nenhuma</span>,
            },
            ...(notes
              ? [
                  {
                    label: 'Observações',
                    value: (
                      <span className="italic text-dg-white/80 line-clamp-2 text-xs">
                        "{notes}"
                      </span>
                    ),
                  },
                ]
              : []),
          ].map(({ label, value }, i, arr) => (
            <div
              key={label}
              className={clsx(
                'flex items-start gap-4 py-3',
                i < arr.length - 1 ? 'border-b border-dg-gray-3' : ''
              )}
            >
              <dt className="text-sm text-dg-gray-light w-28 flex-shrink-0 pt-0.5">{label}</dt>
              <dd className="text-sm text-dg-white font-medium flex-1">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Photo preview */}
      {photos.length > 0 && (
        <div>
          <p className="text-xs font-bold text-dg-gray-light uppercase tracking-wide mb-2">
            Fotos anexadas
          </p>
          <div className="grid grid-cols-4 gap-2">
            {photos.map((p, i) => (
              <div key={i} className="aspect-square rounded-xl overflow-hidden border border-dg-gray-4">
                <img src={p} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
            {Array.from({ length: 4 - photos.length }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="aspect-square rounded-xl bg-dg-gray-2 border border-dashed border-dg-gray-4 flex items-center justify-center"
              >
                <Camera size={14} className="text-dg-gray-5" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Validation checklist */}
      <div className="card bg-dg-gray-2">
        <p className="text-xs font-bold text-dg-gray-light uppercase tracking-wide mb-3">
          Estado de Validação
        </p>
        <div className="space-y-2.5">
          {validationItems.map(({ label, ok, optional }) => (
            <div key={label} className="flex items-center gap-3">
              <div
                className={clsx(
                  'w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px]',
                  ok
                    ? 'bg-green-500/20 text-green-400'
                    : optional
                    ? 'bg-dg-gray-3 text-dg-gray-light'
                    : 'bg-red-500/20 text-red-400'
                )}
              >
                {ok ? <Check size={11} /> : optional ? '—' : <X size={11} />}
              </div>
              <span
                className={clsx(
                  'text-sm',
                  ok ? 'text-dg-white' : optional ? 'text-dg-gray-light' : 'text-red-400'
                )}
              >
                {label}
                {optional && !ok && (
                  <span className="text-dg-gray-5 text-xs ml-1">(opcional)</span>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Submit info */}
      <div className="flex items-start gap-3 px-4 py-4 rounded-xl bg-dg-yellow/5 border border-dg-yellow/20">
        <Zap size={16} className="text-dg-yellow flex-shrink-0 mt-0.5" />
        <p className="text-sm text-dg-yellow/90 leading-relaxed">
          Este registo ficará em estado <strong>Submetido</strong> até ser validado pelo Diretor
          ou Encarregado de Obra. Receberá uma notificação quando for aprovado ou rejeitado.
        </p>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────

export default function RegistroPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const project = mockProjects.find((p) => p.id === id) ?? mockProjects[0]

  const [step, setStep] = useState<Step>('Atividade')
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [quantity, setQuantity] = useState(0)
  const [photos, setPhotos] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const stepIndex = STEPS.indexOf(step)

  const canNext = useCallback(() => {
    if (step === 'Atividade') return selectedActivity !== null
    if (step === 'Produção') return quantity > 0
    return true
  }, [step, selectedActivity, quantity])

  function goNext() {
    const idx = STEPS.indexOf(step)
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1])
  }

  function goBack() {
    const idx = STEPS.indexOf(step)
    if (idx > 0) setStep(STEPS[idx - 1])
  }

  function addMockPhoto() {
    if (photos.length < 4) {
      setPhotos((prev) => [...prev, MOCK_PHOTO_URLS[prev.length % MOCK_PHOTO_URLS.length]])
    }
  }

  function removePhoto(i: number) {
    setPhotos((prev) => prev.filter((_, j) => j !== i))
  }

  function toggleRecording() {
    if (isRecording) {
      setIsRecording(false)
      setRecordingSeconds(0)
    } else {
      setIsRecording(true)
      setRecordingSeconds(0)
      const start = Date.now()
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - start) / 1000)
        if (elapsed >= 60) {
          clearInterval(interval)
          setIsRecording(false)
          setRecordingSeconds(0)
        } else {
          setRecordingSeconds(elapsed)
        }
      }, 1000)
    }
  }

  async function handleSubmit() {
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 1400))
    setSubmitting(false)
    toast.success('Registo guardado com sucesso!', { duration: 4000 })
    navigate(`/obras/${project.id}`)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate(`/obras/${project.id}`)}
          className="flex items-center gap-2 text-dg-gray-light hover:text-dg-white text-sm mb-5 transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Voltar à Obra
        </button>

        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="badge-yellow flex items-center gap-1.5">
                <Zap size={10} />
                Registo Rápido
              </span>
            </div>
            <h1 className="text-xl font-black text-dg-white leading-tight truncate">{project.name}</h1>
            <p className="text-sm text-dg-gray-light mt-1 flex items-center gap-1.5">
              <MapPin size={12} />
              {project.location}
            </p>
          </div>

          <div className="flex-shrink-0 text-right">
            <p className="text-[11px] text-dg-gray-light uppercase tracking-wide">Passo</p>
            <p className="text-2xl font-black text-dg-yellow leading-none mt-0.5">
              {stepIndex + 1}
              <span className="text-dg-gray-light font-normal text-base">/{STEPS.length}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Step progress indicator */}
      <div className="card py-5">
        <StepIndicator current={step} />
      </div>

      {/* Current step label */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-dg-gray-2 border border-dg-gray-4">
        <div className="w-8 h-8 rounded-lg bg-dg-yellow/10 flex items-center justify-center flex-shrink-0 text-lg">
          {step === 'Atividade' && '📋'}
          {step === 'Produção' && '📊'}
          {step === 'Media' && '📷'}
          {step === 'Revisão' && '✅'}
        </div>
        <div>
          <p className="text-sm font-bold text-dg-white">{step}</p>
          <p className="text-xs text-dg-gray-light">{STEP_INFO[step].description}</p>
        </div>
      </div>

      {/* Step content */}
      <div className="min-h-[400px]">
        {step === 'Atividade' && (
          <StepAtividade selected={selectedActivity} onSelect={setSelectedActivity} />
        )}
        {step === 'Produção' && selectedActivity && (
          <StepProducao
            activity={selectedActivity}
            quantity={quantity}
            onQuantityChange={setQuantity}
          />
        )}
        {step === 'Media' && (
          <StepMedia
            photos={photos}
            onAddPhoto={addMockPhoto}
            onRemovePhoto={removePhoto}
            notes={notes}
            onNotesChange={setNotes}
            isRecording={isRecording}
            onToggleRecording={toggleRecording}
            recordingSeconds={recordingSeconds}
          />
        )}
        {step === 'Revisão' && selectedActivity && (
          <StepRevisao
            projectName={project.name}
            activity={selectedActivity}
            quantity={quantity}
            photos={photos}
            notes={notes}
          />
        )}
      </div>

      {/* Navigation bar */}
      <div className="flex items-center gap-3 pt-3 border-t border-dg-gray-3">
        {stepIndex > 0 ? (
          <button onClick={goBack} className="btn-secondary flex items-center gap-2">
            <ArrowLeft size={16} />
            Anterior
          </button>
        ) : (
          <div />
        )}

        {/* Progress dots */}
        <div className="flex-1 flex items-center justify-center gap-1.5">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={clsx(
                'rounded-full transition-all duration-300',
                i === stepIndex
                  ? 'w-6 h-2 bg-dg-yellow'
                  : i < stepIndex
                  ? 'w-2 h-2 bg-dg-yellow/50'
                  : 'w-2 h-2 bg-dg-gray-4'
              )}
            />
          ))}
        </div>

        {stepIndex < STEPS.length - 1 ? (
          <button
            onClick={goNext}
            disabled={!canNext()}
            className={clsx(
              'btn-primary flex items-center gap-2 transition-all',
              !canNext() && 'opacity-40 cursor-not-allowed pointer-events-none'
            )}
          >
            Seguinte
            <ArrowRight size={16} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={clsx(
              'btn-primary flex items-center gap-2 px-8',
              submitting && 'opacity-75 cursor-not-allowed'
            )}
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
