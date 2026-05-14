import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Menu, Search, Bell, Plus, ChevronDown } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import clsx from 'clsx'

const routeTitles: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Dashboard Global', subtitle: 'Visão geral do Grupo DG' },
  '/feed': { title: 'Feed Global', subtitle: 'Produção em tempo real' },
  '/mapa': { title: 'Mapa Mundial', subtitle: 'Obras ativas no mundo' },
  '/rankings': { title: 'Rankings', subtitle: 'Classificações globais' },
  '/obras': { title: 'Obras', subtitle: 'Gestão de projetos' },
  '/equipas': { title: 'Equipas', subtitle: 'Gestão de equipas' },
  '/paises': { title: 'Países', subtitle: 'Gestão de países' },
  '/empresas': { title: 'Empresas', subtitle: 'Gestão de empresas' },
  '/atividades': { title: 'Atividades', subtitle: 'Biblioteca de atividades' },
  '/relatorios': { title: 'Relatórios', subtitle: 'Autos de medição e relatórios' },
}

interface HeaderProps {
  onMenuClick: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { currentUser, notifications, markAllAsRead } = useAppStore()
  const [showNotifications, setShowNotifications] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const unread = notifications.filter((n) => !n.read).length

  // Find route info — handle dynamic segments
  const pathKey = Object.keys(routeTitles).find((k) => location.pathname.startsWith(k))
  const routeInfo = pathKey ? routeTitles[pathKey] : { title: 'DG ObraPro Global', subtitle: 'Plataforma de gestão de obra' }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  return (
    <header className="bg-dg-dark border-b border-dg-gray-3 px-6 py-3 flex items-center gap-4 flex-shrink-0">
      {/* Menu toggle */}
      <button
        onClick={onMenuClick}
        className="p-2 rounded-lg hover:bg-dg-gray-2 text-dg-gray-light hover:text-dg-white transition-colors"
      >
        <Menu size={18} />
      </button>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-bold text-dg-white truncate">{routeInfo.title}</h1>
        <p className="text-xs text-dg-gray-light truncate">{routeInfo.subtitle}</p>
      </div>

      {/* Search */}
      <div className="hidden md:block">
        {searchOpen ? (
          <form onSubmit={handleSearch} className="relative">
            <input
              autoFocus
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onBlur={() => { if (!searchQuery) setSearchOpen(false) }}
              placeholder="Pesquisar obras, atividades..."
              className="bg-dg-gray-2 border border-dg-gray-4 rounded-xl px-4 py-2 pr-10 text-sm text-dg-white placeholder-dg-gray-light focus:outline-none focus:border-dg-yellow w-72 transition-all"
            />
            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-dg-gray-light" />
          </form>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-dg-gray-2 border border-dg-gray-4 rounded-xl text-sm text-dg-gray-light hover:text-dg-white hover:border-dg-gray-5 transition-all"
          >
            <Search size={14} />
            <span>Pesquisar...</span>
            <kbd className="text-[10px] font-mono bg-dg-gray-4 px-1.5 py-0.5 rounded border border-dg-gray-5">⌘K</kbd>
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Quick add */}
        <button
          onClick={() => navigate('/obras')}
          className="hidden sm:flex items-center gap-2 bg-dg-yellow text-dg-black text-sm font-semibold px-3 py-2 rounded-xl hover:bg-dg-yellow-light transition-colors active:scale-95"
        >
          <Plus size={14} />
          <span className="hidden lg:inline">Novo Registo</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications)
              if (!showNotifications) markAllAsRead()
            }}
            className={clsx(
              'relative p-2 rounded-lg transition-colors',
              showNotifications
                ? 'bg-dg-gray-2 text-dg-white'
                : 'hover:bg-dg-gray-2 text-dg-gray-light hover:text-dg-white'
            )}
          >
            <Bell size={18} />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-dg-yellow text-dg-black text-[9px] font-bold rounded-full flex items-center justify-center">
                {unread}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 bg-dg-dark border border-dg-gray-3 rounded-2xl shadow-2xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-dg-gray-3 flex items-center justify-between">
                <p className="font-semibold text-dg-white text-sm">Notificações</p>
                <span className="badge-yellow text-xs">{notifications.length} novas</span>
              </div>
              <div className="max-h-80 overflow-y-auto no-scrollbar">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={clsx(
                      'px-4 py-3 border-b border-dg-gray-3 last:border-0 hover:bg-dg-gray-2 transition-colors',
                      !n.read && 'bg-dg-yellow/5'
                    )}
                  >
                    <p className="text-sm text-dg-white font-medium">{n.title}</p>
                    <p className="text-xs text-dg-gray-light mt-0.5">{n.message}</p>
                    <p className="text-[10px] text-dg-gray-5 mt-1">
                      {new Date(n.createdAt).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 border-t border-dg-gray-3">
                <button className="text-xs text-dg-yellow hover:text-dg-yellow-light font-medium transition-colors">
                  Ver todas as notificações
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User dropdown */}
        <div className="flex items-center gap-2 pl-2 border-l border-dg-gray-3">
          <div className="w-8 h-8 rounded-full bg-dg-yellow flex items-center justify-center text-dg-black font-bold text-sm">
            {currentUser?.name?.charAt(0) ?? 'A'}
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-semibold text-dg-white leading-none">{currentUser?.name}</p>
            <p className="text-[10px] text-dg-gray-light mt-0.5">{currentUser?.role}</p>
          </div>
          <ChevronDown size={14} className="text-dg-gray-light hidden lg:block" />
        </div>
      </div>
    </header>
  )
}
