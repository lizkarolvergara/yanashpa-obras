import { useNavigate } from 'react-router-dom'
import { useObras } from '../../hooks/useObras'
import EstadoBadge from '../../components/obras/EstadoBadge'

function formatTipo(tipo: string) {
  const tipos: Record<string, string> = {
    obra_civil:    'Obra civil',
    mantenimiento: 'Mantenimiento',
    jardineria:    'Jardinería',
    carpinteria:   'Carpintería',
  }
  return tipos[tipo] ?? tipo
}

export default function SeguimientoPage() {
  const navigate = useNavigate()
  const { obras, loading, error } = useObras()

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
      Cargando...
    </div>
  )

  if (error) return (
    <div className="flex items-center justify-center py-20 text-red-500 text-sm">
      Error al cargar proyectos.
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-medium text-gray-900">Seguimiento</h1>
      </div>

      {obras.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-16">No hay proyectos registrados.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {obras.map(obra => {
            const diasRestantes = obra.estado === 'cerrada'
              ? null
              : Math.ceil((new Date(obra.fecha_fin + 'T12:00:00').getTime() - Date.now()) / (1000 * 60 * 60 * 24))
            const displayNombre = obra.nombre_corto ?? obra.nombre

            return (
              <div
                key={obra.id}
                onClick={() => navigate(`/seguimiento/${obra.id}`)}
                className="bg-white border border-gray-200 rounded-xl p-5 cursor-pointer hover:border-teal-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h2 className="font-medium text-gray-900 leading-snug">{displayNombre}</h2>
                  <EstadoBadge estado={obra.estado} />
                </div>
                <p className="text-sm text-gray-500 mb-4">{obra.contratista}</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Fecha inicio</p>
                    <p className="text-gray-700">
                      {new Date(obra.fecha_inicio + 'T12:00:00').toLocaleDateString('es-PE')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Fecha fin</p>
                    <p className="text-gray-700">
                      {new Date(obra.fecha_fin + 'T12:00:00').toLocaleDateString('es-PE')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Tipo</p>
                    <p className="text-gray-700">{formatTipo(obra.tipo)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Días restantes</p>
                    <p className={diasRestantes !== null && diasRestantes < 0 ? 'text-red-600 font-medium' : 'text-gray-700'}>
                      {diasRestantes === null
                        ? '—'
                        : diasRestantes < 0
                        ? `Vencido (${Math.abs(diasRestantes)}d)`
                        : `${diasRestantes}d`}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}