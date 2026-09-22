import { useState } from 'react'
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { to: '/proyectos',   label: 'Proyectos' },
  { to: '/seguimiento', label: 'Seguimiento' },
  { to: '/recorridos',  label: 'Recorridos' },
  { to: '/informes',    label: 'Informes' },
]

function IconoUsuario() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0116 0" />
    </svg>
  )
}

export default function AppLayout() {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [menuUsuario, setMenuUsuario] = useState(false)
  const { user, loading, signOut } = useAuth()
  const navigate = useNavigate()

  function handleIconoUsuario() {
    setMenuAbierto(false)
    if (user) setMenuUsuario(prev => !prev)
    else navigate('/login')
  }

  async function handleCerrarSesion() {
    setMenuUsuario(false)
    await signOut()
    // Recarga completa para limpiar los datos privados que quedaron en pantalla
    window.location.assign('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between relative z-30">
        <Link
          to="/"
          className="font-medium text-gray-900 flex-shrink-0 hover:text-teal-600 transition-colors"
          onClick={() => { setMenuAbierto(false); setMenuUsuario(false) }}
        >
          MY Operaciones
        </Link>

        <div className="flex items-center gap-1">
          {/* Nav desktop */}
          <nav className="hidden sm:flex gap-1 mr-1">
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-teal-50 text-teal-700 font-medium'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Ícono de usuario */}
          <div className="relative">
            {loading ? (
              <div className="w-9 h-9" />
            ) : (
              <button
                onClick={handleIconoUsuario}
                aria-label={user ? 'Menú de usuario' : 'Iniciar sesión'}
                aria-expanded={user ? menuUsuario : undefined}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                  user
                    ? 'bg-teal-600 text-white hover:bg-teal-700'
                    : 'border border-gray-200 text-gray-500 hover:bg-gray-100'
                }`}
              >
                <IconoUsuario />
              </button>
            )}

            {user && (
              <>
                {menuUsuario && (
                  <div
                    className="fixed inset-0 z-40"
                    aria-hidden="true"
                    onClick={() => setMenuUsuario(false)}
                  />
                )}
                <div
                  className={`absolute right-0 top-full mt-2 w-60 z-50 origin-top-right transition-all duration-200 ${
                    menuUsuario
                      ? 'opacity-100 scale-100 translate-y-0'
                      : 'opacity-0 scale-95 -translate-y-1 pointer-events-none'
                  }`}
                >
                  <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-xs text-gray-400">Sesión iniciada como</p>
                      <p className="text-sm text-gray-700 truncate mt-1.5">{user.email}</p>
                    </div>
                    <button
                      onClick={handleCerrarSesion}
                      className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-gray-50 transition-colors"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Botón hamburguesa móvil */}
          <button
            className="sm:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            onClick={() => { setMenuAbierto(prev => !prev); setMenuUsuario(false) }}
            aria-label="Abrir menú"
          >
            {menuAbierto ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Menú desplegable móvil */}
      {menuAbierto && (
        <div className="sm:hidden bg-white border-b border-gray-200 px-4 py-2 flex flex-col gap-1 z-20">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMenuAbierto(false)}
              className={({ isActive }) =>
                `px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-teal-50 text-teal-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      )}

      {/* Aviso modo demo */}
      {!loading && !user && (
        <div className="bg-amber-50 border-b border-amber-100 px-4 py-2 text-xs text-amber-800 text-center">
          Modo demo: estás viendo datos de ejemplo y los cambios no se guardan.{' '}
          <Link to="/login" className="font-medium underline hover:text-amber-900">
            Iniciar sesión
          </Link>
        </div>
      )}

      <main className="flex-1 px-4 py-6 max-w-5xl mx-auto w-full">
        <Outlet />
      </main>
      <footer className="text-center text-xs text-gray-400 py-4 border-t border-gray-100">
        Liz Karol Vergara · 2026
      </footer>
    </div>
  )
}