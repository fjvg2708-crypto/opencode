// ============================================================
// RankingsPage — Global Production Rankings
// DG ObraPro Global | Grupo DG · Portugal · Angola · Guiné
// ============================================================

import { useState } from 'react'
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  Crown,
  Globe,
  Building2,
  Activity,
  ChevronLeft,
  ChevronRight,
  Star,
  ArrowUpRight,
  ArrowDownRight,
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
import clsx from 'clsx'
import { mockRankings } from '../data/mockData'
import type { RankingEntry } from '../types'

// ─────────────────────────────────────────────
// Types for extra ranking data
// ─────────────────────────────────────────────

interface PaisRanking {
  id: string
  name: string
  flag: string
  totalProduction: number
  projects: number
  percentage: number
  trend: 'up' | 'down' | 'stable'
  change: number
}

interface EmpresaRanking {
  id: string
  name: string
  logo: string
  efficiency: number
  activeProjects: number
  trend: 'up' | 'down' | 'stable'
  change: number
}

interface AtividadeRanking {
  id: string
  name: string
  icon: string
  totalQuantity: number
  unit: string
  weekTrend: number
}

// ─────────────────────────────────────────────
// Static supplementary data
// ─────────────────────────────────────────────

const paisesRanking: PaisRanking[] = [
  {
    id: 'ao',
    name: 'Angola',
    flag: '🇦🇴',
    totalProduction: 24355,
    projects: 3,
    percentage: 50,
    trend: 'up',
    change: 2,
  },
  {
    id: 'pt',
    name: 'Portugal',
    flag: '🇵🇹',
    totalProduction: 21080,
    projects: 3,
    percentage: 43,
    trend: 'stable',
    change: 0,
  },
  {
    id: 'gn',
    name: 'Guiné-Bissau',
    flag: '🇬🇼',
    totalProduction: 5980,
    projects: 2,
    percentage: 7,
    trend: 'up',
    change: 5,
  },
]

const empresasRanking: EmpresaRanking[] = [
  { id: 'comp-gn-1', name: 'DG Africa Construções', logo: '🌱', efficiency: 92, activeProjects: 2, trend: 'up', change: 4 },
  { id: 'comp-ao-1', name: 'DG Angola Lda', logo: '🌍', efficiency: 81, activeProjects: 3, trend: 'up', change: 1 },
  { id: 'comp-pt-1', name: 'DG Construções PT', logo: '🏗️', efficiency: 76, activeProjects: 2, trend: 'down', change: 2 },
  { id: 'comp-pt-2', name: 'DG Obras Especiais', logo: '🏛️', efficiency: 68, activeProjects: 1, trend: 'stable', change: 0 },
]

const atividadesRanking: AtividadeRanking[] = [
  { id: 'act-04', name: 'Betão Armado em Lajes', icon: '📐', totalQuantity: 15840, unit: 'm²', weekTrend: 18 },
  { id: 'act-09', name: 'Pavimento Betuminoso', icon: '🛣️', totalQuantity: 6200, unit: 't', weekTrend: 12 },
  { id: 'act-05', name: 'Alvenaria de Bloco', icon: '🧱', totalQuantity: 8960, unit: 'm²', weekTrend: 8 },
  { id: 'act-01', name: 'Escavação e Terraplenagem', icon: '🚜', totalQuantity: 9210, unit: 'm³', weekTrend: -3 },
  { id: 'act-02', name: 'Betão em Fundações', icon: '🏗️', totalQuantity: 512, unit: 'm³', weekTrend: 22 },
  { id: 'act-11', name: 'Revestimento Cerâmico', icon: '🏠', totalQuantity: 5640, unit: 'm²', weekTrend: 6 },
  { id: 'act-14', name: 'Pintura Exterior', icon: '🎨', totalQuantity: 1020, unit: 'm²', weekTrend: 14 },
  { id: 'act-07', name: 'Reboco Projetado', icon: '🖌️', totalQuantity: 280, unit: 'm²', weekTrend: 0 },
]

// ─────────────────────────────────────────────
// Chart data (top 5 obras)
// ─────────────────────────────────────────────

const CHART_COLORS = ['#F5C518', '#1E6FBA', '#10B981', '#8B5CF6', '#EF4444']

