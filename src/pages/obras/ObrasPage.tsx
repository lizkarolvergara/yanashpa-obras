import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useObras } from '../../hooks/useObras'
import { useAuth } from '../../context/AuthContext'
import ObraCard from '../../components/obras/ObraCard'
import TarjetasBloqueadas from '../../components/auth/TarjetasBloqueadas'
import FiltroEstado, { type Filtro } from '../../components/obras/FiltroEstado'

export default function ObrasPage() {
  const { obras, loading, error } = useObras()
  const { user, loading: authLoading } = useAuth()
  const [filtro, setFiltro] = useState<Filtro>('activa')
  const navigate = useNavigate()


  const obrasFiltradas = filtro === 'todas'
    ? obras
    : obras.filter(o => o.estado === filtro)

  function handleNuevo() {
    navigate('/proyectos/nuevo')
  }

  if (loading || authLoading) return (
    <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
      Cargando...
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
          + Nuevo
        </button>
      </div>

      <FiltroEstado valor={filtro} onChange={setFiltro} />

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