import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useObras } from '../../hooks/useObras'
import { useAuth } from '../../context/AuthContext'
import { useIrALogin } from '../../hooks/useIrALogin'
import ObraCard from '../../components/obras/ObraCard'
import TarjetasBloqueadas from '../../components/auth/TarjetasBloqueadas'

type Filtro = 'todas' | 'activa' | 'pausada' | 'cerrada'

export default function ObrasPage() {
  const { obras, loading, error } = useObras()
  const { user, loading: authLoading } = useAuth()
  const irALogin = useIrALogin()
  const [filtro, setFiltro] = useState<Filtro>('activa')
  const navigate = useNavigate()

  const filtros: { value: Filtro; label: string }[] = [
    { value: 'todas',   label: 'Todos' },
    { value: 'activa',  label: 'Activos' },
    { value: 'pausada', label: 'Pausados' },
    { value: 'cerrada', label: 'Cerrados' },
  ]

  const obrasFiltradas = filtro === 'todas'
    ? obras
    : obras.filter(o => o.estado === filtro)

  function handleNuevo() {
    if (user) navigate('/proyectos/nuevo')
    else irALogin('Inicia sesión para crear un proyecto.', '/proyectos/nuevo')
  }

  if (loading || authLoading) return (
    <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
      Cargando proyectos...
    </div>
  )

  if (error) return (
    <div className="flex items-center justify-center py-20 text-red-500 text-sm">
      Error: {error}
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-medium text-gray-900">Proyectos</h1>
        <button
          onClick={handleNuevo}
          className="bg-teal-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
        >
          + Nuevo proyecto
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        {filtros.map(f => (
          <button
            key={f.value}
            onClick={() => setFiltro(f.value)}
            className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
              filtro === f.value
                ? 'bg-teal-50 text-teal-700 font-medium'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {!user ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {obrasFiltradas.map(obra => (
            <ObraCard
              key={obra.id}
              obra={obra}
              onClick={() => navigate(`/proyectos/${obra.id}`)}
            />
          ))}
          <TarjetasBloqueadas variante="obra" />
        </div>
      ) : obrasFiltradas.length === 0 ? (
        <div className="text-center py-20 text-gray-400 text-sm">
          {filtro === 'todas'
            ? 'No hay proyectos registrados aún.'
            : `No hay proyectos ${filtro}s.`}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {obrasFiltradas.map(obra => (
            <ObraCard
              key={obra.id}
              obra={obra}
              onClick={() => navigate(`/proyectos/${obra.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}