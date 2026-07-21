// ============================================================
// ObraDetailPage — Project Detail
// DG ObraPro Global
// ============================================================

import { useState, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import {
  ArrowLeft,
  Camera,
  MapPin,
  TrendingUp,
  Clock,
  Wallet,
  FileText,
  Users,
  BarChart3,
  Calendar,
  User,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Image,
  Mic,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import {
  mockProjects,
  mockCountries,
  mockCompanies,
  mockActivities,
  mockRecords,
} from '../data/mockData'
import { ProjectStatus, RecordStatus, type Project, type DailyRecord } from '../types'

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const TOOLTIP_STYLE = {
  backgroundColor: '#1A1A1A',
  border: '1px solid #2A2A2A',
  borderRadius: '12px',
  color: '#F5F5F5',
  fontSize: '12px',
}

const TABS = ['Visão Geral', 'Registos Diários', 'Timeline', 'Equipa'] as const
type Tab = (typeof TABS)[number]

const RECORD_STATUS: Record<RecordStatus, { badge: string; label: string; dot: string }> = {
  [RecordStatus.Rascunho]: { badge: 'badge-gray', label: 'Rascunho', dot: 'bg-dg-gray-5' },
  [RecordStatus.Submetido]: { badge: 'badge-yellow', label: 'Submetido', dot: 'bg-dg-yellow' },
  [RecordStatus.Validado]: { badge: 'badge-green', label: 'Validado', dot: 'bg-green-400' },
  [RecordStatus.Rejeitado]: { badge: 'badge-red', label: 'Rejeitado', dot: 'bg-red-400' },
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function formatCurrency(value: number, countryId: string): string {
  const country = mockCountries.find((c) => c.id === countryId)
  if (!country) return value.toLocaleString('pt-PT')
  try {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: country.currency,
      maximumFractionDigits: 0,
    }).format(value)
  } catch {
    return `${country.currency} ${value.toLocaleString('pt-PT')}`
  }
}

function generateDailyData(records: DailyRecord[], days = 14) {
  const result: { day: string; qty: number; date: string; count: number }[] = []
  const today = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const dayRecords = records.filter((r) => r.date === dateStr)
    const qty = dayRecords.reduce((s, r) => s + r.quantity, 0)
    result.push({
      date: dateStr,
      day: `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`,
      qty: Math.round(qty),
      count: dayRecords.length,
    })
  }
  return result
}

