import { useState, useMemo } from 'react'
import {
  Users,
  Plus,
  Search,
  X,
  Check,
  SlidersHorizontal,
  HardHat,
  ClipboardList,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react'
import { mockTeams, mockProjects, mockCountries } from '../data/mockData'
import clsx from 'clsx'

// ── Extended team shape with UI extras ──────────────────────
interface TeamUI {
  id: string
  name: string
  specialty: string
  projectId: string
  projectName: string
  countryId: string
  countryFlag: string
  members: number
  memberInitials: string[]
  recordsThisWeek: number
  active: boolean
}

interface TeamFormData {
  name: string
  specialty: string
  projectId: string
  members: number
}

const EMPTY_FORM: TeamFormData = {
  name: '',
  specialty: '',
  projectId: '',
  members: 4,
}

const SPECIALTIES = [
  'Betão Armado',
  'Alvenaria',
  'Revestimentos',
  'Instalações Elétricas',
  'Instalações Hidráulicas',
  'Cobertura',
  'Terraplenagem',
  'Fundações',
  'Carpintaria',
  'Serralharia',
  'Pintura',
  'Demolição',
]

// Simulated per-team records this week
const WEEKLY_RECORDS: Record<string, number> = {
  'tm-001': 47,
  'tm-002': 31,
  'tm-003': 28,
  'tm-004': 24,
  'tm-005': 38,
  'tm-006': 19,
  'tm-007': 22,
  'tm-008': 15,
  'tm-009': 26,
  'tm-010': 12,
}

const NAME_POOL = ['JO', 'MA', 'AN', 'PE', 'SO', 'CA', 'RO', 'LU', 'FE', 'NU', 'AU', 'BE']
const AVATAR_COLORS = [
  'bg-dg-yellow text-dg-black',
  'bg-blue-500 text-white',
  'bg-green-500 text-white',
  'bg-purple-500 text-white',
  'bg-orange-500 text-white',
  'bg-pink-500 text-white',
]

function generateInitials(count: number, teamId: string): string[] {
  const seed = teamId.charCodeAt(teamId.length - 1)
  return Array.from({ length: Math.min(count, 4) }, (_, i) =>
    NAME_POOL[(seed + i * 3) % NAME_POOL.length]
  )
}

function buildTeamUI(): TeamUI[] {
  return mockTeams.map((team) => {
    const project = mockProjects.find((p) => p.id === team.projectId)
    const country = mockCountries.find((c) => c.id === project?.countryId)
    return {
      id: team.id,
      name: team.name,
      specialty: team.specialty,
      projectId: team.projectId,
      projectName: project?.name ?? 'N/A',
      countryId: project?.countryId ?? '',
      countryFlag: country?.flag ?? '🌍',
      members: team.members,
      memberInitials: generateInitials(team.members, team.id),
      recordsThisWeek: WEEKLY_RECORDS[team.id] ?? 0,
      active: ['tm-001', 'tm-002', 'tm-003', 'tm-005', 'tm-007', 'tm-009'].includes(team.id),
    }
  })
}

const SPECIALTY_BADGE: Record<string, string> = {
  'Betão Armado': 'badge-yellow',
  Alvenaria: 'badge-gray',
  Revestimentos: 'badge-gray',
  'Instalações Elétricas': 'badge-yellow',
  'Instalações Hidráulicas': 'badge-blue',
  Cobertura: 'badge-blue',
  Terraplenagem: 'badge-gray',
  Fundações: 'badge-gray',
  Carpintaria: 'badge-yellow',
  Serralharia: 'badge-gray',
  Pintura: 'badge-red',
  Demolição: 'badge-red',
}

export default function EquipasPage() {
  const [teams, setTeams] = useState<TeamUI[]>(() => buildTeamUI())
  const [search, setSearch] = useState('')
  const [filterProject, setFilterProject] = useState('all')
  const [filterCountry, setFilterCountry] = useState('all')
  const [filterSpecialty, setFilterSpecialty] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<TeamFormData>(EMPTY_FORM)
  const [saved, setSaved] = useState(false)

  const filtered = useMemo(() => {
    return teams.filter((t) => {
      const matchSearch =
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.specialty.toLowerCase().includes(search.toLowerCase()) ||
        t.projectName.toLowerCase().includes(search.toLowerCase())
      const matchProject = filterProject === 'all' || t.projectId === filterProject
      const matchCountry = filterCountry === 'all' || t.countryId === filterCountry
      const matchSpecialty = filterSpecialty === 'all' || t.specialty === filterSpecialty
      return matchSearch && matchProject && matchCountry && matchSpecialty
    })
  }, [teams, search, filterProject, filterCountry, filterSpecialty])

  const activeCount = teams.filter((t) => t.active).length
  const totalWorkers = teams.reduce((acc, t) => acc + t.members, 0)

  function toggleActive(id: string) {
    setTeams((prev) => prev.map((t) => (t.id === id ? { ...t, active: !t.active } : t)))
  }

  function openCreate() {
    setForm({ ...EMPTY_FORM, projectId: mockProjects[0].id, specialty: SPECIALTIES[0] })
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setForm(EMPTY_FORM)
  }

  function handleSave() {
    if (!form.name.trim() || !form.projectId) return
    const project = mockProjects.find((p) => p.id === form.projectId)
    const country = mockCountries.find((c) => c.id === project?.countryId)
    const newId = `tm-${Date.now()}`
    const newTeam: TeamUI = {
      id: newId,
      name: form.name,
      specialty: form.specialty,
      projectId: form.projectId,
      projectName: project?.name ?? 'N/A',
      countryId: project?.countryId ?? '',
      countryFlag: country?.flag ?? '🌍',
      members: form.members,
      memberInitials: generateInitials(form.members, newId),
      recordsThisWeek: 0,
      active: true,
    }
    setTeams((prev) => [newTeam, ...prev])
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
    closeModal()
  }

  const uniqueSpecialties = [...new Set(teams.map((t) => t.specialty))]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-dg-white flex items-center gap-3">
            <Users size={26} className="text-dg-yellow" />
            Equipas
          </h1>
          <p className="text-dg-gray-light text-sm mt-1">
            {teams.length} equipas registadas · {activeCount} ativas em obra
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Nova Equipa
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card">
          <p className="text-xs text-dg-gray-light mb-1">Total Equipas</p>
          <p className="text-3xl font-black text-dg-white">{teams.length}</p>
        </div>
        <div className="card">
          <p className="text-xs text-dg-gray-light mb-1">Ativas</p>
          <p className="text-3xl font-black text-green-400">{activeCount}</p>
        </div>
        <div className="card">
          <p className="text-xs text-dg-gray-light mb-1">Total Trabalhadores</p>
          <p className="text-3xl font-black text-dg-yellow">{totalWorkers}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dg-gray-light" />
          <input
            className="input pl-9"
            placeholder="Pesquisar equipa, especialidade ou obra..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <SlidersHorizontal size={16} className="text-dg-gray-light flex-shrink-0" />
          <select
            className="input w-auto min-w-[140px]"
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
          >
            <option value="all">Todas as Obras</option>
            {mockProjects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <select
            className="input w-auto min-w-[130px]"
            value={filterCountry}
            onChange={(e) => setFilterCountry(e.target.value)}
          >
            <option value="all">Todos os Países</option>
            {mockCountries.map((c) => (
              <option key={c.id} value={c.id}>{c.flag} {c.name}</option>
            ))}
          </select>
          <select
            className="input w-auto min-w-[160px]"
            value={filterSpecialty}
            onChange={(e) => setFilterSpecialty(e.target.value)}
          >
            <option value="all">Todas as Especialidades</option>
            {uniqueSpecialties.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Teams grid */}
      {filtered.length === 0 ? (
        <div className="card text-center py-12">
          <Users size={40} className="text-dg-gray-4 mx-auto mb-3" />
          <p className="text-dg-gray-light">Nenhuma equipa encontrada</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((team) => (
            <div
              key={team.id}
              className={clsx(
                'card hover:border-dg-yellow/30 transition-all duration-300 flex flex-col gap-4',
                !team.active && 'opacity-60'
              )}
            >
              {/* Team header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-dg-yellow/10 border border-dg-yellow/20 flex items-center justify-center flex-shrink-0">
                    <HardHat size={20} className="text-dg-yellow" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-dg-white truncate">{team.name}</h3>
                    <span className={SPECIALTY_BADGE[team.specialty] ?? 'badge-gray'}>
                      {team.specialty}
                    </span>
                  </div>
                </div>
                <span className={team.active ? 'badge-green flex-shrink-0' : 'badge-gray flex-shrink-0'}>
                  {team.active ? 'Ativa' : 'Inativa'}
                </span>
              </div>

              {/* Project + country */}
              <div className="bg-dg-gray-2 rounded-xl px-3 py-2 border border-dg-gray-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg flex-shrink-0">{team.countryFlag}</span>
                  <div className="min-w-0">
                    <p className="text-[10px] text-dg-gray-light">Obra</p>
                    <p className="text-xs font-semibold text-dg-white truncate">{team.projectName}</p>
                  </div>
                </div>
              </div>

              {/* Avatar stack + member count */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex -space-x-2">
                    {team.memberInitials.map((initials, i) => (
                      <div
                        key={i}
                        className={clsx(
                          'w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-dg-gray',
                          AVATAR_COLORS[i % AVATAR_COLORS.length]
                        )}
                      >
                        {initials}
                      </div>
                    ))}
                    {team.members > 4 && (
                      <div className="w-8 h-8 rounded-full bg-dg-gray-4 border-2 border-dg-gray flex items-center justify-center text-[10px] font-bold text-dg-gray-light">
                        +{team.members - 4}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-dg-gray-light ml-3">
                    {team.members} trabalhador{team.members !== 1 ? 'es' : ''}
                  </span>
                </div>
              </div>

              {/* Records this week */}
              <div className="flex items-center justify-between bg-dg-gray-2 rounded-xl px-3 py-2.5 border border-dg-gray-3">
                <div className="flex items-center gap-2">
                  <ClipboardList size={14} className="text-blue-400" />
                  <span className="text-xs text-dg-gray-light">Registos esta semana</span>
                </div>
                <span className={clsx(
                  'text-sm font-black',
                  team.recordsThisWeek >= 30 ? 'text-green-400' :
                  team.recordsThisWeek >= 15 ? 'text-dg-yellow' : 'text-dg-gray-light'
                )}>
                  {team.recordsThisWeek}
                </span>
              </div>

              {/* Toggle active */}
              <button
                onClick={() => toggleActive(team.id)}
                className={clsx(
                  'w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium transition-all border',
                  team.active
                    ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'
                    : 'bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20'
                )}
              >
                {team.active ? (
                  <>
                    <ToggleRight size={14} />
                    Suspender Equipa
                  </>
                ) : (
                  <>
                    <ToggleLeft size={14} />
                    Reativar Equipa
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-dg-gray rounded-2xl border border-dg-gray-3 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-dg-gray-3">
              <h2 className="text-lg font-bold text-dg-white flex items-center gap-2">
                <Users size={18} className="text-dg-yellow" />
                Nova Equipa
              </h2>
              <button
                onClick={closeModal}
                className="w-8 h-8 rounded-lg bg-dg-gray-2 flex items-center justify-center text-dg-gray-light hover:text-dg-white transition-all"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-dg-gray-light mb-2 uppercase tracking-wide">
                  Nome da Equipa *
                </label>
                <input
                  className="input"
                  placeholder="ex: Alfa Betão"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-dg-gray-light mb-2 uppercase tracking-wide">
                  Especialidade
                </label>
                <select
                  className="input"
                  value={form.specialty}
                  onChange={(e) => setForm((f) => ({ ...f, specialty: e.target.value }))}
                >
                  {SPECIALTIES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-dg-gray-light mb-2 uppercase tracking-wide">
                  Obra
                </label>
                <select
                  className="input"
                  value={form.projectId}
                  onChange={(e) => setForm((f) => ({ ...f, projectId: e.target.value }))}
                >
                  {mockProjects.map((p) => {
                    const c = mockCountries.find((c) => c.id === p.countryId)
                    return (
                      <option key={p.id} value={p.id}>
                        {c?.flag} {p.name}
                      </option>
                    )
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-dg-gray-light mb-2 uppercase tracking-wide">
                  Número de Trabalhadores
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  className="input"
                  value={form.members}
                  onChange={(e) => setForm((f) => ({ ...f, members: parseInt(e.target.value) || 1 }))}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-dg-gray-3">
              <button onClick={closeModal} className="btn-secondary">
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!form.name.trim() || !form.projectId}
                className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saved ? <Check size={16} /> : <Plus size={16} />}
                Criar Equipa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
