import type { Obra } from '../../types'
import EstadoBadge from './EstadoBadge'

interface Props {
  obra: Obra
  onClick: () => void
}

function formatTipo(tipo: string) {
  const tipos: Record<string, string> = {
    obra_civil:    'Obra civil',
    mantenimiento: 'Mantenimiento',
    jardineria:    'Jardinería',
    carpinteria:   'Carpintería',
  }
  return tipos[tipo] ?? tipo
}

export default function ObraCard({ obra, onClick }: Props) {
  const diasRestantes = obra.estado === 'cerrada'
    ? null
    : Math.ceil((new Date(obra.fecha_fin).getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  const displayNombre = obra.nombre_corto ?? obra.nombre

  return (
    <div
      onClick={onClick}
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
            {new Date(obra.fecha_inicio).toLocaleDateString('es-PE')}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-0.5">Fecha fin</p>
          <p className="text-gray-700">
            {new Date(obra.fecha_fin).toLocaleDateString('es-PE')}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-0.5">Tipo</p>
          <p className="text-gray-700 capitalize">
            {formatTipo(obra.tipo)}
          </p>
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
}