// ─────────────────────────────────────────────
// KPI Card
// ─────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  iconCls,
  bgCls,
  highlight = false,
}: {
  label: string
  value: string
  sub: string
  icon: React.ElementType
  iconCls: string
  bgCls: string
  highlight?: boolean
}) {
  return (
    <div className={clsx('card flex flex-col gap-3', highlight && 'border-dg-yellow/30 glow-yellow')}>
      <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center', bgCls)}>
        <Icon size={20} className={iconCls} />
      </div>
      <div>
        <p className="text-2xl font-black text-dg-white leading-none">{value}</p>
        <p className="text-xs font-semibold text-dg-gray-light mt-1">{label}</p>
        <p className="text-[10px] text-dg-gray-5 mt-0.5">{sub}</p>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Tab: Visão Geral
// ─────────────────────────────────────────────

function TabVisaoGeral({
  project,
  projectRecords,
  dailyData,
}: {
  project: Project
  projectRecords: DailyRecord[]
  dailyData: { day: string; qty: number; count: number }[]
}) {
  const country = mockCountries.find((c) => c.id === project.countryId)
  const company = mockCompanies.find((c) => c.id === project.companyId)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Project info card */}
        <div className="lg:col-span-2 card">
          <h3 className="font-bold text-dg-white mb-5 flex items-center gap-2">
            <FileText size={16} className="text-dg-yellow" />
            Informações
          </h3>
          <dl className="space-y-4">
            {[
              { label: 'Cliente', value: project.client, icon: Building2 },
              { label: 'Diretor', value: project.directorName, icon: User },
              { label: 'Encarregado', value: project.encarregadoName, icon: Users },
              {
                label: 'Início',
                value: new Date(project.startDate).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' }),
                icon: Calendar,
              },
              {
                label: 'Prazo',
                value: new Date(project.deadline).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' }),
                icon: Clock,
              },
              {
                label: 'País',
                value: `${country?.flag ?? ''} ${country?.name ?? ''}`,
                icon: MapPin,
              },
              {
                label: 'Empresa',
                value: `${company?.logo ?? ''} ${company?.name ?? ''}`,
                icon: Building2,
              },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-dg-gray-3 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon size={12} className="text-dg-gray-light" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-dg-gray-light uppercase tracking-wide">{label}</p>
                  <p className="text-sm text-dg-white font-medium mt-0.5 truncate">{value}</p>
                </div>
              </div>
            ))}
          </dl>

          {project.description && (
            <div className="mt-5 pt-4 border-t border-dg-gray-3">
              <p className="text-[11px] text-dg-gray-light uppercase tracking-wide mb-2">Descrição</p>
              <p className="text-sm text-dg-white/80 leading-relaxed">{project.description}</p>
            </div>
          )}
        </div>

        {/* Production chart */}
        <div className="lg:col-span-3 card">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-dg-white flex items-center gap-2">
                <BarChart3 size={16} className="text-dg-yellow" />
                Produção Diária
              </h3>
              <p className="text-xs text-dg-gray-light mt-0.5">Últimas 2 semanas</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-black text-dg-yellow">
                {dailyData.reduce((s, d) => s + d.qty, 0).toLocaleString('pt-PT')}
              </p>
              <p className="text-[11px] text-dg-gray-light">unidades totais</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dailyData} barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fill: '#6B6B6B', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                interval={1}
              />
              <YAxis
                tick={{ fill: '#6B6B6B', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(value) => [`${value} un`, 'Produção']}
                labelFormatter={(l) => `Dia ${l}`}
              />
              <Bar dataKey="qty" radius={[4, 4, 0, 0]}>
                {dailyData.map((d, i) => (
                  <Cell
                    key={i}
                    fill={d.qty > 150 ? '#F5C518' : d.qty > 0 ? '#F5C518' : '#2A2A2A'}
                    fillOpacity={d.qty > 150 ? 1 : d.qty > 0 ? 0.6 : 0.3}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent records */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-dg-white flex items-center gap-2">
            <Camera size={16} className="text-dg-yellow" />
            Registos Recentes
          </h3>
          <span className="text-xs text-dg-gray-light">{projectRecords.length} total</span>
        </div>
        {projectRecords.length === 0 ? (
          <div className="text-center py-12">
            <Camera size={36} className="text-dg-gray-4 mx-auto mb-3" />
            <p className="text-dg-white font-semibold mb-1">Sem registos de produção</p>
            <p className="text-dg-gray-light text-sm">Crie o primeiro registo desta obra</p>
          </div>
        ) : (
          <div className="space-y-2">
            {projectRecords.slice(0, 5).map((r) => {
              const act = mockActivities.find((a) => a.id === r.activityId)
              const st = RECORD_STATUS[r.status]
              return (
                <div
                  key={r.id}
                  className="flex items-center gap-4 p-3 rounded-xl bg-dg-gray-2 hover:bg-dg-gray-3 transition-colors border border-transparent hover:border-dg-gray-4"
                >
                  {/* Thumbnail */}
                  <div className="w-12 h-10 rounded-lg bg-dg-gray-4 flex items-center justify-center text-xl flex-shrink-0 overflow-hidden">
                    {r.photos.length > 0 ? (
                      <img src={r.photos[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span>{act?.icon ?? '📋'}</span>
                    )}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-dg-white truncate">{act?.name ?? 'Atividade'}</p>
                      <span className={clsx(st.badge, 'text-[10px] flex-shrink-0')}>{st.label}</span>
                    </div>
                    <p className="text-xs text-dg-gray-light truncate">
                      {r.responsavel} · {r.team} · {new Date(r.date).toLocaleDateString('pt-PT')}
                    </p>
                  </div>
                  {/* Quantity */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-base font-black text-dg-yellow">
                      {r.quantity.toLocaleString('pt-PT')}
                    </p>
                    <p className="text-[10px] text-dg-gray-light">{r.unit}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Tab: Registos Diários
// ─────────────────────────────────────────────

function TabRegistos({ records }: { records: DailyRecord[] }) {
  const [filterStatus, setFilterStatus] = useState<RecordStatus | ''>('')

  const filtered = filterStatus ? records.filter((r) => r.status === filterStatus) : records

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Filter buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterStatus('')}
          className={clsx(
            'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
            filterStatus === '' ? 'bg-dg-yellow text-dg-black' : 'bg-dg-gray-3 text-dg-gray-light hover:bg-dg-gray-4'
          )}
        >
          Todos ({records.length})
        </button>
        {Object.values(RecordStatus).map((s) => {
          const count = records.filter((r) => r.status === s).length
          if (!count) return null
          const st = RECORD_STATUS[s]
          return (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                filterStatus === s ? st.badge : 'bg-dg-gray-3 text-dg-gray-light hover:bg-dg-gray-4'
              )}
            >
              {st.label} ({count})
            </button>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-16">
          <Camera size={40} className="text-dg-gray-4 mx-auto mb-3" />
          <p className="text-dg-white font-semibold">Sem registos encontrados</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => {
            const act = mockActivities.find((a) => a.id === r.activityId)
            const st = RECORD_STATUS[r.status]
            return (
              <div key={r.id} className="card hover:border-dg-gray-4 transition-colors">
                <div className="flex flex-wrap gap-4 items-start">
                  {/* Thumbnail or icon */}
                  <div className="w-20 h-16 rounded-xl bg-dg-gray-3 flex items-center justify-center text-3xl flex-shrink-0 overflow-hidden border border-dg-gray-4">
                    {r.photos.length > 0 ? (
                      <div className="relative w-full h-full">
                        <img src={r.photos[0]} alt="" className="w-full h-full object-cover" />
                        {r.photos.length > 1 && (
                          <div className="absolute bottom-1.5 right-1.5 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            <Image size={8} />
                            +{r.photos.length - 1}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span>{act?.icon ?? '📋'}</span>
                    )}
                  </div>

                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <p className="text-sm font-bold text-dg-white">{act?.name ?? r.activityId}</p>
                      <span className={clsx(st.badge, 'text-[10px]')}>
                        <span className={clsx('w-1.5 h-1.5 rounded-full', st.dot)} />
                        {st.label}
                      </span>
                    </div>
                    <p className="text-xs text-dg-gray-light mb-1">
                      <span className="text-dg-white font-medium">{r.responsavel}</span>
                      {' · '}
                      {r.team}
                      {r.subEmpreiteiro && (
                        <span className="text-dg-gray-5"> · Sub: {r.subEmpreiteiro}</span>
                      )}
                    </p>
                    {r.text && (
                      <p className="text-xs text-dg-gray-light line-clamp-1 mt-1 italic">"{r.text}"</p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1 text-[11px] text-dg-gray-light">
                        <Calendar size={10} />
                        {new Date(r.date).toLocaleDateString('pt-PT')}
                      </div>
                      {r.voiceNote && (
                        <div className="flex items-center gap-1 text-[11px] text-dg-gray-light">
                          <Mic size={10} />
                          Nota de voz
                        </div>
                      )}
                      {r.gpsLat && (
                        <div className="flex items-center gap-1 text-[11px] text-dg-gray-light">
                          <MapPin size={10} />
                          GPS
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-2xl font-black text-dg-yellow leading-none">
                      {r.quantity.toLocaleString('pt-PT')}
                    </p>
                    <p className="text-xs text-dg-gray-light mt-0.5">{r.unit}</p>
                    {r.validatedBy && (
                      <p className="text-[10px] text-green-400 mt-1 flex items-center gap-0.5 justify-end">
                        <CheckCircle2 size={9} />
                        {r.validatedBy}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// Tab: Timeline
// ─────────────────────────────────────────────

function TabTimeline({ records }: { records: DailyRecord[] }) {
  const weeks = useMemo(() => {
    const today = new Date()
    const result: { weekLabel: string; days: { date: string; label: string; dayName: string; qty: number; count: number; isToday: boolean; isWeekend: boolean }[] }[] = []

    for (let w = 3; w >= 0; w--) {
      const weekStart = new Date(today)
      weekStart.setDate(today.getDate() - today.getDay() + 1 - w * 7)
      const days = []
      for (let d = 0; d < 7; d++) {
        const day = new Date(weekStart)
        day.setDate(weekStart.getDate() + d)
        const dateStr = day.toISOString().split('T')[0]
        const dayRecords = records.filter((r) => r.date === dateStr)
        const qty = dayRecords.reduce((s, r) => s + r.quantity, 0)
        const isToday = dateStr === today.toISOString().split('T')[0]
        const isWeekend = d === 5 || d === 6
        days.push({
          date: dateStr,
          label: day.getDate().toString(),
          dayName: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'][d],
          qty: Math.round(qty),
          count: dayRecords.length,
          isToday,
          isWeekend,
        })
      }
      result.push({
        weekLabel: `Semana ${weekStart.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' })}`,
        days,
      })
    }
    return result
  }, [records])

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-dg-white">Timeline de Produção</h3>
          <div className="flex items-center gap-4">
            {[
              { color: 'bg-dg-yellow', label: 'Alta produção' },
              { color: 'bg-dg-yellow/40', label: 'Com atividade' },
              { color: 'bg-dg-gray-3', label: 'Sem registo' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5 hidden sm:flex">
                <div className={clsx('w-3 h-3 rounded-full', color)} />
                <span className="text-[11px] text-dg-gray-light">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {weeks.map((week) => (
            <div key={week.weekLabel}>
              <p className="text-xs font-semibold text-dg-gray-light mb-3 uppercase tracking-wide">
                {week.weekLabel}
              </p>
              <div className="grid grid-cols-7 gap-2">
                {week.days.map((day) => (
                  <div key={day.date} className="flex flex-col items-center gap-1.5">
                    <p className="text-[10px] text-dg-gray-5">{day.dayName}</p>
                    <div
                      className={clsx(
                        'relative w-10 h-10 rounded-xl flex items-center justify-center border transition-all cursor-default',
                        day.isToday
                          ? 'ring-2 ring-dg-yellow ring-offset-1 ring-offset-dg-gray'
                          : '',
                        day.count > 2
                          ? 'bg-dg-yellow border-dg-yellow text-dg-black font-black'
                          : day.count > 0
                          ? 'bg-dg-yellow/20 border-dg-yellow/40 text-dg-yellow font-semibold'
                          : day.isWeekend
                          ? 'bg-dg-gray-2 border-dg-gray-3 text-dg-gray-5'
                          : 'bg-dg-gray-3 border-dg-gray-4 text-dg-gray-light'
                      )}
                    >
                      <span className="text-xs">{day.label}</span>
                      {day.count > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-dg-yellow text-dg-black text-[9px] font-black rounded-full flex items-center justify-center">
                          {day.count}
                        </span>
                      )}
                    </div>
                    <p className={clsx(
                      'text-[10px] font-medium',
                      day.qty > 0 ? 'text-dg-yellow' : 'text-dg-gray-5'
                    )}>
                      {day.qty > 0 ? day.qty : '—'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-dg-gray-3">
          {[
            {
              label: 'Dias com produção',
              value: weeks.flatMap((w) => w.days).filter((d) => d.count > 0).length,
              color: 'text-dg-yellow',
            },
            {
              label: 'Total de registos',
              value: records.length,
              color: 'text-blue-400',
            },
            {
              label: 'Dias sem atividade',
              value: weeks.flatMap((w) => w.days).filter((d) => d.count === 0 && !d.isWeekend).length,
              color: 'text-dg-gray-light',
            },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center">
              <p className={clsx('text-xl font-black', color)}>{value}</p>
              <p className="text-[11px] text-dg-gray-light mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Tab: Equipa
// ─────────────────────────────────────────────

function TabEquipa({ project, records }: { project: Project; records: DailyRecord[] }) {
  // Build unique team members from records and teams
  const teamMembers = useMemo(() => {
    const responsavelMap = new Map<string, { name: string; recordCount: number; teams: Set<string> }>()
    records.forEach((r) => {
      const existing = responsavelMap.get(r.responsavel)
      if (existing) {
        existing.recordCount++
        existing.teams.add(r.team)
      } else {
        responsavelMap.set(r.responsavel, {
          name: r.responsavel,
          recordCount: 1,
          teams: new Set([r.team]),
        })
      }
    })
    return Array.from(responsavelMap.values()).sort((a, b) => b.recordCount - a.recordCount)
  }, [records])

  const avatarColors = ['#F5C518', '#1E6FBA', '#10B981', '#8B5CF6', '#EF4444', '#F97316']

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Teams */}
      <div>
        <h3 className="section-title flex items-center gap-2">
          <Users size={16} className="text-dg-yellow" />
          Equipas da Obra
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {project.teams.map((team, idx) => (
            <div key={team.id} className="card hover:border-dg-gray-4 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-bold text-dg-white">{team.name}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="w-2 h-2 rounded-full bg-dg-yellow" />
                    <p className="text-xs text-dg-gray-light">{team.specialty}</p>
                  </div>
                </div>
                <span className="badge-green">{team.members} membros</span>
              </div>

              {/* Avatar stack */}
              <div className="flex items-center justify-between">
                <div className="flex -space-x-2.5">
                  {Array.from({ length: Math.min(team.members, 6) }).map((_, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-dg-gray flex items-center justify-center text-xs font-bold text-dg-black shadow-md"
                      style={{ backgroundColor: avatarColors[i % avatarColors.length] }}
                    >
                      {String.fromCharCode(65 + (idx * 6 + i) % 26)}
                    </div>
                  ))}
                  {team.members > 6 && (
                    <div className="w-8 h-8 rounded-full border-2 border-dg-gray bg-dg-gray-3 flex items-center justify-center text-[10px] font-bold text-dg-gray-light shadow-md">
                      +{team.members - 6}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-dg-yellow">{team.members}</p>
                  <p className="text-[10px] text-dg-gray-light">pessoas</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active members from records */}
      {teamMembers.length > 0 && (
        <div>
          <h3 className="section-title flex items-center gap-2">
            <TrendingUp size={16} className="text-dg-yellow" />
            Responsáveis Ativos
          </h3>
          <div className="card">
            <div className="space-y-3">
              {teamMembers.map((member, i) => (
                <div
                  key={member.name}
                  className="flex items-center gap-4 p-3 rounded-xl bg-dg-gray-2 border border-dg-gray-4"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-dg-black flex-shrink-0"
                    style={{ backgroundColor: avatarColors[i % avatarColors.length] }}
                  >
                    {member.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-dg-white">{member.name}</p>
                    <p className="text-xs text-dg-gray-light truncate">
                      {Array.from(member.teams).join(', ')}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-base font-black text-dg-yellow">{member.recordCount}</p>
                    <p className="text-[10px] text-dg-gray-light">
                      {member.recordCount === 1 ? 'registo' : 'registos'}
                    </p>
                  </div>
                  {i === 0 && (
                    <span className="badge-yellow text-[10px] flex-shrink-0">Top</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────

export default function ObraDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('Visão Geral')

  const project = mockProjects.find((p) => p.id === id)

  // Not found fallback
  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 bg-dg-gray-2 border border-dg-gray-4 rounded-2xl flex items-center justify-center mb-5">
          <AlertTriangle size={36} className="text-dg-yellow" />
        </div>
        <h2 className="text-xl font-bold text-dg-white mb-2">Obra não encontrada</h2>
        <p className="text-dg-gray-light text-sm mb-6">
          O projeto com ID "{id}" não existe ou foi removido.
        </p>
        <Link to="/obras" className="btn-primary flex items-center gap-2">
          <ArrowLeft size={16} />
          Voltar às Obras
        </Link>
      </div>
    )
  }

  const country = mockCountries.find((c) => c.id === project.countryId)
  const company = mockCompanies.find((c) => c.id === project.companyId)
  const projectRecords = mockRecords.filter((r) => r.projectId === project.id)
  const daysLeft = Math.ceil((new Date(project.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  const budgetPct = Math.round((project.spent / project.budget) * 100)
  const dailyData = generateDailyData(projectRecords, 14)

  const statusCfg: Record<ProjectStatus, { badge: string; label: string }> = {
    [ProjectStatus.EmCurso]: { badge: 'badge-green', label: 'Em Curso' },
    [ProjectStatus.Concluido]: { badge: 'badge-blue', label: 'Concluído' },
    [ProjectStatus.Planeamento]: { badge: 'badge-yellow', label: 'Planeamento' },
    [ProjectStatus.Suspenso]: { badge: 'badge-red', label: 'Suspenso' },
    [ProjectStatus.Cancelado]: { badge: 'badge-gray', label: 'Cancelado' },
  }
  const status = statusCfg[project.status]

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-dg-gray-light hover:text-dg-white text-sm transition-colors group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
        Voltar às Obras
      </button>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-16 h-16 rounded-2xl bg-dg-gray-3 border border-dg-gray-4 flex items-center justify-center text-3xl flex-shrink-0">
            {country?.flag ?? '🏗️'}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-black text-dg-white leading-tight">{project.name}</h1>
              <span className={status.badge}>{status.label}</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-dg-gray-light">
              <span className="flex items-center gap-1">
                <MapPin size={12} />
                {project.location}
              </span>
              <span className="text-dg-gray-5">·</span>
              <span className="flex items-center gap-1">
                <Building2 size={12} />
                {company?.name}
              </span>
              {country && (
                <>
                  <span className="text-dg-gray-5">·</span>
                  <span>{country.flag} {country.name}</span>
                </>
              )}
            </div>

            {/* Progress bar in header */}
            <div className="flex items-center gap-3 mt-3">
              <div className="w-48 h-2 bg-dg-gray-3 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-dg-yellow to-dg-yellow-light rounded-full transition-all"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
              <span className="text-xs font-bold text-dg-yellow">{project.progress}% concluído</span>
            </div>
          </div>
        </div>

        <Link
          to={`/obras/${project.id}/registro`}
          className="btn-primary flex items-center gap-2 flex-shrink-0"
        >
          <Camera size={16} />
          Novo Registo
        </Link>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Progresso"
          value={`${project.progress}%`}
          sub="conclusão global"
          icon={TrendingUp}
          iconCls="text-dg-yellow"
          bgCls="bg-dg-yellow/10"
          highlight
        />
        <KpiCard
          label="Dias Restantes"
          value={
            project.status === ProjectStatus.Concluido
              ? 'Concluído'
              : daysLeft < 0
              ? `${Math.abs(daysLeft)}d atraso`
              : `${daysLeft}d`
          }
          sub={`prazo: ${new Date(project.deadline).toLocaleDateString('pt-PT')}`}
          icon={Clock}
          iconCls={daysLeft < 0 ? 'text-red-400' : daysLeft < 30 ? 'text-dg-yellow' : 'text-blue-400'}
          bgCls={daysLeft < 0 ? 'bg-red-500/10' : daysLeft < 30 ? 'bg-dg-yellow/10' : 'bg-blue-500/10'}
        />
        <KpiCard
          label="Orçamento Gasto"
          value={`${budgetPct}%`}
          sub={`${formatCurrency(project.spent, project.countryId)} de ${formatCurrency(project.budget, project.countryId)}`}
          icon={Wallet}
          iconCls={budgetPct > 90 ? 'text-red-400' : budgetPct > 75 ? 'text-dg-yellow' : 'text-green-400'}
          bgCls={budgetPct > 90 ? 'bg-red-500/10' : budgetPct > 75 ? 'bg-dg-yellow/10' : 'bg-green-500/10'}
        />
        <KpiCard
          label="Registos"
          value={projectRecords.length.toString()}
          sub={`${projectRecords.filter((r) => r.status === RecordStatus.Validado).length} validados`}
          icon={Camera}
          iconCls="text-purple-400"
          bgCls="bg-purple-500/10"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-dg-gray-3">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              'px-5 py-3 text-sm font-semibold transition-all border-b-2 -mb-px whitespace-nowrap',
              activeTab === tab
                ? 'text-dg-yellow border-dg-yellow'
                : 'text-dg-gray-light border-transparent hover:text-dg-white hover:border-dg-gray-5'
            )}
          >
            {tab}
            {tab === 'Registos Diários' && projectRecords.length > 0 && (
              <span className="ml-1.5 text-[10px] bg-dg-gray-3 text-dg-gray-light px-1.5 py-0.5 rounded-full">
                {projectRecords.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'Visão Geral' && (
        <TabVisaoGeral project={project} projectRecords={projectRecords} dailyData={dailyData} />
      )}
      {activeTab === 'Registos Diários' && <TabRegistos records={projectRecords} />}
      {activeTab === 'Timeline' && <TabTimeline records={projectRecords} />}
      {activeTab === 'Equipa' && <TabEquipa project={project} records={projectRecords} />}
    </div>
  )
}
