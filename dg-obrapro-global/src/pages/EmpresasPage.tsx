import { useState, useMemo } from 'react'
import {
  Building2,
  Plus,
  Edit2,
  Search,
  X,
  Users,
  FolderOpen,
  UserCircle,
  Check,
  SlidersHorizontal,
} from 'lucide-react'
import { mockCompanies, mockCountries, mockProjects } from '../data/mockData'
import { Company, Country } from '../types'
import clsx from 'clsx'

interface CompanyFormData {
  name: string
  logo: string
  color: string
  countryId: string
  managerName: string
}

const EMPTY_FORM: CompanyFormData = {
  name: '',
  logo: '🏗️',
  color: '#F5C518',
  countryId: 'pt',
  managerName: '',
}

function getCompanyStats(companyId: string) {
  const projects = mockProjects.filter((p) => p.companyId === companyId)
  const activeProjects = projects.filter((p) => p.status === 'Em Curso')
  const totalTeams = projects.reduce((acc, p) => acc + p.teams.length, 0)
  return { projectCount: projects.length, activeProjectCount: activeProjects.length, teamCount: totalTeams }
}

export default function EmpresasPage() {
  const [companies, setCompanies] = useState<Company[]>(mockCompanies)
  const [search, setSearch] = useState('')
  const [filterCountry, setFilterCountry] = useState<string>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [form, setForm] = useState<CompanyFormData>(EMPTY_FORM)
  const [saved, setSaved] = useState(false)

  const filtered = useMemo(() => {
    return companies.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.managerName.toLowerCase().includes(search.toLowerCase())
      const matchCountry = filterCountry === 'all' || c.countryId === filterCountry
      return matchSearch && matchCountry
    })
  }, [companies, search, filterCountry])

  const byCountry = useMemo(() => {
    return mockCountries.map((country) => ({
      country,
      count: companies.filter((c) => c.countryId === country.id).length,
    }))
  }, [companies])

  function openCreate() {
    setEditingCompany(null)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }

  function openEdit(company: Company) {
    setEditingCompany(company)
    setForm({
      name: company.name,
      logo: company.logo,
      color: company.color,
      countryId: company.countryId,
      managerName: company.managerName,
    })
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingCompany(null)
    setForm(EMPTY_FORM)
  }

  function handleSave() {
    if (!form.name.trim()) return

    if (editingCompany) {
      setCompanies((prev) =>
        prev.map((c) => (c.id === editingCompany.id ? { ...c, ...form } : c))
      )
    } else {
      const newCompany: Company = {
        id: `cmp-${Date.now()}`,
        name: form.name,
        logo: form.logo,
        color: form.color,
        countryId: form.countryId,
        managerName: form.managerName,
        active: true,
      }
      setCompanies((prev) => [...prev, newCompany])
    }

    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
    closeModal()
  }

  const activeCompanies = companies.filter((c) => c.active).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-dg-white flex items-center gap-3">
            <Building2 size={26} className="text-dg-yellow" />
            Empresas
          </h1>
          <p className="text-dg-gray-light text-sm mt-1">
            {companies.length} empresas registadas · {activeCompanies} ativas
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Nova Empresa
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-xs text-dg-gray-light mb-1">Total Empresas</p>
          <p className="text-3xl font-black text-dg-white">{companies.length}</p>
        </div>
        <div className="card">
          <p className="text-xs text-dg-gray-light mb-1">Ativas</p>
          <p className="text-3xl font-black text-green-400">{activeCompanies}</p>
        </div>
        {byCountry.map(({ country, count }) => (
          <div key={country.id} className="card flex items-center gap-3">
            <span className="text-3xl">{country.flag}</span>
            <div>
              <p className="text-xs text-dg-gray-light">{country.name}</p>
              <p className="text-2xl font-black text-dg-white">{count}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search & filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dg-gray-light" />
          <input
            className="input pl-9"
            placeholder="Pesquisar empresa ou gestor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-dg-gray-light" />
          <div className="flex rounded-xl overflow-hidden border border-dg-gray-4">
            <button
              onClick={() => setFilterCountry('all')}
              className={clsx(
                'px-3 py-2 text-xs font-medium transition-all',
                filterCountry === 'all'
                  ? 'bg-dg-yellow text-dg-black'
                  : 'bg-dg-gray-2 text-dg-gray-light hover:text-dg-white'
              )}
            >
              Todos
            </button>
            {mockCountries.map((c) => (
              <button
                key={c.id}
                onClick={() => setFilterCountry(c.id)}
                className={clsx(
                  'px-3 py-2 text-xs font-medium transition-all border-l border-dg-gray-4',
                  filterCountry === c.id
                    ? 'bg-dg-yellow text-dg-black'
                    : 'bg-dg-gray-2 text-dg-gray-light hover:text-dg-white'
                )}
              >
                {c.flag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Companies grid */}
      {filtered.length === 0 ? (
        <div className="card text-center py-12">
          <Building2 size={40} className="text-dg-gray-4 mx-auto mb-3" />
          <p className="text-dg-gray-light">Nenhuma empresa encontrada</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((company) => {
            const country = mockCountries.find((c) => c.id === company.countryId) as Country
            const stats = getCompanyStats(company.id)
            return (
              <div
                key={company.id}
                className={clsx(
                  'card hover:border-dg-yellow/30 transition-all duration-300 flex flex-col gap-4',
                  !company.active && 'opacity-60'
                )}
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner border-2"
                      style={{ borderColor: `${company.color}40`, backgroundColor: `${company.color}15` }}
                    >
                      {company.logo}
                    </div>
                    <div>
                      <h3 className="font-bold text-dg-white leading-tight">{company.name}</h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-sm">{country?.flag}</span>
                        <span className="text-xs text-dg-gray-light">{country?.name}</span>
                        {/* colour swatch */}
                        <div
                          className="w-3 h-3 rounded-full ml-1 border border-white/20"
                          style={{ backgroundColor: company.color }}
                          title={company.color}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={company.active ? 'badge-green' : 'badge-gray'}>
                      {company.active ? 'Ativa' : 'Inativa'}
                    </span>
                    <button
                      onClick={() => openEdit(company)}
                      className="w-8 h-8 rounded-lg bg-dg-gray-2 flex items-center justify-center text-dg-gray-light hover:text-dg-yellow hover:bg-dg-yellow/10 transition-all"
                    >
                      <Edit2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Manager */}
                <div className="flex items-center gap-2 bg-dg-gray-2 rounded-xl px-3 py-2 border border-dg-gray-3">
                  <UserCircle size={16} className="text-dg-gray-light flex-shrink-0" />
                  <span className="text-sm text-dg-white font-medium truncate">{company.managerName}</span>
                  <span className="text-[10px] text-dg-gray-light ml-auto">Gestor</span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-dg-gray-2 rounded-xl p-3 border border-dg-gray-3 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <FolderOpen size={14} className="text-dg-yellow" />
                    </div>
                    <p className="text-xl font-black text-dg-white">{stats.activeProjectCount}</p>
                    <p className="text-[10px] text-dg-gray-light">Obras Ativas</p>
                  </div>
                  <div className="bg-dg-gray-2 rounded-xl p-3 border border-dg-gray-3 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Users size={14} className="text-blue-400" />
                    </div>
                    <p className="text-xl font-black text-dg-white">{stats.teamCount}</p>
                    <p className="text-[10px] text-dg-gray-light">Equipas</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-dg-gray rounded-2xl border border-dg-gray-3 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-dg-gray-3">
              <h2 className="text-lg font-bold text-dg-white flex items-center gap-2">
                <Building2 size={18} className="text-dg-yellow" />
                {editingCompany ? 'Editar Empresa' : 'Nova Empresa'}
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
                  Nome da Empresa *
                </label>
                <input
                  className="input"
                  placeholder="ex: DG Construções Lisboa"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-dg-gray-light mb-2 uppercase tracking-wide">
                    Logo (emoji)
                  </label>
                  <input
                    className="input"
                    placeholder="🏗️"
                    value={form.logo}
                    onChange={(e) => setForm((f) => ({ ...f, logo: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dg-gray-light mb-2 uppercase tracking-wide">
                    Cor da Marca
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={form.color}
                      onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                      className="w-12 h-12 rounded-xl border border-dg-gray-4 bg-dg-gray-2 cursor-pointer p-1"
                    />
                    <input
                      className="input"
                      placeholder="#F5C518"
                      value={form.color}
                      onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-dg-gray-light mb-2 uppercase tracking-wide">
                  País
                </label>
                <select
                  className="input"
                  value={form.countryId}
                  onChange={(e) => setForm((f) => ({ ...f, countryId: e.target.value }))}
                >
                  {mockCountries.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.flag} {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-dg-gray-light mb-2 uppercase tracking-wide">
                  Nome do Gestor
                </label>
                <input
                  className="input"
                  placeholder="ex: Miguel Ferreira"
                  value={form.managerName}
                  onChange={(e) => setForm((f) => ({ ...f, managerName: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-dg-gray-3">
              <button onClick={closeModal} className="btn-secondary">
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!form.name.trim()}
                className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saved ? <Check size={16} /> : <Plus size={16} />}
                {editingCompany ? 'Guardar' : 'Criar Empresa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
