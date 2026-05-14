import { useState } from 'react'
import {
  Globe,
  Plus,
  Edit2,
  X,
  Building2,
  FolderOpen,
  Database,
  ToggleLeft,
  ToggleRight,
  Check,
} from 'lucide-react'
import { mockCountries } from '../data/mockData'
import { Country } from '../types'

interface CountryFormData {
  name: string
  flag: string
  currency: string
  language: string
  timezone: string
}

const EMPTY_FORM: CountryFormData = {
  name: '',
  flag: '',
  currency: '',
  language: '',
  timezone: '',
}

const COUNTRY_STATS: Record<string, { activeCompanies: number; activeProjects: number; totalRecords: number }> = {
  pt: { activeCompanies: 2, activeProjects: 2, totalRecords: 612 },
  ao: { activeCompanies: 1, activeProjects: 1, totalRecords: 187 },
  gn: { activeCompanies: 1, activeProjects: 1, totalRecords: 48 },
}

export default function PaisesPage() {
  const [countries, setCountries] = useState<Country[]>(mockCountries)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCountry, setEditingCountry] = useState<Country | null>(null)
  const [form, setForm] = useState<CountryFormData>(EMPTY_FORM)
  const [saved, setSaved] = useState(false)

  function openCreate() {
    setEditingCountry(null)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }

  function openEdit(country: Country) {
    setEditingCountry(country)
    setForm({
      name: country.name,
      flag: country.flag,
      currency: country.currency,
      language: country.language,
      timezone: country.timezone,
    })
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingCountry(null)
    setForm(EMPTY_FORM)
  }

  function handleSave() {
    if (!form.name.trim() || !form.flag.trim()) return

    if (editingCountry) {
      setCountries((prev) =>
        prev.map((c) =>
          c.id === editingCountry.id
            ? { ...c, ...form, currency: form.currency, currencyName: form.currency }
            : c
        )
      )
    } else {
      const newCountry: Country = {
        id: `country-${Date.now()}`,
        name: form.name,
        flag: form.flag,
        currency: form.currency,
        currencyName: form.currency,
        language: form.language,
        timezone: form.timezone,
        active: true,
        companies: [],
      }
      setCountries((prev) => [...prev, newCountry])
    }

    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
    closeModal()
  }

  function toggleActive(id: string) {
    setCountries((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
    )
  }

  const activeCount = countries.filter((c) => c.active).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-dg-white flex items-center gap-3">
            <Globe size={26} className="text-dg-yellow" />
            Países
          </h1>
          <p className="text-dg-gray-light text-sm mt-1">
            {activeCount} país{activeCount !== 1 ? 'es' : ''} ativo{activeCount !== 1 ? 's' : ''} · Grupo DG Global
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Adicionar País
        </button>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Países Ativos', value: activeCount, color: 'text-green-400', bg: 'bg-green-500/10' },
          {
            label: 'Total Empresas',
            value: countries.reduce((acc, c) => acc + c.companies.length, 0),
            color: 'text-dg-yellow',
            bg: 'bg-dg-yellow/10',
          },
          {
            label: 'Total Registos',
            value: Object.values(COUNTRY_STATS).reduce((a, b) => a + b.totalRecords, 0),
            color: 'text-blue-400',
            bg: 'bg-blue-500/10',
          },
        ].map((stat) => (
          <div key={stat.label} className="card flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
              <Database size={18} className={stat.color} />
            </div>
            <div>
              <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-dg-gray-light">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Country cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {countries.map((country) => {
          const stats = COUNTRY_STATS[country.id] ?? { activeCompanies: 0, activeProjects: 0, totalRecords: 0 }
          return (
            <div
              key={country.id}
              className={`card hover:border-dg-yellow/30 transition-all duration-300 flex flex-col gap-5 ${
                !country.active ? 'opacity-60' : ''
              }`}
            >
              {/* Top: flag + name + status */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-dg-gray-2 flex items-center justify-center text-4xl shadow-inner border border-dg-gray-3">
                    {country.flag}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-dg-white">{country.name}</h3>
                    <span className={country.active ? 'badge-green' : 'badge-gray'}>
                      {country.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => openEdit(country)}
                  className="w-8 h-8 rounded-lg bg-dg-gray-2 flex items-center justify-center text-dg-gray-light hover:text-dg-yellow hover:bg-dg-yellow/10 transition-all"
                >
                  <Edit2 size={14} />
                </button>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Moeda', value: `${country.currency} — ${country.currencyName}` },
                  { label: 'Idioma', value: country.language },
                  { label: 'Fuso Horário', value: country.timezone },
                  { label: 'ID', value: country.id.toUpperCase() },
                ].map((item) => (
                  <div key={item.label} className="bg-dg-gray-2 rounded-xl p-3 border border-dg-gray-3">
                    <p className="text-[10px] text-dg-gray-light mb-0.5 uppercase tracking-wide">{item.label}</p>
                    <p className="text-xs font-semibold text-dg-white truncate">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="divider pt-4 grid grid-cols-3 gap-2">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Building2 size={14} className="text-dg-yellow" />
                  </div>
                  <p className="text-lg font-black text-dg-white">{stats.activeCompanies}</p>
                  <p className="text-[10px] text-dg-gray-light">Empresas</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <FolderOpen size={14} className="text-blue-400" />
                  </div>
                  <p className="text-lg font-black text-dg-white">{stats.activeProjects}</p>
                  <p className="text-[10px] text-dg-gray-light">Obras</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Database size={14} className="text-green-400" />
                  </div>
                  <p className="text-lg font-black text-dg-white">{stats.totalRecords}</p>
                  <p className="text-[10px] text-dg-gray-light">Registos</p>
                </div>
              </div>

              {/* Toggle */}
              <button
                onClick={() => toggleActive(country.id)}
                className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-all border ${
                  country.active
                    ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'
                    : 'bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20'
                }`}
              >
                {country.active ? (
                  <>
                    <ToggleRight size={16} />
                    Desativar País
                  </>
                ) : (
                  <>
                    <ToggleLeft size={16} />
                    Ativar País
                  </>
                )}
              </button>
            </div>
          )
        })}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-dg-gray rounded-2xl border border-dg-gray-3 w-full max-w-md shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between p-6 border-b border-dg-gray-3">
              <h2 className="text-lg font-bold text-dg-white flex items-center gap-2">
                <Globe size={18} className="text-dg-yellow" />
                {editingCountry ? 'Editar País' : 'Adicionar País'}
              </h2>
              <button
                onClick={closeModal}
                className="w-8 h-8 rounded-lg bg-dg-gray-2 flex items-center justify-center text-dg-gray-light hover:text-dg-white transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-dg-gray-light mb-2 uppercase tracking-wide">
                  Nome do País *
                </label>
                <input
                  className="input"
                  placeholder="ex: Portugal"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-dg-gray-light mb-2 uppercase tracking-wide">
                  Emoji da Bandeira *
                </label>
                <input
                  className="input"
                  placeholder="ex: 🇵🇹"
                  value={form.flag}
                  onChange={(e) => setForm((f) => ({ ...f, flag: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-dg-gray-light mb-2 uppercase tracking-wide">
                    Moeda (ISO)
                  </label>
                  <input
                    className="input"
                    placeholder="ex: EUR"
                    value={form.currency}
                    onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dg-gray-light mb-2 uppercase tracking-wide">
                    Idioma
                  </label>
                  <input
                    className="input"
                    placeholder="ex: Português"
                    value={form.language}
                    onChange={(e) => setForm((f) => ({ ...f, language: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-dg-gray-light mb-2 uppercase tracking-wide">
                  Fuso Horário (IANA)
                </label>
                <input
                  className="input"
                  placeholder="ex: Europe/Lisbon"
                  value={form.timezone}
                  onChange={(e) => setForm((f) => ({ ...f, timezone: e.target.value }))}
                />
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-dg-gray-3">
              <button onClick={closeModal} className="btn-secondary">
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!form.name.trim() || !form.flag.trim()}
                className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saved ? <Check size={16} /> : <Plus size={16} />}
                {editingCountry ? 'Guardar Alterações' : 'Adicionar País'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
