import { useState, useMemo } from 'react'
import {
  Layers,
  Plus,
  Search,
  X,
  Check,
  BarChart3,
  Star,
} from 'lucide-react'
import { mockActivities } from '../data/mockData'
import { Activity, ActivityCategory } from '../types'
import clsx from 'clsx'

interface ActivityFormData {
  name: string
  category: ActivityCategory
  unit: string
  icon: string
}

const EMPTY_FORM: ActivityFormData = {
  name: '',
  category: ActivityCategory.Estruturas,
  unit: 'm²',
  icon: '🏗️',
}

const UNITS = ['m²', 'm³', 'ml', 'un', 'kg', 't', 'vg']

const CATEGORY_CONFIG: Record<ActivityCategory, { color: string; badgeClass: string; bg: string }> = {
  [ActivityCategory.Estruturas]: { color: 'text-orange-400', badgeClass: 'badge-yellow', bg: 'bg-orange-500/10' },
  [ActivityCategory.Alvenaria]: { color: 'text-amber-400', badgeClass: 'badge-yellow', bg: 'bg-amber-500/10' },
  [ActivityCategory.Impermeabilizacao]: { color: 'text-blue-400', badgeClass: 'badge-blue', bg: 'bg-blue-500/10' },
  [ActivityCategory.Revestimentos]: { color: 'text-purple-400', badgeClass: 'badge-gray', bg: 'bg-purple-500/10' },
  [ActivityCategory.Instalacoes]: { color: 'text-yellow-400', badgeClass: 'badge-yellow', bg: 'bg-yellow-500/10' },
  [ActivityCategory.Terraplenagem]: { color: 'text-stone-400', badgeClass: 'badge-gray', bg: 'bg-stone-500/10' },
  [ActivityCategory.Betao]: { color: 'text-dg-yellow', badgeClass: 'badge-yellow', bg: 'bg-dg-yellow/10' },
  [ActivityCategory.Carpintaria]: { color: 'text-amber-600', badgeClass: 'badge-yellow', bg: 'bg-amber-600/10' },
  [ActivityCategory.Serralharia]: { color: 'text-gray-400', badgeClass: 'badge-gray', bg: 'bg-gray-400/10' },
  [ActivityCategory.Pintura]: { color: 'text-pink-400', badgeClass: 'badge-red', bg: 'bg-pink-500/10' },
  [ActivityCategory.Pavimentacao]: { color: 'text-teal-400', badgeClass: 'badge-green', bg: 'bg-teal-500/10' },
  [ActivityCategory.Cobertura]: { color: 'text-sky-400', badgeClass: 'badge-blue', bg: 'bg-sky-500/10' },
  [ActivityCategory.Fundacoes]: { color: 'text-brown-400', badgeClass: 'badge-gray', bg: 'bg-stone-600/10' },
  [ActivityCategory.Demolicao]: { color: 'text-red-400', badgeClass: 'badge-red', bg: 'bg-red-500/10' },
  [ActivityCategory.Exterior]: { color: 'text-green-400', badgeClass: 'badge-green', bg: 'bg-green-500/10' },
}

// Simulated usage counts
const USAGE_COUNTS: Record<string, number> = {
  'act-001': 142,
  'act-002': 118,
  'act-003': 97,
  'act-004': 88,
  'act-005': 74,
  'act-006': 61,
  'act-007': 55,
  'act-008': 49,
  'act-009': 43,
  'act-010': 38,
  'act-011': 31,
  'act-012': 27,
  'act-013': 24,
  'act-014': 19,
  'act-015': 15,
  'act-016': 11,
}

const DISPLAY_CATEGORIES = [
  ActivityCategory.Betao,
  ActivityCategory.Estruturas,
  ActivityCategory.Alvenaria,
  ActivityCategory.Revestimentos,
  ActivityCategory.Instalacoes,
  ActivityCategory.Impermeabilizacao,
  ActivityCategory.Pavimentacao,
  ActivityCategory.Cobertura,
  ActivityCategory.Pintura,
  ActivityCategory.Terraplenagem,
  ActivityCategory.Fundacoes,
  ActivityCategory.Carpintaria,
  ActivityCategory.Serralharia,
  ActivityCategory.Demolicao,
  ActivityCategory.Exterior,
]

