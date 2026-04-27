import type { Pendiente } from '../../types'

interface Props {
  pendiente: Pendiente
  onToggle: (id: string, estado: 'abierto' | 'resuelto') => void
  onDelete: (id: string) => void
}

const prioridadConfig = {
  alta:  { label: 'Alta',  className: 'bg-red-50 text-red-600' },
  media: { label: 'Media', className: 'bg-amber-50 text-amber-700' },
  baja:  { label: 'Baja',  className: 'bg-gray-100 text-gray-500' },
}

export default function PendienteItem({ pendiente, onToggle, onDelete }: Props) {
  const resuelto = pendiente.estado === 'resuelto'
  const vencido = pendiente.fecha_limite
    && new Date(pendiente.fecha_limite) < new Date()
    && !resuelto
  const prio = prioridadConfig[pendiente.prioridad]

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border transition-colors ${
      resuelto ? 'bg-gray-50 border-gray-100' : 'bg-white border-gray-200'
    }`}>
      <button
        onClick={() => onToggle(pendiente.id, resuelto ? 'abierto' : 'resuelto')}
        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 transition-colors ${
          resuelto
            ? 'bg-teal-500 border-teal-500'
            : 'border-gray-300 hover:border-teal-400'
        }`}
      >
        {resuelto && (
          <svg viewBox="0 0 20 20" fill="white" className="w-full h-full p-0.5">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd"/>
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-snug ${resuelto ? 'line-through text-gray-400' : 'text-gray-800'}`}>
          {pendiente.descripcion}
        </p>
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${prio.className}`}>
            {prio.label}
          </span>
          {pendiente.responsable && (
            <span className="text-xs text-gray-400">{pendiente.responsable}</span>
          )}
          {pendiente.fecha_limite && (
            <span className={`text-xs ${vencido ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
              {vencido ? 'Vencido · ' : ''}
              {new Date(pendiente.fecha_limite).toLocaleDateString('es-PE')}
            </span>
          )}
        </div>
      </div>

      <button
        onClick={() => onDelete(pendiente.id)}
        className="text-gray-300 hover:text-red-400 transition-colors text-lg leading-none flex-shrink-0"
      >
        ×
      </button>
    </div>
  )
}