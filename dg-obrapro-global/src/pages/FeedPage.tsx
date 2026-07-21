// ============================================================
// FeedPage — Global Production Feed
// DG ObraPro Global | Grupo DG · Portugal · Angola · Guiné
// ============================================================

import { useState, useMemo } from 'react'
import {
  Camera,
  Heart,
  MapPin,
  Clock,
  CheckCircle2,
  Star,
  Globe,
  ChevronDown,
  Filter,
  ExternalLink,
  Users,
  Zap,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { mockFeedPosts, mockProjects } from '../data/mockData'
import type { FeedPost } from '../types'

// ─────────────────────────────────────────────
// Photo placeholder colours per post index
// ─────────────────────────────────────────────

const PHOTO_GRADIENTS = [
  'from-blue-900/80 via-blue-800/60 to-blue-700/40',
  'from-amber-900/80 via-amber-800/60 to-amber-700/40',
  'from-emerald-900/80 via-emerald-800/60 to-emerald-700/40',
  'from-purple-900/80 via-purple-800/60 to-purple-700/40',
  'from-rose-900/80 via-rose-800/60 to-rose-700/40',
  'from-cyan-900/80 via-cyan-800/60 to-cyan-700/40',
  'from-orange-900/80 via-orange-800/60 to-orange-700/40',
  'from-indigo-900/80 via-indigo-800/60 to-indigo-700/40',
  'from-teal-900/80 via-teal-800/60 to-teal-700/40',
  'from-violet-900/80 via-violet-800/60 to-violet-700/40',
]

const COUNTRY_FILTERS = [
  { id: 'all', label: 'Todos os Países', flag: '🌍' },
  { id: 'pt', label: 'Portugal', flag: '🇵🇹' },
  { id: 'ao', label: 'Angola', flag: '🇦🇴' },
  { id: 'gn', label: 'Guiné-Bissau', flag: '🇬🇼' },
]

const ACTIVITY_FILTERS = [
  'Todas Atividades',
  'Betão Armado',
  'Alvenaria',
  'Pavimentação',
  'Revestimentos',
  'Fundações',
  'Impermeabilização',
  'Pinturas',
]

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60_000)
  if (m < 60) return `há ${m}min`
  const h = Math.floor(m / 60)
  if (h < 24) return `há ${h}h`
  return `há ${Math.floor(h / 24)}d`
}

function countryIdFromFlag(flag: string): string {
  if (flag === '🇵🇹') return 'pt'
  if (flag === '🇦🇴') return 'ao'
  if (flag.startsWith('🇬')) return 'gn'
  return 'all'
}

// ─────────────────────────────────────────────
// Photo Grid
// ─────────────────────────────────────────────

