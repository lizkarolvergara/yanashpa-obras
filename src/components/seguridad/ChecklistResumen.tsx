import { useState } from 'react'
import type { Checklist } from '../../types'
import { fechaLocal } from '../../lib/fechas'
import ConfirmarEliminar from '../ui/ConfirmarEliminar'

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
  ok:       'text-teal-600',
  observado:'text-amber-600',
  na:       'text-gray-400',
}

export default function ChecklistResumen({ checklist, onDelete, obraNombre, obraContratista }: Props) {
  const [generandoPDF, setGenerandoPDF] = useState(false)
  const estado = estadoConfig[checklist.estado_general]
  const fecha = fechaLocal(checklist.fecha_inspeccion).toLocaleDateString('es-PE', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })

  async function handleGenerarPDF() {
    setGenerandoPDF(true)
    try {
      const jsPDF = (await import('jspdf')).default
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageW = 210
      const margin = 15
      const contentW = pageW - margin * 2
      let y = 20

      // Título
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0)
      doc.text('Inspección de Seguridad', margin, y)
      y += 8

      // Metadata
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100)
      doc.text(`Fecha: ${fecha}`, margin, y)
      y += 6
      if (obraNombre) {
        doc.text(`Obra: ${obraNombre}`, margin, y)
        y += 6
      }
      if (obraContratista) {
        doc.text(`Contratista: ${obraContratista}`, margin, y)
        y += 6
      }

      const estadoLabel = checklist.estado_general === 'ok' ? 'Conforme'
        : checklist.estado_general === 'observado' ? 'Observado' : 'Crítico'
      doc.text(`Estado general: ${estadoLabel}`, margin, y)
      y += 6

      if (checklist.observaciones) {
        const lines = doc.splitTextToSize(`Observaciones: ${checklist.observaciones}`, contentW)
        doc.text(lines, margin, y)
        y += lines.length * 5 + 2
      }

      y += 4
      doc.setDrawColor(200)
      doc.line(margin, y, pageW - margin, y)
      y += 8

      // Ítems
      doc.setTextColor(0)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Ítems evaluados', margin, y)
      y += 8

      for (const [key, label] of Object.entries(ITEMS)) {
        if (y > 270) { doc.addPage(); y = 20 }
        const val = checklist.respuestas[key] ?? 'na'
        const valLabel = val === 'ok' ? 'OK' : val === 'observado' ? 'Observado' : 'N/A'

        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(60)
        doc.text(label, margin, y)

        doc.setFont('helvetica', 'bold')
        if (val === 'ok')       doc.setTextColor(22, 163, 74)
        else if (val === 'observado') doc.setTextColor(180, 120, 0)
        else                    doc.setTextColor(120, 120, 120)
        doc.text(valLabel, pageW - margin, y, { align: 'right' })

        doc.setDrawColor(230)
        doc.line(margin, y + 2, pageW - margin, y + 2)
        y += 8
      }

      const fileName = `checklist_seguridad_${checklist.fecha_inspeccion}.pdf`
      const blob = doc.output('blob')
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = fileName
      a.click()
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000)
    } finally {
      setGenerandoPDF(false)
    }
  }

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
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
          <button
            onClick={handleGenerarPDF}
            disabled={generandoPDF}
            className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-teal-100 text-teal-600 hover:bg-teal-50 disabled:opacity-40 transition-colors"
          >
            {generandoPDF ? 'Generando...' : 'PDF'}
          </button>
          <ConfirmarEliminar
            mensaje="¿Eliminar esta inspección?"
            onConfirm={() => onDelete(checklist.id)}
            compacto
          />
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