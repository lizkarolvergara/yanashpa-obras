import { useState } from 'react'
import type { Checklist } from '../../types'
import { fechaLocal } from '../../lib/fechas'
import { generarPdfEvaluacion } from '../../lib/pdfEvaluacion'
import ConfirmarEliminar from '../ui/ConfirmarEliminar'
import BotonPDF from '../ui/BotonPDF'

interface Props {
  checklist: Checklist
  onDelete: (id: string) => void
  obraNombre?: string
  obraContratista?: string
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
  ok:        { label: 'Conforme',  className: 'bg-teal-50 text-teal-700' },
  observado: { label: 'Observado', className: 'bg-amber-50 text-amber-700' },
  critico:   { label: 'Crítico',   className: 'bg-red-50 text-red-600' },
}

const respuestaConfig: Record<string, string> = {
  ok:        'text-teal-600',
  observado: 'text-amber-600',
  na:        'text-gray-400',
}

const etiquetaRespuesta: Record<string, string> = {
  ok: 'OK', observado: 'Observado', na: 'N/A',
}

export default function ChecklistResumen({ checklist, onDelete, obraNombre, obraContratista }: Props) {
  const [expandido, setExpandido] = useState(false)
  const [generandoPDF, setGenerandoPDF] = useState(false)
  const estado = estadoConfig[checklist.estado_general]
  const fecha = fechaLocal(checklist.fecha_inspeccion).toLocaleDateString('es-PE', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })

  const valores = Object.values(checklist.respuestas)
  const conformes = valores.filter(v => v === 'ok').length
  const observados = valores.filter(v => v === 'observado').length

  async function handleGenerarPDF() {
    setGenerandoPDF(true)
    try {
      const meta: string[] = []
      if (obraNombre) meta.push(`Obra: ${obraNombre}`)
      if (obraContratista) meta.push(`Contratista: ${obraContratista}`)
      meta.push(`Estado general: ${estado.label}`)

      await generarPdfEvaluacion({
        titulo: 'Inspección de Seguridad',
        fecha,
        meta,
        observaciones: checklist.observaciones,
        nombreArchivo: `inspeccion_seguridad_${checklist.fecha_inspeccion}.pdf`,
        secciones: [{
          titulo: 'Ítems evaluados',
          items: Object.entries(ITEMS).map(([key, label]) => {
            const val = checklist.respuestas[key] ?? 'na'
            return {
              label,
              valor: etiquetaRespuesta[val],
              tono: val === 'ok' ? 'ok' as const : val === 'observado' ? 'alerta' as const : 'neutro' as const,
            }
          }),
        }],
      })
    } finally {
      setGenerandoPDF(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-5 py-4 flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 capitalize">{fecha}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {conformes} conformes · {observados} observados
          </p>
          {checklist.observaciones && (
            <p className="text-xs text-gray-400 mt-0.5">{checklist.observaciones}</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${estado.className}`}>
            {estado.label}
          </span>
          <button
            onClick={() => setExpandido(!expandido)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
          >
            {expandido ? 'Ocultar' : 'Ver detalle'}
          </button>
          <BotonPDF onClick={handleGenerarPDF} generando={generandoPDF} />
          <ConfirmarEliminar
            mensaje="¿Eliminar esta inspección?"
            onConfirm={() => onDelete(checklist.id)}
            compacto
          />
        </div>
      </div>

      {expandido && (
        <div className="border-t border-gray-100 divide-y divide-gray-100">
          {Object.entries(ITEMS).map(([key, label]) => {
            const val = checklist.respuestas[key] ?? 'na'
            return (
              <div key={key} className="flex items-center justify-between gap-3 px-5 py-2.5">
                <p className="text-sm text-gray-600">{label}</p>
                <span className={`text-xs font-medium flex-shrink-0 ${respuestaConfig[val] ?? ''}`}>
                  {etiquetaRespuesta[val]}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}