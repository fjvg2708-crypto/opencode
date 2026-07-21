// ============================================================
// MapaPage — Global Operations Map
// DG ObraPro Global | Grupo DG · Portugal · Angola · Guiné
// ============================================================

import { useState } from 'react'
import {
  Building2,
  MapPin,
  ChevronRight,
  ChevronDown,
  Plus,
  Activity,
  Users,
  TrendingUp,
  Globe,
  Radio,
  ExternalLink,
  Clock,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { mockProjects, mockCountries } from '../data/mockData'
import { ProjectStatus } from '../types'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface CountryCard {
  countryId: string
  flag: string
  name: string
  region: string
  activeProjects: number
  productionToday: number
  productionUnit: string
  topObra: string
  topObraId: string
  statusColor: string
  bgFrom: string
  bgTo: string
  accentColor: string
  cities: string[]
  totalTeams: number
}

// ─────────────────────────────────────────────
// Static country data
// ─────────────────────────────────────────────

const countryCards: CountryCard[] = [
  {
    countryId: 'pt',
    flag: '🇵🇹',
    name: 'Portugal',
    region: 'Europa Ocidental',
    activeProjects: 2,
    productionToday: 648,
    productionUnit: 'm²',
    topObra: 'Residencial Parque das Nações',
    topObraId: 'proj-pt-1',
    statusColor: 'bg-green-400',
    bgFrom: 'from-blue-950',
    bgTo: 'to-blue-900/30',
    accentColor: 'border-blue-500/40',
    cities: ['Lisboa', 'Porto', 'Cascais'],
    totalTeams: 5,
  },
  {
    countryId: 'ao',
    flag: '🇦🇴',
    name: 'Angola',
    region: 'África Austral',
    activeProjects: 3,
    productionToday: 5200,
    productionUnit: 'm²',
    topObra: 'Centro Comercial Luanda Sul',
    topObraId: 'proj-ao-1',
    statusColor: 'bg-dg-yellow',
    bgFrom: 'from-red-950',
    bgTo: 'to-red-900/30',
    accentColor: 'border-red-500/40',
    cities: ['Luanda', 'Bengo', 'Kuito', 'Cabinda'],
    totalTeams: 6,
  },
  {
    countryId: 'gn',
    flag: '🇬🇼',
    name: 'Guiné-Bissau',
    region: 'África Ocidental',
    activeProjects: 2,
    productionToday: 898,
    productionUnit: 'm²',
    topObra: 'Escola Primária de Bolama',
    topObraId: 'proj-gn-2',
    statusColor: 'bg-green-400',
    bgFrom: 'from-green-950',
    bgTo: 'to-green-900/30',
    accentColor: 'border-green-500/40',
    cities: ['Bissau', 'Bolama'],
    totalTeams: 2,
  },
]

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function statusLabel(status: ProjectStatus): { label: string; cls: string } {
  const map: Record<ProjectStatus, { label: string; cls: string }> = {
    [ProjectStatus.EmCurso]: { label: 'Em Curso', cls: 'badge-green' },
    [ProjectStatus.Planeamento]: { label: 'Planeamento', cls: 'badge-yellow' },
    [ProjectStatus.Suspenso]: { label: 'Suspenso', cls: 'badge-red' },
    [ProjectStatus.Concluido]: { label: 'Concluído', cls: 'badge-blue' },
    [ProjectStatus.Cancelado]: { label: 'Cancelado', cls: 'badge-gray' },
  }
  return map[status] ?? { label: status, cls: 'badge-gray' }
}

// ─────────────────────────────────────────────
// Country Card component
// ─────────────────────────────────────────────

function CountryCardComponent({
  card,
  isExpanded,
  onToggle,
}: {
  card: CountryCard
  isExpanded: boolean
  onToggle: () => void
}) {
  const countryProjects = mockProjects.filter((p) => p.countryId === card.countryId)

  return (
    <div
      className={clsx(
        'relative overflow-hidden rounded-2xl border transition-all duration-500',
        'bg-gradient-to-br',
        card.bgFrom,
        card.bgTo,
        card.accentColor,
        isExpanded ? 'ring-1 ring-dg-yellow/30' : 'hover:border-opacity-70',
      )}
    >
      {/* Decorative background orb */}
      <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/3 -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{card.flag}</span>
            <div>
              <h2 className="text-xl font-black text-dg-white">{card.name}</h2>
              <p className="text-xs text-dg-gray-light">{card.region}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={clsx('w-2 h-2 rounded-full animate-pulse-slow', card.statusColor)} />
            <span className="text-xs text-dg-gray-light">Online</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-black/20 rounded-xl p-3 text-center">
            <p className="text-2xl font-black text-dg-white">{card.activeProjects}</p>
            <p className="text-[10px] text-dg-gray-light mt-0.5">Obras Ativas</p>
          </div>
          <div className="bg-black/20 rounded-xl p-3 text-center">
            <p className="text-2xl font-black text-dg-yellow">
              {card.productionToday >= 1000
                ? `${(card.productionToday / 1000).toFixed(1)}k`
                : card.productionToday}
            </p>
            <p className="text-[10px] text-dg-gray-light mt-0.5">{card.productionUnit} hoje</p>
          </div>
          <div className="bg-black/20 rounded-xl p-3 text-center">
            <p className="text-2xl font-black text-dg-white">{card.totalTeams}</p>
            <p className="text-[10px] text-dg-gray-light mt-0.5">Equipas</p>
          </div>
        </div>

        {/* Top obra */}
        <div className="bg-black/20 rounded-xl p-3 mb-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={12} className="text-dg-yellow" />
            <span className="text-[10px] font-semibold text-dg-yellow uppercase tracking-wide">
              Obra em Destaque
            </span>
          </div>
          <Link
            to={`/obras/${card.topObraId}`}
            className="flex items-center justify-between group"
          >
            <p className="text-sm font-semibold text-dg-white group-hover:text-dg-yellow transition-colors truncate pr-2">
              {card.topObra}
            </p>
            <ExternalLink size={12} className="text-dg-gray-light group-hover:text-dg-yellow flex-shrink-0 transition-colors" />
          </Link>
        </div>

        {/* Cities */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {card.cities.map((city) => (
            <span key={city} className="flex items-center gap-1 text-[10px] text-dg-gray-light bg-black/20 rounded-full px-2 py-1">
              <MapPin size={8} />
              {city}
            </span>
          ))}
        </div>

        {/* Expand toggle */}
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 text-xs font-medium text-dg-gray-light hover:text-dg-white transition-colors py-1"
        >
          {isExpanded ? (
            <>
              <ChevronDown size={14} className="rotate-180" />
              Recolher obras
            </>
          ) : (
            <>
              <ChevronDown size={14} />
              Ver {countryProjects.length} obra{countryProjects.length !== 1 ? 's' : ''}
            </>
          )}
        </button>

        {/* Expanded project list */}
        {isExpanded && (
          <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
            {countryProjects.map((project) => {
              const st = statusLabel(project.status)
              return (
                <Link
                  key={project.id}
                  to={`/obras/${project.id}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-black/20 hover:bg-black/40 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Building2 size={14} className="text-dg-gray-light flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-dg-white group-hover:text-dg-yellow transition-colors truncate">
                        {project.name}
                      </p>
                      <p className="text-[10px] text-dg-gray-light truncate">{project.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <span className={st.cls + ' text-[10px]'}>{st.label}</span>
                    <span className="text-[10px] font-bold text-dg-white">{project.progress}%</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Sidebar: Active Projects List
// ─────────────────────────────────────────────

function ActiveProjectsSidebar() {
  const activeProjects = mockProjects.filter((p) => p.status === ProjectStatus.EmCurso)

  return (
    <div className="card p-0 overflow-hidden h-fit">
      <div className="px-5 py-4 border-b border-dg-gray-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radio size={14} className="text-green-400 animate-pulse-slow" />
          <h3 className="font-bold text-dg-white text-sm">Obras Ativas</h3>
        </div>
        <span className="badge-green text-[10px]">{activeProjects.length} online</span>
      </div>

      <div className="divide-y divide-dg-gray-3 max-h-[600px] overflow-y-auto">
        {activeProjects.map((project) => {
          const country = mockCountries.find((c) => c.id === project.countryId)
          const recordsToday = Math.floor(Math.random() * 12) + 1

          return (
            <Link
              key={project.id}
              to={`/obras/${project.id}`}
              className="flex items-start gap-3 px-4 py-3.5 hover:bg-dg-gray-2 transition-colors group"
            >
              <div className="flex-shrink-0 mt-0.5">
                <span className="text-xl">{country?.flag ?? '🏗️'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-dg-white group-hover:text-dg-yellow transition-colors truncate">
                  {project.name}
                </p>
                <p className="text-[10px] text-dg-gray-light truncate mt-0.5">
                  {project.location}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  {/* Mini progress bar */}
                  <div className="flex-1 h-1 bg-dg-gray-4 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-dg-yellow rounded-full"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-dg-gray-light">{project.progress}%</span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-[10px] text-dg-gray-light">
                    <Activity size={9} />
                    {recordsToday} reg. hoje
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-dg-gray-light">
                    <Users size={9} />
                    {project.teams.reduce((acc, t) => acc + t.members, 0)} pessoas
                  </span>
                </div>
              </div>
              <ChevronRight size={12} className="text-dg-gray-5 mt-1 flex-shrink-0 group-hover:text-dg-yellow transition-colors" />
            </Link>
          )
        })}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Stats Bar
// ─────────────────────────────────────────────

function StatsBar() {
  const stats = [
    { icon: Globe, label: 'Países', value: '3', color: 'text-dg-yellow' },
    { icon: MapPin, label: 'Cidades', value: '8', color: 'text-blue-400' },
    { icon: Building2, label: 'Sites Ativos', value: '7', color: 'text-green-400' },
    { icon: Users, label: 'Colaboradores', value: '152', color: 'text-purple-400' },
    { icon: Activity, label: 'Registos Hoje', value: '247', color: 'text-dg-yellow' },
    { icon: Clock, label: 'Último registo', value: '2min', color: 'text-dg-gray-light' },
  ]

  return (
    <div className="card p-4">
      <div className="flex flex-wrap items-center gap-6 justify-between">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="flex items-center gap-2">
              <Icon size={15} className={s.color} />
              <div>
                <span className="text-base font-black text-dg-white">{s.value}</span>
                <span className="text-xs text-dg-gray-light ml-1.5">{s.label}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// World Visual Background
// ─────────────────────────────────────────────

function WorldVisualBackground() {
  return (
    <div className="relative rounded-2xl border border-dg-gray-3 bg-dg-gray overflow-hidden">
      {/* Grid lines simulating a map grid */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'linear-gradient(#F5F5F5 1px, transparent 1px), linear-gradient(90deg, #F5F5F5 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      {/* Radial glow at center */}
      <div className="absolute inset-0 bg-radial-gradient opacity-10"
        style={{ background: 'radial-gradient(ellipse at center, #1E6FBA22 0%, transparent 70%)' }}
      />

      {/* Atlantic Ocean label */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
        <p className="text-dg-gray-5 text-xs font-medium tracking-widest uppercase opacity-40">
          Atlântico
        </p>
      </div>

      {/* Country position dots */}
      {/* Portugal — top left */}
      <div className="absolute" style={{ left: '18%', top: '22%' }}>
        <div className="relative">
          <div className="w-3 h-3 rounded-full bg-dg-blue border-2 border-dg-blue-light animate-pulse-slow" />
          <div className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-dg-blue/20 animate-ping" style={{ animationDuration: '2s' }} />
        </div>
        <div className="mt-1 -ml-4 text-center">
          <p className="text-[9px] font-bold text-dg-white/60">PT</p>
        </div>
      </div>

      {/* Angola — center */}
      <div className="absolute" style={{ left: '52%', top: '58%' }}>
        <div className="relative">
          <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-red-400 animate-pulse-slow" />
          <div className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-red-500/20 animate-ping" style={{ animationDuration: '2.5s' }} />
        </div>
        <div className="mt-1 -ml-4 text-center">
          <p className="text-[9px] font-bold text-dg-white/60">AO</p>
        </div>
      </div>

      {/* Guiné — center-left, lower */}
      <div className="absolute" style={{ left: '35%', top: '50%' }}>
        <div className="relative">
          <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-green-400 animate-pulse-slow" />
          <div className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-green-500/20 animate-ping" style={{ animationDuration: '3s' }} />
        </div>
        <div className="mt-1 -ml-4 text-center">
          <p className="text-[9px] font-bold text-dg-white/60">GW</p>
        </div>
      </div>

      {/* SVG connection paths */}
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        <defs>
          <marker id="dot" markerWidth="4" markerHeight="4" refX="2" refY="2">
            <circle cx="2" cy="2" r="1.5" fill="#F5C51850" />
          </marker>
        </defs>
        {/* PT to AO */}
        <path
          d="M 18% 22% Q 38% 10% 52% 58%"
          stroke="#F5C51825"
          strokeWidth="1.5"
          strokeDasharray="5,5"
          fill="none"
        />
        {/* GW to AO */}
        <path
          d="M 35% 50% Q 44% 55% 52% 58%"
          stroke="#F5C51825"
          strokeWidth="1"
          strokeDasharray="4,6"
          fill="none"
        />
        {/* PT to GW */}
        <path
          d="M 18% 22% Q 25% 38% 35% 50%"
          stroke="#F5C51815"
          strokeWidth="1"
          strokeDasharray="3,7"
          fill="none"
        />
      </svg>

      {/* DG logo watermark */}
      <div className="absolute bottom-4 right-4 text-dg-gray-4 text-xs font-black tracking-widest opacity-40">
        DG OBRAPRO GLOBAL
      </div>

      {/* Spacer to give the background height */}
      <div className="h-32 sm:h-48" />
    </div>
  )
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────

export default function MapaPage() {
  const [expandedCountry, setExpandedCountry] = useState<string | null>(null)

  function toggleCountry(id: string) {
    setExpandedCountry((prev) => (prev === id ? null : id))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-dg-white">Centro de Operações Global</h1>
          <p className="text-dg-gray-light text-sm mt-1">
            Visão geográfica das obras do Grupo DG em 3 países
          </p>
        </div>
        <button className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} />
          Adicionar País
        </button>
      </div>

      {/* Stats bar */}
      <StatsBar />

      {/* Main layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: World visual + country cards */}
        <div className="xl:col-span-2 space-y-6">
          {/* World visual */}
          <WorldVisualBackground />

          {/* Country cards — simulating geographic position */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {countryCards.map((card) => (
              <CountryCardComponent
                key={card.countryId}
                card={card}
                isExpanded={expandedCountry === card.countryId}
                onToggle={() => toggleCountry(card.countryId)}
              />
            ))}
          </div>
        </div>

        {/* Right: Active projects sidebar */}
        <div className="xl:col-span-1">
          <ActiveProjectsSidebar />
        </div>
      </div>

      {/* Global progress summary */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold text-dg-white">Progresso Global do Grupo</h3>
            <p className="text-xs text-dg-gray-light mt-0.5">Avanço médio por país · Semana 19</p>
          </div>
          <Link to="/rankings" className="text-xs text-dg-yellow hover:text-dg-yellow-light font-medium transition-colors">
            Ver rankings →
          </Link>
        </div>

        <div className="space-y-4">
          {countryCards.map((c, i) => {
            const projects = mockProjects.filter((p) => p.countryId === c.countryId)
            const avgProgress =
              projects.length > 0
                ? Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / projects.length)
                : 0
            const colors = ['from-blue-600 to-blue-400', 'from-red-600 to-red-400', 'from-green-600 to-green-400']

            return (
              <div key={c.countryId}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{c.flag}</span>
                    <span className="text-sm font-semibold text-dg-white">{c.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-dg-gray-light">{c.activeProjects} obras</span>
                    <span className="text-sm font-black text-dg-white">{avgProgress}%</span>
                  </div>
                </div>
                <div className="h-2.5 bg-dg-gray-4 rounded-full overflow-hidden">
                  <div
                    className={clsx('h-full rounded-full bg-gradient-to-r transition-all duration-700', colors[i])}
                    style={{ width: `${avgProgress}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
