import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function LoginPage() {
  const { user, loading, signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as { from?: string; mensaje?: string } | null
  const destino = state?.from ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  if (!loading && user) return <Navigate to={destino} replace />

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setEnviando(true)
    const mensajeError = await signIn(email, password)
    setEnviando(false)
    if (mensajeError) {
      setError(mensajeError)
      return
    }
    navigate(destino, { replace: true })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="block text-center font-medium text-gray-900 mb-6 hover:text-teal-600 transition-colors">
          MY Operaciones
        </Link>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h1 className="text-lg font-medium text-gray-900">Iniciar sesión</h1>
          <p className="text-sm text-gray-500 mt-1">
            {state?.mensaje ?? 'Accede para gestionar todos los proyectos.'}
          </p>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm text-gray-600 mb-1.5">Correo</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm text-gray-600 mb-1.5">Contraseña</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
              />
            </div>

            {error && (
              <div role="alert" className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={enviando}
              className="w-full bg-teal-600 text-white text-sm py-2.5 rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
            >
              {enviando ? 'Ingresando...' : 'Iniciar sesión'}
            </button>
          </form>
        </div>

        <Link to="/" className="block text-center text-sm text-gray-500 hover:text-gray-700 mt-4">
          ← Volver al demo
        </Link>
      </div>
    </div>
  )
}