function PhotoGrid({ count, gradient }: { count: number; gradient: string }) {
  const slots = Math.min(count, 3)
  if (slots === 0) return null

  return (
    <div
      className={clsx(
        'grid gap-1.5 rounded-xl overflow-hidden',
        slots === 1 ? 'grid-cols-1' : slots === 2 ? 'grid-cols-2' : 'grid-cols-3',
      )}
    >
      {Array.from({ length: slots }).map((_, i) => (
        <div
          key={i}
          className={clsx(
            'relative flex items-center justify-center',
            slots === 1 ? 'h-48' : 'h-28',
            `bg-gradient-to-br ${gradient}`,
          )}
        >
          <Camera size={slots === 1 ? 32 : 20} className="text-white/40" />
          {i === 0 && count > 3 && (
            <span className="absolute top-2 right-2 bg-black/60 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
              +{count - 3}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────
// Feed Post Card
// ─────────────────────────────────────────────

function FeedCard({
  post,
  index,
  isPinned,
}: {
  post: FeedPost
  index: number
  isPinned?: boolean
}) {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(post.likes)
  const gradient = PHOTO_GRADIENTS[index % PHOTO_GRADIENTS.length]
  const project = mockProjects.find((p) => p.id === post.projectId)
  const isValidated = index % 3 !== 2 // mock: most posts are validated

  function handleLike() {
    if (!liked) {
      setLiked(true)
      setLikeCount((n) => n + 1)
    } else {
      setLiked(false)
      setLikeCount((n) => n - 1)
    }
  }

  return (
    <article
      className={clsx(
        'card p-0 overflow-hidden transition-all duration-300 hover:border-dg-gray-4',
        isPinned && 'border-dg-yellow/40 shadow-lg shadow-dg-yellow/5',
      )}
    >
      {/* Pinned ribbon */}
      {isPinned && (
        <div className="bg-gradient-to-r from-dg-yellow/20 to-transparent px-5 py-2 flex items-center gap-2 border-b border-dg-yellow/20">
          <Star size={13} className="text-dg-yellow fill-dg-yellow" />
          <span className="text-xs font-semibold text-dg-yellow tracking-wide uppercase">
            Obra Destaque do Dia
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between px-5 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-dg-gray-3 flex items-center justify-center text-xl flex-shrink-0">
            {post.countryFlag}
          </div>
          <div>
            <p className="text-xs text-dg-gray-light font-medium">{post.companyName}</p>
            <p className="text-sm font-bold text-dg-white leading-tight">{post.projectName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isValidated ? (
            <span className="badge-green text-[10px] py-0.5 px-2">
              <CheckCircle2 size={10} />
              Validado
            </span>
          ) : (
            <span className="badge-yellow text-[10px] py-0.5 px-2">Pendente</span>
          )}
        </div>
      </div>

      {/* Photos */}
      {post.photos.length > 0 && (
        <div className="px-5 pb-3">
          <PhotoGrid count={post.photos.length} gradient={gradient} />
        </div>
      )}

      {/* Activity + Quantity */}
      <div className="px-5 pb-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="badge-blue text-xs">{post.activityName}</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-dg-white">{post.quantity.toLocaleString('pt-PT')}</span>
          <span className="text-base font-semibold text-dg-gray-light">{post.unit}</span>
        </div>
        {post.comment && (
          <p className="text-sm text-dg-gray-light mt-2 leading-relaxed">{post.comment}</p>
        )}
      </div>

      {/* Meta */}
      <div className="px-5 pb-3 flex flex-wrap items-center gap-3 text-xs text-dg-gray-light">
        <div className="flex items-center gap-1">
          <Users size={12} />
          <span className="font-medium text-dg-white">{post.responsible}</span>
        </div>
        {post.location && (
          <div className="flex items-center gap-1">
            <MapPin size={12} />
            <span className="truncate max-w-[180px]">{post.location}</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <Clock size={12} />
          <span>{timeAgo(post.timestamp)}</span>
        </div>
      </div>

      {/* Footer actions */}
      <div className="px-5 pb-4 flex items-center justify-between border-t border-dg-gray-3 pt-3">
        <button
          onClick={handleLike}
          className={clsx(
            'flex items-center gap-1.5 text-xs font-medium transition-colors',
            liked ? 'text-red-400' : 'text-dg-gray-light hover:text-red-400',
          )}
        >
          <Heart size={15} className={liked ? 'fill-red-400' : ''} />
          <span>{likeCount}</span>
        </button>
        {project && (
          <Link
            to={`/obras/${post.projectId}`}
            className="flex items-center gap-1 text-xs font-semibold text-dg-yellow hover:text-dg-yellow-light transition-colors"
          >
            Ver Obra
            <ExternalLink size={12} />
          </Link>
        )}
      </div>
    </article>
  )
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────

export default function FeedPage() {
  const [countryFilter, setCountryFilter] = useState('all')
  const [activityFilter, setActivityFilter] = useState('Todas Atividades')
  const [visibleCount, setVisibleCount] = useState(6)

  const filteredPosts = useMemo(() => {
    return mockFeedPosts.filter((post) => {
      const matchCountry =
        countryFilter === 'all' || countryIdFromFlag(post.countryFlag) === countryFilter
      const matchActivity =
        activityFilter === 'Todas Atividades' ||
        post.activityName.toLowerCase().includes(activityFilter.toLowerCase())
      return matchCountry && matchActivity
    })
  }, [countryFilter, activityFilter])

  const pinnedPost = mockFeedPosts[4] // Hospital de Bissau — best likes in data
  const feedPosts = filteredPosts.slice(0, visibleCount)
  const hasMore = filteredPosts.length > visibleCount

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-dg-white">Feed Global de Produção</h1>
          <p className="text-dg-gray-light text-sm mt-1">
            Registos de produção em tempo real — 3 países, todas as obras
          </p>
        </div>

        {/* Live counter */}
        <div className="flex items-center gap-3 bg-dg-gray rounded-xl border border-dg-gray-3 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse-slow" />
            <span className="text-sm font-bold text-dg-white">247 registos hoje</span>
          </div>
          <div className="w-px h-4 bg-dg-gray-4" />
          <div className="flex items-center gap-1.5 text-dg-gray-light text-sm">
            <Zap size={13} className="text-dg-yellow" />
            <span>38 equipas ativas</span>
          </div>
        </div>
      </div>

      {/* Pinned post */}
      <FeedCard post={pinnedPost} index={4} isPinned />

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Country filter */}
        <div className="flex items-center gap-1 bg-dg-gray rounded-xl border border-dg-gray-3 p-1">
          {COUNTRY_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setCountryFilter(f.id)}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                countryFilter === f.id
                  ? 'bg-dg-yellow text-dg-black'
                  : 'text-dg-gray-light hover:text-dg-white hover:bg-dg-gray-2',
              )}
            >
              <span>{f.flag}</span>
              <span className="hidden sm:inline">{f.label}</span>
            </button>
          ))}
        </div>

        {/* Activity filter */}
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-dg-gray-light" />
          <select
            value={activityFilter}
            onChange={(e) => setActivityFilter(e.target.value)}
            className="bg-dg-gray-2 border border-dg-gray-4 rounded-lg px-3 py-1.5 text-xs text-dg-white focus:outline-none focus:border-dg-yellow cursor-pointer"
          >
            {ACTIVITY_FILTERS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>

        {/* Result count */}
        <span className="text-xs text-dg-gray-light ml-auto">
          {filteredPosts.length} publicações
        </span>
      </div>

      {/* Feed grid */}
      {feedPosts.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 gap-4">
          <Globe size={48} className="text-dg-gray-4" />
          <div className="text-center">
            <p className="text-dg-white font-semibold">Nenhum registo encontrado</p>
            <p className="text-dg-gray-light text-sm mt-1">
              Tente ajustar os filtros para ver mais publicações
            </p>
          </div>
          <button
            onClick={() => {
              setCountryFilter('all')
              setActivityFilter('Todas Atividades')
            }}
            className="btn-ghost text-sm"
          >
            Limpar filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {feedPosts.map((post, i) => (
            <FeedCard key={post.id} post={post} index={i} />
          ))}
        </div>
      )}

      {/* Load more */}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => setVisibleCount((n) => n + 6)}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <ChevronDown size={16} />
            Carregar mais ({filteredPosts.length - visibleCount} restantes)
          </button>
        </div>
      )}
    </div>
  )
}
