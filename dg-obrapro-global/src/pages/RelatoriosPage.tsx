import { useState } from 'react'
import {
  FileText,
  BarChart3,
  Activity,
  Building2,
  Globe,
  FileBarChart2,
  Download,
  Filter,
  Printer,
  ExternalLink,
  ChevronRight,
  Calendar,
  User,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { mockMedicaoAuto, mockProjects, mockCountries } from '../data/mockData'
import clsx from 'clsx'

type ReportType = 'medicao' | 'producao' | 'atividade' | 'obra' | 'global'

interface ReportConfig {
  id: ReportType
  label: string
  description: string
  icon: React.ElementType
  badge: string
}

const REPORT_TYPES: ReportConfig[] = [
  {
    id: 'medicao',
    label: 'Auto de Medição',
    description: 'Por subempreiteiro e período',
    icon: FileText,
    badge: 'Principal',
  },
  {
    id: 'producao',
    label: 'Relatório de Produção',
    description: 'Diário · Semanal · Mensal',
    icon: BarChart3,
    badge: 'Popular',
  },
  {
    id: 'atividade',
    label: 'Relatório por Atividade',
    description: 'Quantidade e valor por atividade',
    icon: Activity,
    badge: '',
  },
  {
    id: 'obra',
    label: 'Relatório por Obra',
    description: 'Detalhe completo por projeto',
    icon: Building2,
    badge: '',
  },
  {
    id: 'global',
    label: 'Relatório Global DG',
    description: 'Consolidado grupo · 3 países',
    icon: Globe,
    badge: 'DG',
  },
]

const CHART_DATA = [
  { mes: 'Fev', betonagem: 17760, alvenaria: 15960, armaduras: 11240 },
  { mes: 'Mar', betonagem: 22400, alvenaria: 18200, armaduras: 14800 },
  { mes: 'Abr', betonagem: 17760, alvenaria: 15960, armaduras: 22940 },
]

const TOOLTIP_STYLE = {
  backgroundColor: '#1A1A1A',
  border: '1px solid #2A2A2A',
  borderRadius: '12px',
  color: '#F5F5F5',
  fontSize: '12px',
}

const SUB_EMPREITEIROS = ['Todos', 'AlveSub Lda', 'BetãoPro SA', 'InstalTec']
const PERIODOS = ['Abril 2025', 'Março 2025', 'Fevereiro 2025', 'Janeiro 2025']

export default function RelatoriosPage() {
  const [selected, setSelected] = useState<ReportType>('medicao')
  const [obra, setObra] = useState(mockProjects[0].id)
  const [periodo, setPeriodo] = useState(PERIODOS[0])
  const [subEmpreiteiro, setSubEmpreiteiro] = useState(SUB_EMPREITEIROS[0])

  const currentProject = mockProjects.find((p) => p.id === obra) ?? mockProjects[0]
  const country = mockCountries.find((c) => c.id === currentProject.countryId)
  const auto = mockMedicaoAuto

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-dg-white flex items-center gap-3">
            <FileBarChart2 size={26} className="text-dg-yellow" />
            Relatórios
          </h1>
          <p className="text-dg-gray-light text-sm mt-1">
            Geração e exportação de relatórios de obra · Grupo DG
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        {/* ── Left panel: report type list ── */}
        <div className="xl:col-span-1 card p-3 space-y-1">
          <p className="text-[10px] font-semibold text-dg-gray-light uppercase tracking-widest px-3 pt-2 pb-1">
            Tipo de Relatório
          </p>
          {REPORT_TYPES.map((rt) => {
            const Icon = rt.icon
            const isActive = selected === rt.id
            return (
              <button
                key={rt.id}
                onClick={() => setSelected(rt.id)}
                className={clsx(
                  'w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all',
                  isActive
                    ? 'bg-dg-yellow/10 border border-dg-yellow/20 text-dg-yellow'
                    : 'hover:bg-dg-gray-2 text-dg-gray-light hover:text-dg-white border border-transparent'
                )}
              >
                <Icon size={18} className="flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold leading-tight truncate">{rt.label}</p>
                  <p className={clsx('text-[10px] truncate mt-0.5', isActive ? 'text-dg-yellow/70' : 'text-dg-gray-5')}>
                    {rt.description}
                  </p>
                </div>
                {rt.badge && (
                  <span
                    className={clsx(
                      'text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0',
                      rt.badge === 'DG'
                        ? 'bg-dg-yellow text-dg-black'
                        : rt.badge === 'Principal'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-green-500/20 text-green-400 border border-green-500/30'
                    )}
                  >
                    {rt.badge}
                  </span>
                )}
                {isActive && <ChevronRight size={14} className="flex-shrink-0" />}
              </button>
            )
          })}
        </div>

        {/* ── Right panel ── */}
        <div className="xl:col-span-3 space-y-5">
          {/* Filters */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Filter size={16} className="text-dg-yellow" />
              <h3 className="font-bold text-dg-white text-sm">Configurar Relatório</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-dg-gray-light mb-2 uppercase tracking-wide">
                  Obra
                </label>
                <select
                  className="input"
                  value={obra}
                  onChange={(e) => setObra(e.target.value)}
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
                  Período
                </label>
                <select
                  className="input"
                  value={periodo}
                  onChange={(e) => setPeriodo(e.target.value)}
                >
                  {PERIODOS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              {selected === 'medicao' && (
                <div>
                  <label className="block text-xs font-semibold text-dg-gray-light mb-2 uppercase tracking-wide">
                    Subempreiteiro
                  </label>
                  <select
                    className="input"
                    value={subEmpreiteiro}
                    onChange={(e) => setSubEmpreiteiro(e.target.value)}
                  >
                    {SUB_EMPREITEIROS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Report preview */}
          <div className="card overflow-hidden p-0">
            {/* DG branded preview header */}
            <div className="bg-gradient-to-r from-dg-black to-dg-dark border-b border-dg-gray-3 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-dg-yellow rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-dg-black font-black text-lg">DG</span>
                  </div>
                  <div>
                    <p className="text-[10px] text-dg-gray-light uppercase tracking-widest">Grupo DG · ObraPro Global</p>
                    <h2 className="text-lg font-black text-dg-white">
                      {selected === 'medicao'
                        ? `Auto de Medição nº ${auto.autoNumber}`
                        : REPORT_TYPES.find((r) => r.id === selected)?.label}
                    </h2>
                  </div>
                </div>
                <div className="text-right">
                  {country && (
                    <div className="flex items-center gap-2 mb-1 justify-end">
                      <span className="text-xl">{country.flag}</span>
                      <span className="text-sm text-dg-gray-light">{country.name}</span>
                    </div>
                  )}
                  <p className="text-xs text-dg-gray-light">Período: <span className="text-dg-white font-semibold">{periodo}</span></p>
                  <p className="text-xs text-dg-gray-light">Gerado em: <span className="text-dg-white">14/05/2025</span></p>
                </div>
              </div>

              {/* Project info strip */}
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Obra', value: currentProject.name },
                  { label: 'Cliente', value: currentProject.client },
                  { label: 'Diretor', value: currentProject.directorName },
                  { label: 'Progresso', value: `${currentProject.progress}%` },
                ].map((item) => (
                  <div key={item.label} className="bg-white/5 rounded-xl px-3 py-2 border border-white/10">
                    <p className="text-[10px] text-dg-gray-light">{item.label}</p>
                    <p className="text-xs font-semibold text-dg-white truncate">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Auto de Medição preview table */}
              {selected === 'medicao' && (
                <>
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar size={14} className="text-dg-yellow" />
                      <span className="text-xs text-dg-gray-light">
                        {auto.periodStart} → {auto.periodEnd}
                      </span>
                      {subEmpreiteiro !== 'Todos' && (
                        <div className="flex items-center gap-1 ml-auto">
                          <User size={12} className="text-dg-gray-light" />
                          <span className="text-xs text-dg-gray-light">{subEmpreiteiro}</span>
                        </div>
                      )}
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-dg-gray-3">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-dg-gray-2 border-b border-dg-gray-3">
                            {['Atividade', 'Unid.', 'Qtd. Anterior', 'Qtd. Período', 'Qtd. Total', 'Preço Unit.', 'Valor Período', 'Valor Total', '%'].map(
                              (h) => (
                                <th
                                  key={h}
                                  className="text-left text-[10px] font-semibold text-dg-gray-light uppercase tracking-wide px-3 py-3 whitespace-nowrap"
                                >
                                  {h}
                                </th>
                              )
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {auto.items.map((item, i) => (
                            <tr
                              key={item.id}
                              className={clsx(
                                'border-b border-dg-gray-3/50 hover:bg-dg-gray-2/40 transition-colors',
                                i % 2 === 0 ? '' : 'bg-dg-gray-2/20'
                              )}
                            >
                              <td className="px-3 py-3 text-dg-white font-medium text-xs whitespace-nowrap">
                                {item.activityName}
                              </td>
                              <td className="px-3 py-3 text-dg-gray-light text-xs">{item.unit}</td>
                              <td className="px-3 py-3 text-dg-gray-light text-xs text-right">{item.previousQuantity.toLocaleString('pt-PT')}</td>
                              <td className="px-3 py-3 text-dg-yellow font-semibold text-xs text-right">
                                {item.currentQuantity.toLocaleString('pt-PT')}
                              </td>
                              <td className="px-3 py-3 text-dg-white text-xs text-right">{item.totalQuantity.toLocaleString('pt-PT')}</td>
                              <td className="px-3 py-3 text-dg-gray-light text-xs text-right">
                                {item.unitPrice.toLocaleString('pt-PT', { style: 'currency', currency: auto.currency })}
                              </td>
                              <td className="px-3 py-3 text-green-400 font-semibold text-xs text-right">
                                {item.periodValue.toLocaleString('pt-PT', { style: 'currency', currency: auto.currency })}
                              </td>
                              <td className="px-3 py-3 text-dg-white font-bold text-xs text-right">
                                {item.totalValue.toLocaleString('pt-PT', { style: 'currency', currency: auto.currency })}
                              </td>
                              <td className="px-3 py-3 text-xs text-right">
                                <span
                                  className={clsx(
                                    'font-semibold',
                                    item.percentComplete >= 75 ? 'text-green-400' :
                                    item.percentComplete >= 50 ? 'text-dg-yellow' : 'text-red-400'
                                  )}
                                >
                                  {item.percentComplete.toFixed(1)}%
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-dg-gray-2 border-t border-dg-gray-3">
                            <td colSpan={6} className="px-3 py-3 text-xs font-bold text-dg-white">
                              Subtotal
                            </td>
                            <td className="px-3 py-3 text-xs font-black text-green-400 text-right">
                              {auto.subtotal.toLocaleString('pt-PT', { style: 'currency', currency: auto.currency })}
                            </td>
                            <td colSpan={2} />
                          </tr>
                          <tr className="bg-dg-gray-2/50">
                            <td colSpan={6} className="px-3 py-2 text-xs text-dg-gray-light">
                              IVA ({(auto.vatRate * 100).toFixed(0)}%)
                            </td>
                            <td className="px-3 py-2 text-xs text-dg-gray-light text-right">
                              {auto.vatAmount.toLocaleString('pt-PT', { style: 'currency', currency: auto.currency })}
                            </td>
                            <td colSpan={2} />
                          </tr>
                          <tr className="bg-dg-yellow/10 border-t border-dg-yellow/30">
                            <td colSpan={6} className="px-3 py-3 text-sm font-black text-dg-yellow">
                              TOTAL
                            </td>
                            <td className="px-3 py-3 text-sm font-black text-dg-yellow text-right">
                              {auto.total.toLocaleString('pt-PT', { style: 'currency', currency: auto.currency })}
                            </td>
                            <td colSpan={2} />
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    {auto.notes && (
                      <p className="text-xs text-dg-gray-light mt-3 italic">{auto.notes}</p>
                    )}
                  </div>

                  {/* Bar chart */}
                  <div>
                    <h4 className="text-sm font-bold text-dg-white mb-3">Evolução por Atividade (€)</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={CHART_DATA} barGap={4}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" vertical={false} />
                        <XAxis dataKey="mes" tick={{ fill: '#6B6B6B', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#6B6B6B', fontSize: 11 }} axisLine={false} tickLine={false} width={60} />
                        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [v.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' }), '']} />
                        <Legend wrapperStyle={{ fontSize: 11, color: '#6B6B6B' }} />
                        <Bar dataKey="betonagem" name="Betonagem" fill="#F5C518" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="alvenaria" name="Alvenaria" fill="#1E6FBA" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="armaduras" name="Armaduras" fill="#10B981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}

              {/* Other report types placeholder */}
              {selected !== 'medicao' && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-dg-gray-2 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    {(() => {
                      const Icon = REPORT_TYPES.find((r) => r.id === selected)?.icon ?? FileText
                      return <Icon size={28} className="text-dg-yellow" />
                    })()}
                  </div>
                  <p className="text-dg-white font-bold mb-1">
                    {REPORT_TYPES.find((r) => r.id === selected)?.label}
                  </p>
                  <p className="text-sm text-dg-gray-light">
                    Selecione os filtros acima e clique em <span className="text-dg-yellow font-medium">Gerar Relatório</span>
                  </p>
                  <button className="btn-primary mt-6">Gerar Relatório</button>
                </div>
              )}
            </div>

            {/* Export footer */}
            <div className="border-t border-dg-gray-3 px-6 py-4 flex items-center justify-between flex-wrap gap-3">
              <p className="text-xs text-dg-gray-light">
                {selected === 'medicao' ? `Auto nº ${auto.autoNumber} · ${auto.approved ? '✅ Aprovado' : '⏳ Aguarda Aprovação'}` : 'Pré-visualização do relatório'}
              </p>
              <div className="flex items-center gap-2">
                <button className="btn-secondary flex items-center gap-2 py-2 px-4 text-sm">
                  <Printer size={15} />
                  Imprimir
                </button>
                <button className="btn-secondary flex items-center gap-2 py-2 px-4 text-sm">
                  <Download size={15} />
                  Excel
                </button>
                <button className="btn-primary flex items-center gap-2 py-2 px-4 text-sm">
                  <Download size={15} />
                  PDF
                </button>
                <button className="btn-secondary flex items-center gap-2 py-2 px-4 text-sm">
                  <ExternalLink size={15} />
                  Online
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
