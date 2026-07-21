import { useState } from 'react'
import {
  Building2, Camera, TrendingUp, Users, Trophy, Star,
  ArrowUpRight, ArrowDownRight, Activity
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import { mockGlobalStats, mockProjects, mockFeedPosts, mockRankings, mockCountries } from '../data/mockData'
import { ProjectStatus } from '../types'
import { Link } from 'react-router-dom'
import clsx from 'clsx'

const productionData = [
  { day: 'Seg', portugal: 420, angola: 280, guine: 150 },
  { day: 'Ter', portugal: 380, angola: 310, guine: 180 },
  { day: 'Qua', portugal: 510, angola: 290, guine: 200 },
  { day: 'Qui', portugal: 490, angola: 340, guine: 175 },
  { day: 'Sex', portugal: 620, angola: 380, guine: 220 },
  { day: 'Sab', portugal: 280, angola: 200, guine: 100 },
  { day: 'Dom', portugal: 150, angola: 90, guine: 60 },
]

const pieData = [
  { name: 'Betonagem', value: 28, color: '#F5C518' },
  { name: 'Alvenarias', value: 22, color: '#1E6FBA' },
  { name: 'Rebocos', value: 18, color: '#10B981' },
  { name: 'Armaduras', value: 15, color: '#8B5CF6' },
  { name: 'Outros', value: 17, color: '#6B6B6B' },
]

const TOOLTIP_STYLE = {
  backgroundColor: '#1A1A1A',
  border: '1px solid #2A2A2A',
  borderRadius: '12px',
  color: '#F5F5F5',
  fontSize: '12px',
}

export default function DashboardPage() {
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('week')
  const stats = mockGlobalStats

  const topProjects = mockProjects.slice(0, 4)

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-dg-white">Dashboard Global</h1>
          <p className="text-dg-gray-light text-sm mt-1">
            Produção do Grupo DG em tempo real
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(['day', 'week', 'month'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={clsx(
                'px-4 py-1.5 rounded-lg text-xs font-medium transition-all',
                period === p
                  ? 'bg-dg-yellow text-dg-black'
                  : 'text-dg-gray-light hover:text-dg-white hover:bg-dg-gray-2'
              )}
            >
              {p === 'day' ? 'Hoje' : p === 'week' ? 'Semana' : 'Mês'}
            </button>
          ))}
        </div>
      </div>

      {/* Obra do Dia Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-dg-yellow/20 via-dg-yellow/10 to-transparent border border-dg-yellow/30 p-5">
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-dg-yellow/10 to-transparent" />
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-dg-yellow rounded-xl flex items-center justify-center flex-shrink-0">
            <Star size={24} className="text-dg-black" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge-yellow text-xs">⭐ Obra Destaque do Dia</span>
            </div>
            <h3 className="font-bold text-dg-white">{mockProjects[0]?.name ?? 'Residencial Parque das Nações'}</h3>
            <p className="text-xs text-dg-gray-light">
              {mockProjects[0]?.location} · 🇵🇹 Portugal · {mockProjects[0]?.progress ?? 78}% concluída
            </p>
          </div>
          <div className="ml-auto text-right hidden sm:block">
            <p className="text-2xl font-black text-dg-yellow">94<span className="text-sm font-normal text-dg-gray-light">pts</span></p>
            <p className="text-xs text-dg-gray-light">Score de Produção</p>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Obras Ativas"
          value={stats.activeProjects.toString()}
          icon={Building2}
          iconColor="text-dg-yellow"
          iconBg="bg-dg-yellow/10"
          trend="+2"
          trendUp
          sub={`de ${stats.totalProjects} totais`}
        />
        <StatCard
          label="Registos Hoje"
          value="247"
          icon={Camera}
          iconColor="text-blue-400"
          iconBg="bg-blue-500/10"
          trend="+18%"
          trendUp
          sub="fotos e medições"
        />
        <StatCard
          label="Produção Semanal"
          value={`${(stats.totalProduction / 1000).toFixed(1)}k`}
          icon={TrendingUp}
          iconColor="text-green-400"
          iconBg="bg-green-500/10"
          trend={`+${stats.weekGrowth}%`}
          trendUp
          sub="unidades executadas"
        />
        <StatCard
          label="Equipas em Obra"
          value="38"
          icon={Users}
          iconColor="text-purple-400"
          iconBg="bg-purple-500/10"
          trend="-1"
          trendUp={false}
          sub="em 3 países"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Production chart */}
        <div className="xl:col-span-2 card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-dg-white">Produção por País</h3>
              <p className="text-xs text-dg-gray-light mt-0.5">Unidades executadas esta semana</p>
            </div>
            <div className="flex items-center gap-3">
              {[
                { color: 'bg-dg-yellow', label: 'Portugal' },
                { color: 'bg-blue-500', label: 'Angola' },
                { color: 'bg-green-500', label: 'Guiné' },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${color}`} />
                  <span className="text-xs text-dg-gray-light">{label}</span>
                </div>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={productionData}>
              <defs>
                <linearGradient id="gradPT" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F5C518" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F5C518" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradAO" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1E6FBA" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#1E6FBA" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradGW" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: '#6B6B6B', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6B6B6B', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Area type="monotone" dataKey="portugal" stroke="#F5C518" fill="url(#gradPT)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="angola" stroke="#1E6FBA" fill="url(#gradAO)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="guine" stroke="#10B981" fill="url(#gradGW)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="card">
          <div className="mb-4">
            <h3 className="font-bold text-dg-white">Por Atividade</h3>
            <p className="text-xs text-dg-gray-light mt-0.5">Distribuição da semana</p>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry, i) => (
                  <Cell key={`cell-${i}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${v}%`, 'Quota']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-dg-gray-light">{item.name}</span>
                </div>
                <span className="text-xs font-semibold text-dg-white">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Active projects */}
        <div className="xl:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-dg-white">Obras em Curso</h3>
            <Link to="/obras" className="text-xs text-dg-yellow hover:text-dg-yellow-light font-medium transition-colors">
              Ver todas →
            </Link>
          </div>
          <div className="space-y-3">
            {topProjects.map((project) => {
              const country = mockCountries.find((c) => c.id === project.countryId)
              return (
                <Link
                  key={project.id}
                  to={`/obras/${project.id}`}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-dg-gray-2 transition-all group border border-transparent hover:border-dg-gray-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-dg-gray-3 flex items-center justify-center flex-shrink-0 text-lg">
                    {country?.flag ?? '🏗️'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-dg-white truncate group-hover:text-dg-yellow transition-colors">
                        {project.name}
                      </p>
                      <span className="text-xs font-bold text-dg-white ml-2">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-dg-gray-4 rounded-full h-1.5 mb-1">
                      <div
                        className="h-1.5 rounded-full bg-gradient-to-r from-dg-yellow to-dg-yellow-light transition-all"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-dg-gray-light">{project.location} · {project.encarregadoName}</p>
                  </div>
                  <StatusBadge status={project.status} />
                </Link>
              )
            })}
          </div>
        </div>

        {/* Rankings & Feed */}
        <div className="space-y-4">
          {/* Mini rankings */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Trophy size={16} className="text-dg-yellow" />
                <h3 className="font-bold text-dg-white text-sm">Top Obras</h3>
              </div>
              <Link to="/rankings" className="text-xs text-dg-yellow hover:text-dg-yellow-light font-medium">
                Ver →
              </Link>
            </div>
            <div className="space-y-2">
              {mockRankings.slice(0, 4).map((r, i) => (
                <div key={r.projectId} className="flex items-center gap-3">
                  <span
                    className={clsx(
                      'w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0',
                      i === 0 ? 'bg-dg-yellow text-dg-black' :
                      i === 1 ? 'bg-gray-400 text-dg-black' :
                      i === 2 ? 'bg-orange-700 text-white' :
                      'bg-dg-gray-4 text-dg-gray-light'
                    )}
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-dg-white truncate">{r.projectName}</p>
                    <p className="text-[10px] text-dg-gray-light">{r.totalProduction.toLocaleString('pt-PT')} {r.unit}</p>
                  </div>
                  <span className="text-xs text-dg-yellow font-bold">{r.countryFlag}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Latest feed */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-blue-400" />
                <h3 className="font-bold text-dg-white text-sm">Última Produção</h3>
              </div>
              <Link to="/feed" className="text-xs text-dg-yellow hover:text-dg-yellow-light font-medium">
                Feed →
              </Link>
            </div>
            <div className="space-y-3">
              {mockFeedPosts.slice(0, 3).map((post) => (
                <div key={post.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-dg-gray-3 flex items-center justify-center flex-shrink-0 text-base">
                    {post.countryFlag}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-dg-white truncate">{post.projectName}</p>
                    <p className="text-[10px] text-dg-gray-light">
                      {post.activityName} · <span className="text-dg-yellow font-medium">{post.quantity} {post.unit}</span>
                    </p>
                    <p className="text-[10px] text-dg-gray-5">{post.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
  iconColor,
  iconBg,
  trend,
  trendUp,
  sub,
}: {
  label: string
  value: string
  icon: React.ElementType
  iconColor: string
  iconBg: string
  trend: string
  trendUp: boolean
  sub: string
}) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center', iconBg)}>
          <Icon size={20} className={iconColor} />
        </div>
        <div className={clsx('flex items-center gap-1 text-xs font-semibold', trendUp ? 'text-green-400' : 'text-red-400')}>
          {trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trend}
        </div>
      </div>
      <div>
        <p className="text-2xl font-black text-dg-white">{value}</p>
        <p className="text-xs font-medium text-dg-gray-light mt-0.5">{label}</p>
        <p className="text-[10px] text-dg-gray-5 mt-0.5">{sub}</p>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: ProjectStatus }) {
  const map: Record<ProjectStatus, { cls: string; label: string }> = {
    [ProjectStatus.EmCurso]: { cls: 'badge-green', label: 'Em Curso' },
    [ProjectStatus.Concluido]: { cls: 'badge-blue', label: 'Concluída' },
    [ProjectStatus.Suspenso]: { cls: 'badge-gray', label: 'Suspensa' },
    [ProjectStatus.Cancelado]: { cls: 'badge-red', label: 'Cancelada' },
    [ProjectStatus.Planeamento]: { cls: 'badge-yellow', label: 'Planeamento' },
  }
  const info = map[status] ?? { cls: 'badge-gray', label: status }
  return <span className={info.cls}>{info.label}</span>
}
