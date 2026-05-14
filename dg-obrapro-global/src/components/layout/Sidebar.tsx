import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Building2, Camera, Rss, Trophy, Map, Globe,
  Factory, Wrench, FileText, Users, ChevronRight, HardHat, Zap,
  LogOut, Bell, X
} from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import clsx from 'clsx'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', section: 'main' },
  { label: 'Feed Global', icon: Rss, path: '/feed', section: 'main', badge: '12' },
  { label: 'Mapa Mundial', icon: Map, path: '/mapa', section: 'main' },
  { label: 'Rankings', icon: Trophy, path: '/rankings', section: 'main' },
  { label: 'Obras', icon: Building2, path: '/obras', section: 'gestao' },
  { label: 'Equipas', icon: Users, path: '/equipas', section: 'gestao' },
  { label: 'Países', icon: Globe, path: '/paises', section: 'admin' },
  { label: 'Empresas', icon: Factory, path: '/empresas', section: 'admin' },
  { label: 'Atividades', icon: Wrench, path: '/atividades', section: 'admin' },
  { label: 'Relatórios', icon: FileText, path: '/relatorios', section: 'reports' },
]

const sections: Record<string, string> = {
  main: 'Principal',
  gestao: 'Gestão',
  admin: 'Administração',
  reports: 'Relatórios',
}

interface SidebarProps {
  open: boolean
  mobileOpen: boolean
  onMobileClose: () => void
}

export default function Sidebar({ open, mobileOpen, onMobileClose }: SidebarProps) {
  const location = useLocation()
  const { currentUser, logout } = useAppStore()

  const grouped = navItems.reduce((acc, item) => {
    if (!acc[item.section]) acc[item.section] = []
    acc[item.section].push(item)
    return acc
  }, {} as Record<string, typeof navItems>)

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={clsx(
          'hidden lg:flex flex-col bg-dg-dark border-r border-dg-gray-3 transition-all duration-300 overflow-hidden',
          open ? 'w-64' : 'w-16'
        )}
      >
        <SidebarContent open={open} grouped={grouped} location={location} currentUser={currentUser} logout={logout} />
      </aside>

      {/* Mobile sidebar */}
      <aside
        className={clsx(
          'fixed left-0 top-0 h-full w-72 bg-dg-dark border-r border-dg-gray-3 z-50 flex flex-col transition-transform duration-300 lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <button
          onClick={onMobileClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-dg-gray-2 text-dg-gray-light"
        >
          <X size={16} />
        </button>
        <SidebarContent open grouped={grouped} location={location} currentUser={currentUser} logout={logout} />
      </aside>
    </>
  )
}

function SidebarContent({
  open,
  grouped,
  location,
  currentUser,
  logout,
}: {
  open: boolean
  grouped: Record<string, typeof navItems>
  location: ReturnType<typeof useLocation>
  currentUser: { name?: string; role?: string } | null
  logout: () => void
}) {
  return (
    <>
      {/* Logo */}
      <div className="p-4 border-b border-dg-gray-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-dg-yellow rounded-xl flex items-center justify-center flex-shrink-0 glow-yellow">
            <HardHat size={18} className="text-dg-black" />
          </div>
          {open && (
            <div className="overflow-hidden">
              <p className="font-black text-sm text-dg-white leading-none">DG ObraPro</p>
              <p className="text-xs text-dg-yellow font-semibold mt-0.5">GLOBAL</p>
            </div>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-6">
        {Object.entries(grouped).map(([section, items]) => (
          <div key={section}>
            {open && (
              <p className="text-xs font-semibold text-dg-gray-5 uppercase tracking-widest mb-2 px-3">
                {sections[section]}
              </p>
            )}
            <div className="space-y-0.5">
              {items.map((item) => {
                const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/')
                const Icon = item.icon
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    title={!open ? item.label : undefined}
                    className={clsx(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative',
                      isActive
                        ? 'bg-dg-yellow/10 text-dg-yellow border border-dg-yellow/20'
                        : 'text-dg-gray-light hover:bg-dg-gray-2 hover:text-dg-white',
                      !open && 'justify-center'
                    )}
                  >
                    <Icon size={18} className="flex-shrink-0" />
                    {open && (
                      <>
                        <span className="text-sm font-medium flex-1">{item.label}</span>
                        {item.badge && (
                          <span className="bg-dg-yellow text-dg-black text-xs font-bold px-1.5 py-0.5 rounded-full leading-none">
                            {item.badge}
                          </span>
                        )}
                        {isActive && <ChevronRight size={14} className="opacity-50" />}
                      </>
                    )}
                    {!open && item.badge && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-dg-yellow text-dg-black text-[9px] font-bold rounded-full flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Quick action */}
      {open && (
        <div className="px-3 pb-3">
          <div className="bg-gradient-to-br from-dg-yellow/20 to-dg-blue/20 border border-dg-yellow/20 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={14} className="text-dg-yellow" />
              <span className="text-xs font-semibold text-dg-yellow">Registo Rápido</span>
            </div>
            <Link
              to="/obras"
              className="w-full bg-dg-yellow text-dg-black text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 hover:bg-dg-yellow-light transition-colors"
            >
              <Camera size={12} />
              Nova Produção
            </Link>
          </div>
        </div>
      )}

      {/* User */}
      <div className="p-3 border-t border-dg-gray-3 flex-shrink-0">
        <div className={clsx('flex items-center', open ? 'gap-3' : 'justify-center')}>
          <div className="w-8 h-8 rounded-full bg-dg-yellow flex items-center justify-center flex-shrink-0 text-dg-black text-sm font-bold">
            {currentUser?.name?.charAt(0) ?? 'U'}
          </div>
          {open && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-dg-white truncate">{currentUser?.name ?? 'Utilizador'}</p>
              <p className="text-[10px] text-dg-gray-light truncate">{currentUser?.role}</p>
            </div>
          )}
          {open && (
            <div className="flex items-center gap-1">
              <button className="p-1.5 rounded-lg hover:bg-dg-gray-2 text-dg-gray-light hover:text-dg-white transition-colors">
                <Bell size={14} />
              </button>
              <button
                onClick={logout}
                className="p-1.5 rounded-lg hover:bg-dg-gray-2 text-dg-gray-light hover:text-red-400 transition-colors"
                title="Sair"
              >
                <LogOut size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
