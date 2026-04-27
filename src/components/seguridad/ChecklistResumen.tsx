import type { Checklist } from '../../types'

interface Props {
  checklist: Checklist
}

const ITEMS: Record<string, string> = {
  epp:          'EPP correcto en todos los trabajadores',
  senalizacion: 'Señalización de zona activa',
  equipos:      'Equipos con certificado vigente',
  orden:        'Orden y limpieza del área',
  evacuacion:   'Accesos y vías de evacuación libres',
  herramientas: 'Herramientas en buen estado',
  andamios:     'Andamios y estructuras temporales seguras',
  electrico:    'Instalaciones eléctricas provisionales seguras',
  botiquin:     'Botiquín de primeros auxilios disponible',
  charla:       'Charla de seguridad realizada al inicio',
}

const estadoConfig = {
  ok:       { label: 'Conforme',    className: 'bg-teal-50 text-teal-700' },
  observado:{ label: 'Observado',   className: 'bg-amber-50 text-amber-700' },
  critico:  { label: 'Crítico',     className: 'bg-red-50 text-red-600' },
}

const respuestaConfig: Record<string, string> = {
  ok:       'text-teal-600',
  observado:'text-amber-600',
  na:       'text-gray-400',
}

export default function ChecklistResumen({ checklist }: Props) {
  const estado = estadoConfig[checklist.estado_general]
  const fecha = new Date(checklist.fecha_inspeccion).toLocaleDateString('es-PE', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-900 capitalize">{fecha}</p>
          {checklist.observaciones && (
            <p className="text-xs text-gray-400 mt-0.5">{checklist.observaciones}</p>
          )}
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${estado.className}`}>
          {estado.label}
        </span>
      </div>
      <div className="divide-y divide-gray-100">
        {Object.entries(checklist.respuestas).map(([key, val]) => (
          <div key={key} className="flex items-center justify-between px-5 py-2.5">
            <p className="text-sm text-gray-600">{ITEMS[key] ?? key}</p>
            <span className={`text-xs font-medium ${respuestaConfig[val] ?? ''}`}>
              {val === 'ok' ? 'OK' : val === 'observado' ? 'Observado' : 'N/A'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}