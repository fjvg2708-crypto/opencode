import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { HardHat, Eye, EyeOff, Globe, Shield, Zap, ChevronRight, AlertCircle } from 'lucide-react'
import { useAppStore } from '../store/appStore'
import clsx from 'clsx'

const demoAccounts = [
  { email: 'diego@dgobrapro.com', password: 'admin123', role: 'Admin Global', color: 'text-dg-yellow' },
  { email: 'carlos@construcoes.pt', password: 'engineer123', role: 'Diretor de Obra', color: 'text-blue-400' },
  { email: 'ana@construtora.com.br', password: 'manager123', role: 'Gestor / Manager', color: 'text-green-400' },
]

const features = [
  { icon: Globe, label: 'Operação Internacional', desc: 'Portugal, Angola, Guiné e mais' },
  { icon: Zap, label: 'Registo em 1 minuto', desc: 'Foto + voz + quantidade' },
  { icon: Shield, label: 'Validação em cascata', desc: 'Encarregado → Diretor → Auto' },
]

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, isAuthenticated, authError, clearAuthError } = useAppStore()
  const [email, setEmail] = useState('diego@dgobrapro.com')
  const [password, setPassword] = useState('admin123')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [animIn, setAnimIn] = useState(false)

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true })
  }, [isAuthenticated, navigate])

  useEffect(() => {
    const t = setTimeout(() => setAnimIn(true), 100)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (authError) clearAuthError()
  }, [email, password])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await login(email, password)
    setLoading(false)
  }

  const fillDemo = (acc: (typeof demoAccounts)[0]) => {
    setEmail(acc.email)
    setPassword(acc.password)
    clearAuthError()
  }

  return (
    <div className="min-h-screen bg-dg-black flex overflow-hidden">
      {/* Left panel - branding */}
      <div
        className={clsx(
          'hidden lg:flex flex-col justify-between w-[55%] p-12 bg-gradient-to-br from-dg-dark via-dg-gray to-dg-blue-dark relative overflow-hidden',
          'transition-all duration-700',
          animIn ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
        )}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-dg-yellow/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-dg-blue/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(rgba(245,197,24,1) 1px, transparent 1px), linear-gradient(90deg, rgba(245,197,24,1) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        {/* Logo */}
        <div className="relative">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-dg-yellow rounded-2xl flex items-center justify-center glow-yellow">
              <HardHat size={28} className="text-dg-black" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-dg-white">DG ObraPro</h1>
              <p className="text-dg-yellow font-bold tracking-[0.3em] text-sm">GLOBAL</p>
            </div>
          </div>
          <p className="text-dg-gray-light mt-4 text-sm leading-relaxed max-w-sm">
            A plataforma mais avançada de gestão de produção e registo fotográfico de obra do mercado internacional.
          </p>
        </div>

        {/* Stats */}
        <div className="relative grid grid-cols-3 gap-4">
          {[
            { value: '3', label: 'Países Ativos' },
            { value: '24', label: 'Obras em Curso' },
            { value: '1.2M', label: 'Registos Totais' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <p className="text-2xl font-black text-dg-yellow">{stat.value}</p>
              <p className="text-xs text-dg-gray-light mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="relative space-y-3">
          {features.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex items-center gap-4 bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-dg-yellow/20 flex items-center justify-center flex-shrink-0">
                <Icon size={18} className="text-dg-yellow" />
              </div>
              <div>
                <p className="text-sm font-semibold text-dg-white">{label}</p>
                <p className="text-xs text-dg-gray-light">{desc}</p>
              </div>
              <ChevronRight size={14} className="text-dg-gray-light ml-auto" />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="relative">
          <p className="text-xs text-dg-gray-5">© 2025 Grupo DG. Todos os direitos reservados.</p>
          <p className="text-xs text-dg-gray-5 mt-1">Versão Enterprise 1.0 — Uso Interno</p>
        </div>
      </div>

      {/* Right panel - login form */}
      <div
        className={clsx(
          'flex-1 flex flex-col items-center justify-center p-8 relative transition-all duration-700 delay-150',
          animIn ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
        )}
      >
        {/* Mobile logo */}
        <div className="lg:hidden mb-8 text-center">
          <div className="w-16 h-16 bg-dg-yellow rounded-2xl flex items-center justify-center mx-auto mb-3 glow-yellow">
            <HardHat size={32} className="text-dg-black" />
          </div>
          <h1 className="text-2xl font-black text-dg-white">DG ObraPro Global</h1>
        </div>

        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-dg-white">Bem-vindo de volta</h2>
            <p className="text-dg-gray-light mt-1 text-sm">Aceda à sua conta para continuar</p>
          </div>

          {/* Error */}
          {authError && (
            <div className="mb-4 flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
              <AlertCircle size={16} />
              {authError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-dg-gray-light mb-2 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="email@grupodg.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-dg-gray-light mb-2 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pr-11"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dg-gray-light hover:text-dg-white transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={clsx(
                'w-full btn-primary flex items-center justify-center gap-2',
                loading && 'opacity-70 cursor-not-allowed'
              )}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-dg-black/30 border-t-dg-black rounded-full animate-spin" />
                  A autenticar...
                </>
              ) : (
                <>
                  Entrar
                  <ChevronRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-dg-gray-3" />
              <p className="text-xs text-dg-gray-5 font-medium">Contas de demonstração</p>
              <div className="flex-1 h-px bg-dg-gray-3" />
            </div>
            <div className="space-y-2">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => fillDemo(acc)}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-dg-gray-2 border border-dg-gray-4 rounded-xl hover:border-dg-yellow/30 hover:bg-dg-gray-3 transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-dg-gray-4 flex items-center justify-center text-lg">
                    {acc.role.includes('Admin') ? '👑' : acc.role.includes('Diretor') ? '🏗️' : '⛏️'}
                  </div>
                  <div className="text-left flex-1">
                    <p className={clsx('text-xs font-semibold', acc.color)}>{acc.role}</p>
                    <p className="text-xs text-dg-gray-light">{acc.email}</p>
                  </div>
                  <ChevronRight size={14} className="text-dg-gray-5 group-hover:text-dg-yellow transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