export default function AtividadesPage() {
  const [activities, setActivities] = useState<Activity[]>(mockActivities)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<ActivityCategory | 'all'>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<ActivityFormData>(EMPTY_FORM)
  const [saved, setSaved] = useState(false)

  const filtered = useMemo(() => {
    return activities.filter((a) => {
      const matchSearch = a.name.toLowerCase().includes(search.toLowerCase())
      const matchCat = activeCategory === 'all' || a.category === activeCategory
      return matchSearch && matchCat
    })
  }, [activities, search, activeCategory])

  const grouped = useMemo(() => {
    const byCategory: Record<string, Activity[]> = {}
    filtered.forEach((a) => {
      if (!byCategory[a.category]) byCategory[a.category] = []
      byCategory[a.category].push(a)
    })
    return byCategory
  }, [filtered])

  const mostUsed = useMemo(() => {
    return [...activities].sort(
      (a, b) => (USAGE_COUNTS[b.id] ?? 0) - (USAGE_COUNTS[a.id] ?? 0)
    )[0]
  }, [activities])

  function openCreate() {
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setForm(EMPTY_FORM)
  }

  function handleSave() {
    if (!form.name.trim()) return
    const newActivity: Activity = {
      id: `act-${Date.now()}`,
      name: form.name,
      category: form.category,
      unit: form.unit,
      icon: form.icon,
    }
    setActivities((prev) => [...prev, newActivity])
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
    closeModal()
  }

  const categoriesWithActivities = DISPLAY_CATEGORIES.filter(
    (cat) => grouped[cat] && grouped[cat].length > 0
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-dg-white flex items-center gap-3">
            <Layers size={26} className="text-dg-yellow" />
            Atividades
          </h1>
          <p className="text-dg-gray-light text-sm mt-1">
            Biblioteca de atividades e medições · {activities.length} atividades registadas
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Nova Atividade
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-xs text-dg-gray-light mb-1">Total Atividades</p>
          <p className="text-3xl font-black text-dg-white">{activities.length}</p>
        </div>
        <div className="card">
          <p className="text-xs text-dg-gray-light mb-1">Categorias</p>
          <p className="text-3xl font-black text-dg-yellow">{DISPLAY_CATEGORIES.length}</p>
        </div>
        {mostUsed && (
          <div className="card col-span-2 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-dg-yellow/10 flex items-center justify-center text-2xl">
              {mostUsed.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <Star size={12} className="text-dg-yellow" />
                <span className="text-[10px] text-dg-yellow uppercase tracking-wide font-semibold">Mais Usada</span>
              </div>
              <p className="text-sm font-bold text-dg-white truncate">{mostUsed.name}</p>
              <p className="text-xs text-dg-gray-light">
                {USAGE_COUNTS[mostUsed.id] ?? 0} registos · {mostUsed.unit}
              </p>
            </div>
            <BarChart3 size={24} className="text-dg-gray-4 flex-shrink-0" />
          </div>
        )}
      </div>

      {/* By category breakdown */}
      <div className="flex gap-2 flex-wrap">
        {Object.entries(
          activities.reduce<Record<string, number>>((acc, a) => {
            acc[a.category] = (acc[a.category] ?? 0) + 1
            return acc
          }, {})
        )
          .sort((a, b) => b[1] - a[1])
          .map(([cat, count]) => {
            const cfg = CATEGORY_CONFIG[cat as ActivityCategory]
            return (
              <div key={cat} className={`${cfg.bg} rounded-lg px-3 py-1.5 border border-white/5`}>
                <span className={`text-xs font-semibold ${cfg.color}`}>{cat}</span>
                <span className="text-xs text-dg-gray-light ml-1.5">({count})</span>
              </div>
            )
          })}
      </div>

      {/* Search + category filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dg-gray-light" />
          <input
            className="input pl-9"
            placeholder="Pesquisar atividade..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input sm:w-60"
          value={activeCategory}
          onChange={(e) => setActiveCategory(e.target.value as ActivityCategory | 'all')}
        >
          <option value="all">Todas as categorias</option>
          {DISPLAY_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Grouped activity cards */}
      {categoriesWithActivities.length === 0 ? (
        <div className="card text-center py-12">
          <Layers size={40} className="text-dg-gray-4 mx-auto mb-3" />
          <p className="text-dg-gray-light">Nenhuma atividade encontrada</p>
        </div>
      ) : (
        <div className="space-y-6">
          {categoriesWithActivities.map((category) => {
            const items = grouped[category]
            const cfg = CATEGORY_CONFIG[category]
            return (
              <div key={category}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-1.5 h-5 rounded-full ${cfg.bg.replace('/10', '/60')}`} />
                  <h2 className={`text-sm font-bold uppercase tracking-wider ${cfg.color}`}>
                    {category}
                  </h2>
                  <span className="text-xs text-dg-gray-light">({items.length})</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
                  {items.map((activity) => {
                    const usage = USAGE_COUNTS[activity.id] ?? 0
                    return (
                      <div
                        key={activity.id}
                        className="card-sm hover:border-dg-yellow/30 transition-all duration-200 flex gap-3 items-start"
                      >
                        <div
                          className={clsx(
                            'w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0',
                            cfg.bg
                          )}
                        >
                          {activity.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-dg-white leading-tight truncate">
                            {activity.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={cfg.badgeClass}>{activity.category}</span>
                            <span className="badge-gray">{activity.unit}</span>
                          </div>
                          <p className="text-[10px] text-dg-gray-light mt-1.5">
                            {usage} usos · ID: {activity.id}
                          </p>
                        </div>
                      </div>
                    )
                  })}
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
                <Layers size={18} className="text-dg-yellow" />
                Nova Atividade
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
                  Nome da Atividade *
                </label>
                <input
                  className="input"
                  placeholder="ex: Betonagem de Laje"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-dg-gray-light mb-2 uppercase tracking-wide">
                    Ícone (emoji)
                  </label>
                  <input
                    className="input text-2xl"
                    placeholder="🏗️"
                    value={form.icon}
                    onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dg-gray-light mb-2 uppercase tracking-wide">
                    Unidade
                  </label>
                  <select
                    className="input"
                    value={form.unit}
                    onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                  >
                    {UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-dg-gray-light mb-2 uppercase tracking-wide">
                  Categoria
                </label>
                <select
                  className="input"
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as ActivityCategory }))}
                >
                  {DISPLAY_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
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
                Criar Atividade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
