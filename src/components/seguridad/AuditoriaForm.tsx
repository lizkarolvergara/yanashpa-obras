import { useState } from 'react'
import type { Auditoria } from '../../types'

type RespuestaVal = 'cuenta' | 'no_cuenta'

interface Props {
  obraId: string
  onSave: (a: Omit<Auditoria, 'id' | 'created_at'>) => Promise<void>
  onCancel: () => void
}

const SECCIONES = [
  {
    titulo: 'I. Requisitos documentales y previos',
    items: [
      { key: 'cronograma_presentado',  label: 'Cronograma de obra presentado' },
      { key: 'cronograma_impreso',     label: 'Cronograma de obra impreso y visible en obra' },
      { key: 'iperc_elaborado',        label: 'Matriz de Seguridad / IPERC elaborada' },
      { key: 'iperc_impreso',          label: 'Matriz IPERC impresa y visible en obra' },
    ]
  },
  {
    titulo: 'II. Personal clave',
    items: [
      { key: 'residente',    label: 'Residente de obra designado (Ing./Arq. ≥ 2 años)' },
      { key: 'prevencionista', label: 'Prevencionista de riesgos designado' },
      { key: 'personal',     label: 'Personal suficiente y calificado en obra' },
    ]
  },
  {
    titulo: 'III. Seguridad y salud en el trabajo',
    items: [
      { key: 'epp_uso',      label: 'Uso permanente de EPP completo' },
      { key: 'epp_estado',   label: 'EPP en buen estado' },
      { key: 'sctr',         label: 'SCTR vigente (si aplica)' },
      { key: 'induccion',    label: 'Inducción de seguridad al personal' },
    ]
  },
  {
    titulo: 'IV. Orden, medio ambiente y residuos',
    items: [
      { key: 'contenedor',   label: 'Contenedor para residuos instalado' },
      { key: 'desperdicios', label: 'Manejo adecuado de desperdicios y desmontes' },
      { key: 'limpieza',     label: 'Área de trabajo limpia y ordenada' },
      { key: 'materiales',   label: 'Materiales correctamente almacenados' },
    ]
  },
  {
    titulo: 'V. Ejecución, calidad y plazos',
    items: [
      { key: 'alcance',      label: 'Trabajos conforme al alcance contractual' },
      { key: 'cronograma',   label: 'Cumplimiento del cronograma aprobado' },
      { key: 'calidad',      label: 'Calidad técnica y buena práctica constructiva' },
    ]
  },
  {
    titulo: 'VI. Imagen, conducta y confidencialidad',
    items: [
      { key: 'uniforme',         label: 'Personal uniformado con logo del contratista' },
      { key: 'logos',            label: 'No uso de logos de otros proyectos' },
      { key: 'conducta',         label: 'Conducta adecuada y respeto al proyecto' },
      { key: 'confidencialidad', label: 'Cumplimiento de confidencialidad' },
    ]
  },
]

const TOTAL_ITEMS = SECCIONES.reduce((acc, s) => acc + s.items.length, 0)

const btnConfig: Record<RespuestaVal, string> = {
  cuenta:    'bg-teal-500 text-white',
  no_cuenta: 'bg-red-400 text-white',
}
const btnIdle = 'bg-gray-100 text-gray-400 hover:bg-gray-200'

export default function AuditoriaForm({ obraId, onSave, onCancel }: Props) {
  const [respuestas, setRespuestas] = useState<Record<string, RespuestaVal>>({})
  const [observaciones, setObservaciones] = useState('')
  const [saving, setSaving] = useState(false)

  function setRespuesta(key: string, val: RespuestaVal) {
    setRespuestas(prev => ({ ...prev, [key]: val }))
  }

  function calcularEstado(): 'ok' | 'observado' | 'critico' {
    const vals = Object.values(respuestas)
    const noCuenta = vals.filter(v => v === 'no_cuenta').length
    if (noCuenta >= 4) return 'critico'
    if (noCuenta >= 1) return 'observado'
    return 'ok'
  }

  const completados = SECCIONES.reduce((acc, s) =>
    acc + s.items.filter(i => respuestas[i.key]).length, 0)

  async function handleSubmit() {
    if (completados < TOTAL_ITEMS) return
    setSaving(true)
    await onSave({
      obra_id: obraId,
      fecha_auditoria: new Date().toISOString().split('T')[0],
      respuestas,
      estado_general: calcularEstado(),
      observaciones: observaciones || null,
    })
    setSaving(false)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="font-medium text-gray-900 text-sm">Nueva auditoría</h2>
        <span className="text-xs text-gray-400">{completados}/{TOTAL_ITEMS} ítems</span>
      </div>

      <div className="divide-y divide-gray-100">
        {SECCIONES.map(seccion => (
          <div key={seccion.titulo}>
            <div className="px-5 py-2.5 bg-gray-50">
              <p className="text-xs font-medium text-gray-500">{seccion.titulo}</p>
            </div>
            {seccion.items.map(item => {
              const val = respuestas[item.key]
              return (
                <div key={item.key} className="flex items-center justify-between gap-4 px-5 py-3">
                  <p className="text-sm text-gray-700 flex-1">{item.label}</p>
                  <div className="flex gap-1.5 flex-shrink-0">
                    {(['cuenta', 'no_cuenta'] as RespuestaVal[]).map(opt => (
                      <button
                        key={opt}
                        onClick={() => setRespuesta(item.key, opt)}
                        className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                          val === opt ? btnConfig[opt] : btnIdle
                        }`}
                      >
                        {opt === 'cuenta' ? 'Cuenta' : 'No cuenta'}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>

      <div className="px-5 py-4 border-t border-gray-100 space-y-3">
        <textarea
          value={observaciones}
          onChange={e => setObservaciones(e.target.value)}
          placeholder="Observaciones generales (opcional)..."
          rows={2}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400 resize-none"
        />
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 border border-gray-200 text-gray-600 text-sm py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={completados < TOTAL_ITEMS || saving}
            className="flex-1 bg-teal-600 text-white text-sm py-2.5 rounded-lg hover:bg-teal-700 disabled:opacity-40 transition-colors"
          >
            {saving ? 'Guardando...' : completados < TOTAL_ITEMS ? `Faltan ${TOTAL_ITEMS - completados} ítems` : 'Guardar auditoría'}
          </button>
        </div>
      </div>
    </div>
  )
}