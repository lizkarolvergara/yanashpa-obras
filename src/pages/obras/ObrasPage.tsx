import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useObras } from '../../hooks/useObras'
import ObraCard from '../../components/obras/ObraCard'

type Filtro = 'todas' | 'activa' | 'pausada' | 'cerrada'

export default function ObrasPage() {
  const { obras, loading, error } = useObras()
  const [filtro, setFiltro] = useState<Filtro>('todas')
  const navigate = useNavigate()

  const filtros: { value: Filtro; label: string }[] = [
    { value: 'todas',   label: 'Todas' },
    { value: 'activa',  label: 'Activas' },
    { value: 'pausada', label: 'Pausadas' },
    { value: 'cerrada', label: 'Cerradas' },
  ]

  const obrasFiltradas = filtro === 'todas'
    ? obras
    : obras.filter(o => o.estado === filtro)

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
      Cargando obras...
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
        <h1 className="text-xl font-medium text-gray-900">Obras</h1>
        <button
          onClick={() => navigate('/obras/nueva')}
          className="bg-teal-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
        >
          + Nueva obra
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

      {obrasFiltradas.length === 0 ? (
        <div className="text-center py-20 text-gray-400 text-sm">
          {filtro === 'todas'
            ? 'No hay obras registradas aún.'
            : `No hay obras ${filtro}s.`}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {obrasFiltradas.map(obra => (
            <ObraCard
              key={obra.id}
              obra={obra}
              onClick={() => navigate(`/obras/${obra.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}