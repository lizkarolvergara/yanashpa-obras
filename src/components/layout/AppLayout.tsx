import { NavLink, Outlet } from 'react-router-dom'

const navItems = [
  { to: '/proyectos',   label: 'Proyectos' },
  { to: '/seguimiento', label: 'Seguimiento' },
  { to: '/recorridos',  label: 'Recorridos' },
  { to: '/informes',    label: 'Informes' },
]

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between">
        <span className="font-medium text-gray-900 flex-shrink-0">MY Operaciones</span>
        <nav className="flex gap-1 overflow-x-auto">
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
      </header>
      <main className="flex-1 px-4 py-6 max-w-5xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  )
}