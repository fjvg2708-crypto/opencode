// ============================================================
// ObrasPage — Works List
// DG ObraPro Global
// ============================================================

import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import {
  Building2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  Search,
  X,
  MapPin,
  User,
  CalendarDays,
  Wallet,
  ChevronDown,
  Filter,
  Layers,
} from 'lucide-react'
import {
  mockProjects,
  mockCountries,
  mockCompanies,
} from '../data/mockData'
import { ProjectStatus, type Project } from '../types'

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const STATUS_CONFIG: Record<
  ProjectStatus,
  { badge: string; label: string; dot: string }
> = {
  [ProjectStatus.EmCurso]: { badge: 'badge-green', label: 'Em Curso', dot: 'bg-green-400' },
  [ProjectStatus.Concluido]: { badge: 'badge-blue', label: 'Concluído', dot: 'bg-blue-400' },
  [ProjectStatus.Planeamento]: { badge: 'badge-yellow', label: 'Planeamento', dot: 'bg-dg-yellow' },
  [ProjectStatus.Suspenso]: { badge: 'badge-red', label: 'Suspenso', dot: 'bg-red-400' },
  [ProjectStatus.Cancelado]: { badge: 'badge-gray', label: 'Cancelado', dot: 'bg-dg-gray-5' },
}

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

