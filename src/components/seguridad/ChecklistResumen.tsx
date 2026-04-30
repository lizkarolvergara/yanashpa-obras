import { useState } from 'react'
import type { Checklist } from '../../types'

interface Props {
  checklist: Checklist
  onDelete: (id: string) => void
}

const ITEMS: Record<string, string> = {
  epp:          'EPP correcto en todos los trabajadores',
  orden:        'Orden y limpieza del área',
  sctr:         'SCTR vigente',
  equipos:      'Equipos con certificado vigente',
  andamios:     'Andamios y estructuras temporales seguras',
  botiquin:     'Botiquín de primeros auxilios disponible',
  extintores:   'Extintores disponibles y vigentes',
  electrico:    'Instalaciones eléctricas provisionales seguras',
  evacuacion:   'Accesos y vías de evacuación libres',
  herramientas: 'Herramientas en buen estado',
  senalizacion: 'Señalización de zona activa',
  induccion:    'Inducción de seguridad al personal',
}

const estadoConfig = {
  ok:       { label: 'Conforme',  className: 'bg-teal-50 text-teal-700' },
  observado:{ label: 'Observado', className: 'bg-amber-50 text-amber-700' },
  critico:  { label: 'Crítico',   className: 'bg-red-50 text-red-600' },
}

const respuestaConfig: Record<string, string> = {
  ok:       'text-teal-600',
  observado:'text-amber-600',
  na:       'text-gray-400',
}

export default function ChecklistResumen({ checklist, onDelete }: Props) {
  const [confirmando, setConfirmando] = useState(false)
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
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${estado.className}`}>
            {estado.label}
          </span>
          {confirmando ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onDelete(checklist.id)}
                className="text-xs px-2.5 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                Eliminar
              </button>
              <button
                onClick={() => setConfirmando(false)}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmando(true)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-red-100 text-red-400 hover:bg-red-50 transition-colors"
            >
              Eliminar
            </button>
          )}
        </div>
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