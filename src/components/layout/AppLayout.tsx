import { useState } from 'react'
import { NavLink, Link, Outlet } from 'react-router-dom'

const navItems = [
  { to: '/proyectos',   label: 'Proyectos' },
  { to: '/seguimiento', label: 'Seguimiento' },
  { to: '/recorridos',  label: 'Recorridos' },
  { to: '/informes',    label: 'Informes' },
]

export default function AppLayout() {
  const [menuAbierto, setMenuAbierto] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between relative z-30">
        <Link
          to="/"
          className="font-medium text-gray-900 flex-shrink-0 hover:text-teal-600 transition-colors"
          onClick={() => setMenuAbierto(false)}
        >
          MY Operaciones
        </Link>

        {/* Nav desktop */}
        <nav className="hidden sm:flex gap-1">
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

        {/* Botón hamburguesa móvil */}
        <button
          className="sm:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          onClick={() => setMenuAbierto(prev => !prev)}
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

      <main className="flex-1 px-4 py-6 max-w-5xl mx-auto w-full">
        <Outlet />
      </main>
      <footer className="text-center text-xs text-gray-400 py-4 border-t border-gray-100">
        Liz Karol Vergara · 2026
      </footer>
    </div>
  )
}