function daysUntil(deadline: string): number {
  const now = new Date()
  const d = new Date(deadline)
  return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

// ─────────────────────────────────────────────
// Project Card
// ─────────────────────────────────────────────

function ProjectCard({ project }: { project: Project }) {
  const country = mockCountries.find((c) => c.id === project.countryId)
  const company = mockCompanies.find((c) => c.id === project.companyId)
  const status = STATUS_CONFIG[project.status]
  const days = daysUntil(project.deadline)
  const budgetPct = Math.round((project.spent / project.budget) * 100)
  const isOverBudget = budgetPct > 100
  const isDelayed = days < 0 && project.status !== ProjectStatus.Concluido

  return (
    <Link
      to={`/obras/${project.id}`}
      className="group block card hover:border-dg-yellow/40 hover:shadow-lg hover:shadow-dg-yellow/5 transition-all duration-300"
    >
      {/* Card header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-dg-gray-2 border border-dg-gray-4 flex items-center justify-center text-2xl flex-shrink-0">
            {country?.flag ?? '🏗️'}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-dg-white text-sm leading-tight group-hover:text-dg-yellow transition-colors line-clamp-2">
              {project.name}
            </h3>
            <div className="flex items-center gap-1 mt-1">
              <MapPin size={10} className="text-dg-gray-light flex-shrink-0" />
              <p className="text-[11px] text-dg-gray-light truncate">{project.location}</p>
            </div>
          </div>
        </div>
        <span className={clsx(status.badge, 'ml-2 flex-shrink-0 text-[10px]')}>
          <span className={clsx('w-1.5 h-1.5 rounded-full inline-block mr-1', status.dot)} />
          {status.label}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] text-dg-gray-light">Progresso</span>
          <span className="text-xs font-bold text-dg-white">{project.progress}%</span>
        </div>
        <div className="w-full h-2 bg-dg-gray-3 rounded-full overflow-hidden">
          <div
            className={clsx(
              'h-full rounded-full transition-all duration-700',
              project.progress === 100
                ? 'bg-blue-400'
                : project.progress > 70
                ? 'bg-dg-yellow'
                : project.progress > 40
                ? 'bg-dg-yellow/80'
                : 'bg-dg-yellow/60'
            )}
            style={{ width: `${Math.min(project.progress, 100)}%` }}
          />
        </div>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-dg-gray-2 rounded-lg p-2.5 border border-dg-gray-4">
          <div className="flex items-center gap-1.5 mb-1">
            <User size={10} className="text-dg-gray-light" />
            <span className="text-[10px] text-dg-gray-light uppercase tracking-wide">Director</span>
          </div>
          <p className="text-xs font-semibold text-dg-white truncate">{project.directorName}</p>
        </div>
        <div className="bg-dg-gray-2 rounded-lg p-2.5 border border-dg-gray-4">
          <div className="flex items-center gap-1.5 mb-1">
            <CalendarDays size={10} className="text-dg-gray-light" />
            <span className="text-[10px] text-dg-gray-light uppercase tracking-wide">Prazo</span>
          </div>
          <p
            className={clsx(
              'text-xs font-semibold truncate',
              isDelayed ? 'text-red-400' : days < 30 ? 'text-dg-yellow' : 'text-dg-white'
            )}
          >
            {isDelayed
              ? `${Math.abs(days)}d atraso`
              : days === 0
              ? 'Hoje'
              : project.status === ProjectStatus.Concluido
              ? 'Concluído'
              : `${days}d restantes`}
          </p>
        </div>
      </div>

      {/* Budget */}
      <div className="border-t border-dg-gray-3 pt-3">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <Wallet size={11} className="text-dg-gray-light" />
            <span className="text-[11px] text-dg-gray-light">Orçamento utilizado</span>
          </div>
          <span
            className={clsx(
              'text-[11px] font-bold',
              isOverBudget ? 'text-red-400' : budgetPct > 85 ? 'text-dg-yellow' : 'text-green-400'
            )}
          >
            {budgetPct}%
          </span>
        </div>
        <div className="w-full h-1 bg-dg-gray-3 rounded-full overflow-hidden">
          <div
            className={clsx(
              'h-full rounded-full',
              isOverBudget ? 'bg-red-500' : budgetPct > 85 ? 'bg-dg-yellow' : 'bg-green-500'
            )}
            style={{ width: `${Math.min(budgetPct, 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[10px] text-dg-gray-5">
            {formatCurrency(project.spent, project.countryId)}
          </span>
          <span className="text-[10px] text-dg-gray-5">
            {formatCurrency(project.budget, project.countryId)}
          </span>
        </div>
      </div>

      {/* Company badge */}
      <div className="mt-3 flex items-center gap-1.5">
        <span className="text-sm">{company?.logo ?? '🏢'}</span>
        <span className="text-[11px] text-dg-gray-light truncate">{company?.name}</span>
      </div>
    </Link>
  )
}

// ─────────────────────────────────────────────
// New Project Modal
// ─────────────────────────────────────────────

interface NewProjectForm {
  name: string
  location: string
  client: string
  directorName: string
  encarregadoName: string
  startDate: string
  deadline: string
  countryId: string
  companyId: string
}

const EMPTY_FORM: NewProjectForm = {
  name: '',
  location: '',
  client: '',
  directorName: '',
  encarregadoName: '',
  startDate: '',
  deadline: '',
  countryId: '',
  companyId: '',
}

function NewProjectModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState<NewProjectForm>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)

  const filteredCompanies = useMemo(
    () => (form.countryId ? mockCompanies.filter((c) => c.countryId === form.countryId) : mockCompanies),
    [form.countryId]
  )

  function set(field: keyof NewProjectForm, value: string) {
    setForm((prev) => {
      const updated = { ...prev, [field]: value }
      if (field === 'countryId') updated.companyId = ''
      return updated
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 800))
    setSubmitting(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-dg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-dg-gray border border-dg-gray-3 rounded-2xl shadow-2xl animate-fade-in overflow-hidden">
        {/* Modal header */}
        <div className="flex items-center justify-between p-6 border-b border-dg-gray-3">
          <div>
            <h2 className="text-lg font-bold text-dg-white">Nova Obra</h2>
            <p className="text-xs text-dg-gray-light mt-0.5">Criar novo projeto de construção</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-dg-gray-3 hover:bg-dg-gray-4 flex items-center justify-center transition-colors"
          >
            <X size={16} className="text-dg-gray-light" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[75vh]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-dg-gray-light mb-1.5 uppercase tracking-wide">
                Nome da Obra *
              </label>
              <input
                className="input"
                placeholder="Ex: Residencial Parque das Nações"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                required
              />
            </div>

            {/* Location */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-dg-gray-light mb-1.5 uppercase tracking-wide">
                Localização *
              </label>
              <input
                className="input"
                placeholder="Ex: Lisboa, Portugal"
                value={form.location}
                onChange={(e) => set('location', e.target.value)}
                required
              />
            </div>

            {/* Client */}
            <div>
              <label className="block text-xs font-semibold text-dg-gray-light mb-1.5 uppercase tracking-wide">
                Cliente *
              </label>
              <input
                className="input"
                placeholder="Nome do cliente ou dono de obra"
                value={form.client}
                onChange={(e) => set('client', e.target.value)}
                required
              />
            </div>

            {/* Country */}
            <div>
              <label className="block text-xs font-semibold text-dg-gray-light mb-1.5 uppercase tracking-wide">
                País *
              </label>
              <div className="relative">
                <select
                  className="input appearance-none pr-10"
                  value={form.countryId}
                  onChange={(e) => set('countryId', e.target.value)}
                  required
                >
                  <option value="">Selecionar país...</option>
                  {mockCountries.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.flag} {c.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-dg-gray-light pointer-events-none" />
              </div>
            </div>

            {/* Company */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-dg-gray-light mb-1.5 uppercase tracking-wide">
                Empresa *
              </label>
              <div className="relative">
                <select
                  className="input appearance-none pr-10"
                  value={form.companyId}
                  onChange={(e) => set('companyId', e.target.value)}
                  required
                >
                  <option value="">Selecionar empresa...</option>
                  {filteredCompanies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.logo} {c.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-dg-gray-light pointer-events-none" />
              </div>
            </div>

            {/* Director */}
            <div>
              <label className="block text-xs font-semibold text-dg-gray-light mb-1.5 uppercase tracking-wide">
                Diretor de Obra *
              </label>
              <input
                className="input"
                placeholder="Nome do diretor"
                value={form.directorName}
                onChange={(e) => set('directorName', e.target.value)}
                required
              />
            </div>

            {/* Encarregado */}
            <div>
              <label className="block text-xs font-semibold text-dg-gray-light mb-1.5 uppercase tracking-wide">
                Encarregado Geral *
              </label>
              <input
                className="input"
                placeholder="Nome do encarregado"
                value={form.encarregadoName}
                onChange={(e) => set('encarregadoName', e.target.value)}
                required
              />
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-xs font-semibold text-dg-gray-light mb-1.5 uppercase tracking-wide">
                Data de Início *
              </label>
              <input
                className="input"
                type="date"
                value={form.startDate}
                onChange={(e) => set('startDate', e.target.value)}
                required
              />
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-xs font-semibold text-dg-gray-light mb-1.5 uppercase tracking-wide">
                Prazo de Conclusão *
              </label>
              <input
                className="input"
                type="date"
                value={form.deadline}
                onChange={(e) => set('deadline', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-dg-gray-3">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={clsx('btn-primary flex items-center gap-2', submitting && 'opacity-75 cursor-not-allowed')}
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-dg-black/30 border-t-dg-black rounded-full animate-spin" />
                  A criar...
                </>
              ) : (
                <>
                  <Plus size={16} />
                  Criar Obra
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────

export default function ObrasPage() {
  const [search, setSearch] = useState('')
  const [filterCountry, setFilterCountry] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterCompany, setFilterCompany] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // Stats
  const totalProjects = mockProjects.length
  const activeProjects = mockProjects.filter((p) => p.status === ProjectStatus.EmCurso).length
  const completedProjects = mockProjects.filter((p) => p.status === ProjectStatus.Concluido).length
  const delayedProjects = mockProjects.filter(
    (p) => daysUntil(p.deadline) < 0 && p.status === ProjectStatus.EmCurso
  ).length

  // Filtered projects
  const filtered = useMemo(() => {
    return mockProjects.filter((p) => {
      const q = search.toLowerCase()
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.client.toLowerCase().includes(q) ||
        p.directorName.toLowerCase().includes(q)
      const matchCountry = !filterCountry || p.countryId === filterCountry
      const matchStatus = !filterStatus || p.status === filterStatus
      const matchCompany = !filterCompany || p.companyId === filterCompany
      return matchSearch && matchCountry && matchStatus && matchCompany
    })
  }, [search, filterCountry, filterStatus, filterCompany])

  const hasFilters = !!(search || filterCountry || filterStatus || filterCompany)

  function clearFilters() {
    setSearch('')
    setFilterCountry('')
    setFilterStatus('')
    setFilterCompany('')
  }

  return (
    <>
      {showModal && <NewProjectModal onClose={() => setShowModal(false)} />}

      <div className="space-y-6">
        {/* Page header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 bg-dg-yellow/10 border border-dg-yellow/20 rounded-xl flex items-center justify-center">
                <Building2 size={18} className="text-dg-yellow" />
              </div>
              <h1 className="text-2xl font-black text-dg-white">Obras</h1>
            </div>
            <p className="text-sm text-dg-gray-light ml-12">
              {totalProjects} projetos em {mockCountries.length} países
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-2 flex-shrink-0"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Nova Obra</span>
          </button>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: 'Total de Obras',
              value: totalProjects,
              icon: Layers,
              color: 'text-dg-white',
              bg: 'bg-dg-gray-3',
              border: 'border-dg-gray-4',
            },
            {
              label: 'Em Curso',
              value: activeProjects,
              icon: Clock,
              color: 'text-green-400',
              bg: 'bg-green-500/10',
              border: 'border-green-500/20',
            },
            {
              label: 'Concluídas',
              value: completedProjects,
              icon: CheckCircle2,
              color: 'text-blue-400',
              bg: 'bg-blue-500/10',
              border: 'border-blue-500/20',
            },
            {
              label: 'Com Atraso',
              value: delayedProjects,
              icon: AlertTriangle,
              color: 'text-red-400',
              bg: 'bg-red-500/10',
              border: 'border-red-500/20',
            },
          ].map(({ label, value, icon: Icon, color, bg, border }) => (
            <div key={label} className={clsx('rounded-xl border p-4 flex items-center gap-3', bg, border)}>
              <div className={clsx('w-9 h-9 rounded-lg flex items-center justify-center', bg)}>
                <Icon size={18} className={color} />
              </div>
              <div>
                <p className={clsx('text-xl font-black', color)}>{value}</p>
                <p className="text-[11px] text-dg-gray-light">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search + Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dg-gray-light" />
            <input
              className="input pl-10"
              placeholder="Pesquisar obras, localização, cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dg-gray-light hover:text-dg-white transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={clsx(
              'flex items-center gap-2 px-4 py-3 rounded-xl border font-medium text-sm transition-all',
              showFilters || hasFilters
                ? 'bg-dg-yellow/10 border-dg-yellow/40 text-dg-yellow'
                : 'bg-dg-gray-2 border-dg-gray-4 text-dg-gray-light hover:text-dg-white hover:border-dg-gray-5'
            )}
          >
            <Filter size={16} />
            Filtros
            {[filterCountry, filterStatus, filterCompany].filter(Boolean).length > 0 && (
              <span className="w-5 h-5 bg-dg-yellow text-dg-black text-[10px] font-black rounded-full flex items-center justify-center">
                {[filterCountry, filterStatus, filterCompany].filter(Boolean).length}
              </span>
            )}
          </button>
          {hasFilters && (
            <button onClick={clearFilters} className="btn-ghost flex items-center gap-1.5 text-sm">
              <X size={14} />
              Limpar
            </button>
          )}
        </div>

        {/* Filter panels */}
        {showFilters && (
          <div className="card animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-dg-gray-light mb-2 uppercase tracking-wide">
                  País
                </label>
                <div className="relative">
                  <select
                    className="input appearance-none pr-8"
                    value={filterCountry}
                    onChange={(e) => setFilterCountry(e.target.value)}
                  >
                    <option value="">Todos os países</option>
                    {mockCountries.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.flag} {c.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-dg-gray-light pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-dg-gray-light mb-2 uppercase tracking-wide">
                  Estado
                </label>
                <div className="relative">
                  <select
                    className="input appearance-none pr-8"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="">Todos os estados</option>
                    {Object.values(ProjectStatus).map((s) => (
                      <option key={s} value={s}>
                        {STATUS_CONFIG[s].label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-dg-gray-light pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-dg-gray-light mb-2 uppercase tracking-wide">
                  Empresa
                </label>
                <div className="relative">
                  <select
                    className="input appearance-none pr-8"
                    value={filterCompany}
                    onChange={(e) => setFilterCompany(e.target.value)}
                  >
                    <option value="">Todas as empresas</option>
                    {mockCompanies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.logo} {c.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-dg-gray-light pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-dg-gray-light">
            {filtered.length === mockProjects.length ? (
              <span>
                Mostrando <span className="text-dg-white font-semibold">{filtered.length}</span> obras
              </span>
            ) : (
              <span>
                <span className="text-dg-white font-semibold">{filtered.length}</span> de{' '}
                {mockProjects.length} obras encontradas
              </span>
            )}
          </p>
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
            {filtered.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-dg-gray-2 border border-dg-gray-4 rounded-2xl flex items-center justify-center mb-5">
              <Building2 size={36} className="text-dg-gray-5" />
            </div>
            <h3 className="text-lg font-bold text-dg-white mb-2">Nenhuma obra encontrada</h3>
            <p className="text-sm text-dg-gray-light max-w-xs mb-6">
              {hasFilters
                ? 'Tente ajustar os filtros ou a pesquisa para encontrar o que procura.'
                : 'Ainda não existem obras registadas. Clique em "Nova Obra" para começar.'}
            </p>
            {hasFilters ? (
              <button onClick={clearFilters} className="btn-secondary flex items-center gap-2">
                <X size={16} />
                Limpar filtros
              </button>
            ) : (
              <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
                <Plus size={16} />
                Nova Obra
              </button>
            )}
          </div>
        )}
      </div>
    </>
  )
}