const top5ChartData = mockRankings.slice(0, 5).map((r) => ({
  name: r.projectName.split(' ').slice(0, 2).join(' '),
  producao: r.totalProduction,
  flag: r.countryFlag,
}))

const TOOLTIP_STYLE = {
  backgroundColor: '#1A1A1A',
  border: '1px solid #2A2A2A',
  borderRadius: '12px',
  color: '#F5F5F5',
  fontSize: '12px',
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

function MedalBadge({ rank }: { rank: number }) {
  if (rank === 1)
    return (
      <div className="w-8 h-8 rounded-full bg-dg-yellow flex items-center justify-center flex-shrink-0">
        <Crown size={14} className="text-dg-black" />
      </div>
    )
  if (rank === 2)
    return (
      <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center flex-shrink-0 text-xs font-black text-dg-black">
        2
      </div>
    )
  if (rank === 3)
    return (
      <div className="w-8 h-8 rounded-full bg-orange-700 flex items-center justify-center flex-shrink-0 text-xs font-black text-white">
        3
      </div>
    )
  return (
    <div className="w-8 h-8 rounded-full bg-dg-gray-4 flex items-center justify-center flex-shrink-0 text-xs font-semibold text-dg-gray-light">
      {rank}
    </div>
  )
}

function TrendBadge({ trend, change }: { trend: 'up' | 'down' | 'stable'; change?: number }) {
  if (trend === 'up')
    return (
      <span className="flex items-center gap-0.5 text-green-400 text-xs font-bold">
        <ArrowUpRight size={13} />
        {change !== undefined && change > 0 ? `+${change}` : ''}
      </span>
    )
  if (trend === 'down')
    return (
      <span className="flex items-center gap-0.5 text-red-400 text-xs font-bold">
        <ArrowDownRight size={13} />
        {change !== undefined && change > 0 ? `-${change}` : ''}
      </span>
    )
  return <Minus size={13} className="text-dg-gray-light" />
}

// ─────────────────────────────────────────────
// Tab: Obras
// ─────────────────────────────────────────────

function TabObras({ entries }: { entries: RankingEntry[] }) {
  const maxProd = Math.max(...entries.map((e) => e.totalProduction))

  return (
    <div className="space-y-5">
      {/* Recharts bar chart */}
      <div className="card">
        <div className="mb-5">
          <h3 className="font-bold text-dg-white">Top 5 Obras — Produção Acumulada</h3>
          <p className="text-xs text-dg-gray-light mt-0.5">Comparativo por unidades executadas</p>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={top5ChartData} barCategoryGap="35%">
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: '#6B6B6B', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#6B6B6B', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
            />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              formatter={(v: number) => [v.toLocaleString('pt-PT'), 'Produção']}
            />
            <Bar dataKey="producao" radius={[6, 6, 0, 0]}>
              {top5ChartData.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Rankings list */}
      <div className="card p-0 overflow-hidden">
        <div className="divide-y divide-dg-gray-3">
          {entries.map((entry, i) => {
            const isFirst = entry.rank === 1
            return (
              <div
                key={entry.projectId}
                className={clsx(
                  'flex items-center gap-4 px-5 py-4 transition-colors',
                  isFirst
                    ? 'bg-dg-yellow/5 border-l-2 border-dg-yellow'
                    : 'hover:bg-dg-gray-2',
                )}
              >
                <MedalBadge rank={entry.rank} />

                <div className="text-2xl flex-shrink-0">{entry.countryFlag}</div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p
                      className={clsx(
                        'text-sm font-bold truncate',
                        isFirst ? 'text-dg-yellow' : 'text-dg-white',
                      )}
                    >
                      {entry.projectName}
                    </p>
                    {isFirst && <Star size={12} className="text-dg-yellow fill-dg-yellow flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-dg-gray-light truncate">{entry.companyName}</p>

                  {/* Score bar */}
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-dg-gray-4 rounded-full overflow-hidden">
                      <div
                        className={clsx(
                          'h-full rounded-full transition-all duration-700',
                          isFirst
                            ? 'bg-dg-yellow'
                            : i === 1
                            ? 'bg-gray-400'
                            : i === 2
                            ? 'bg-orange-600'
                            : 'bg-dg-blue',
                        )}
                        style={{
                          width: `${Math.round((entry.totalProduction / maxProd) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-[10px] text-dg-gray-light whitespace-nowrap">
                      {Math.round((entry.totalProduction / maxProd) * 100)}%
                    </span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-base font-black text-dg-white">
                    {entry.totalProduction.toLocaleString('pt-PT')}
                    <span className="text-xs font-normal text-dg-gray-light ml-1">
                      {entry.unit}
                    </span>
                  </p>
                  <div className="flex items-center justify-end gap-1 mt-0.5">
                    <TrendBadge trend={entry.trend} />
                    <span className="text-[10px] text-dg-gray-light">
                      {entry.recordsThisWeek} reg/sem
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Tab: Países
// ─────────────────────────────────────────────

function TabPaises({ data }: { data: PaisRanking[] }) {
  const sorted = [...data].sort((a, b) => b.totalProduction - a.totalProduction)
  const max = sorted[0]?.totalProduction ?? 1

  return (
    <div className="space-y-4">
      {sorted.map((p, i) => (
        <div
          key={p.id}
          className={clsx(
            'card transition-all hover:border-dg-gray-4',
            i === 0 && 'border-dg-yellow/30',
          )}
        >
          <div className="flex items-center gap-5">
            {/* Flag big */}
            <div className="text-5xl flex-shrink-0">{p.flag}</div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  {i === 0 && <Crown size={14} className="text-dg-yellow" />}
                  <h3 className="font-black text-dg-white text-lg">{p.name}</h3>
                </div>
                <TrendBadge trend={p.trend} change={p.change} />
              </div>

              <div className="flex items-center gap-4 mb-3 text-sm text-dg-gray-light">
                <span>
                  <span className="text-dg-white font-semibold">{p.projects}</span> obras ativas
                </span>
                <span>
                  <span className="text-dg-white font-semibold">{p.percentage}%</span> do grupo
                </span>
              </div>

              {/* Production bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-dg-gray-light">Produção acumulada</span>
                  <span className="text-xs font-bold text-dg-white">
                    {p.totalProduction.toLocaleString('pt-PT')} un.
                  </span>
                </div>
                <div className="h-3 bg-dg-gray-4 rounded-full overflow-hidden">
                  <div
                    className={clsx(
                      'h-full rounded-full transition-all duration-700',
                      i === 0 ? 'bg-gradient-to-r from-dg-yellow to-dg-yellow-light' :
                      i === 1 ? 'bg-gradient-to-r from-dg-blue to-dg-blue-light' :
                      'bg-gradient-to-r from-green-600 to-green-400',
                    )}
                    style={{ width: `${(p.totalProduction / max) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────
// Tab: Empresas
// ─────────────────────────────────────────────

function TabEmpresas({ data }: { data: EmpresaRanking[] }) {
  const sorted = [...data].sort((a, b) => b.efficiency - a.efficiency)

  return (
    <div className="card p-0 overflow-hidden">
      <div className="divide-y divide-dg-gray-3">
        {sorted.map((empresa, i) => (
          <div key={empresa.id} className="flex items-center gap-4 px-5 py-4 hover:bg-dg-gray-2 transition-colors">
            <MedalBadge rank={i + 1} />

            <div className="w-10 h-10 rounded-xl bg-dg-gray-3 flex items-center justify-center text-xl flex-shrink-0">
              {empresa.logo}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-dg-white truncate">{empresa.name}</p>
              <p className="text-xs text-dg-gray-light mt-0.5">
                {empresa.activeProjects} obra{empresa.activeProjects !== 1 ? 's' : ''} ativa{empresa.activeProjects !== 1 ? 's' : ''}
              </p>
              {/* Efficiency bar */}
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-dg-gray-4 rounded-full overflow-hidden">
                  <div
                    className={clsx(
                      'h-full rounded-full',
                      i === 0 ? 'bg-dg-yellow' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-orange-600' : 'bg-dg-blue',
                    )}
                    style={{ width: `${empresa.efficiency}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="text-right flex-shrink-0">
              <p className="text-xl font-black text-dg-white">
                {empresa.efficiency}
                <span className="text-xs font-normal text-dg-gray-light">pts</span>
              </p>
              <TrendBadge trend={empresa.trend} change={empresa.change} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Tab: Atividades
// ─────────────────────────────────────────────

function TabAtividades({ data }: { data: AtividadeRanking[] }) {
  const sorted = [...data].sort((a, b) => b.totalQuantity - a.totalQuantity)
  const max = sorted[0]?.totalQuantity ?? 1

  return (
    <div className="card p-0 overflow-hidden">
      <div className="divide-y divide-dg-gray-3">
        {sorted.map((atv) => (
          <div key={atv.id} className="flex items-center gap-4 px-5 py-4 hover:bg-dg-gray-2 transition-colors">
            <div className="text-2xl flex-shrink-0">{atv.icon}</div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-bold text-dg-white">{atv.name}</p>
                <span
                  className={clsx(
                    'text-xs font-bold flex items-center gap-0.5',
                    atv.weekTrend > 0
                      ? 'text-green-400'
                      : atv.weekTrend < 0
                      ? 'text-red-400'
                      : 'text-dg-gray-light',
                  )}
                >
                  {atv.weekTrend > 0 ? (
                    <TrendingUp size={12} />
                  ) : atv.weekTrend < 0 ? (
                    <TrendingDown size={12} />
                  ) : (
                    <Minus size={12} />
                  )}
                  {atv.weekTrend > 0 ? '+' : ''}
                  {atv.weekTrend}% semana
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-dg-gray-4 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-dg-blue to-dg-blue-light"
                    style={{ width: `${(atv.totalQuantity / max) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-dg-white whitespace-nowrap">
                  {atv.totalQuantity.toLocaleString('pt-PT')} {atv.unit}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────

type TabId = 'obras' | 'paises' | 'empresas' | 'atividades'

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'obras', label: 'Obras', icon: Building2 },
  { id: 'paises', label: 'Países', icon: Globe },
  { id: 'empresas', label: 'Empresas', icon: Trophy },
  { id: 'atividades', label: 'Atividades', icon: Activity },
]

const WEEKS = [
  'Semana 16 · 28 Abr a 4 Mai 2025',
  'Semana 17 · 5 a 11 Mai 2025',
  'Semana 18 · 12 a 18 Mai 2025',
  'Semana 19 · 19 a 25 Mai 2025',
]

export default function RankingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('obras')
  const [weekIdx, setWeekIdx] = useState(2)

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-dg-white">Rankings de Produção</h1>
          <p className="text-dg-gray-light text-sm mt-1">
            Performance comparativa — todas as obras e países do Grupo DG
          </p>
        </div>

        {/* Period selector */}
        <div className="flex items-center gap-2 bg-dg-gray rounded-xl border border-dg-gray-3 px-3 py-2">
          <button
            onClick={() => setWeekIdx((i) => Math.max(0, i - 1))}
            className="btn-ghost p-1 rounded-lg"
            disabled={weekIdx === 0}
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-semibold text-dg-white px-2 whitespace-nowrap">
            {WEEKS[weekIdx]}
          </span>
          <button
            onClick={() => setWeekIdx((i) => Math.min(WEEKS.length - 1, i + 1))}
            className="btn-ghost p-1 rounded-lg"
            disabled={weekIdx === WEEKS.length - 1}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Summary stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Obras classificadas', value: mockRankings.length.toString(), icon: '🏗️' },
          { label: 'Países ativos', value: '3', icon: '🌍' },
          { label: 'Produção total', value: '51.4k', icon: '📊' },
          { label: 'Crescimento semanal', value: '+12.4%', icon: '📈', positive: true },
        ].map((s) => (
          <div key={s.label} className="card p-4 flex flex-col gap-2">
            <span className="text-2xl">{s.icon}</span>
            <p className={clsx('text-xl font-black', s.positive ? 'text-green-400' : 'text-dg-white')}>
              {s.value}
            </p>
            <p className="text-xs text-dg-gray-light">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 bg-dg-gray rounded-xl border border-dg-gray-3 p-1 w-fit">
        {TABS.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                activeTab === tab.id
                  ? 'bg-dg-yellow text-dg-black'
                  : 'text-dg-gray-light hover:text-dg-white hover:bg-dg-gray-2',
              )}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'obras' && <TabObras entries={mockRankings} />}
      {activeTab === 'paises' && <TabPaises data={paisesRanking} />}
      {activeTab === 'empresas' && <TabEmpresas data={empresasRanking} />}
      {activeTab === 'atividades' && <TabAtividades data={atividadesRanking} />}
    </div>
  )
}
