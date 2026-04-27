import { useState } from 'react'
import type { Checklist } from '../../types'

const ITEMS = [
  { key: 'epp',          label: 'EPP correcto en todos los trabajadores' },
  { key: 'senalizacion', label: 'Señalización de zona activa' },
  { key: 'equipos',      label: 'Equipos con certificado vigente' },
  { key: 'orden',        label: 'Orden y limpieza del área' },
  { key: 'evacuacion',   label: 'Accesos y vías de evacuación libres' },
  { key: 'herramientas', label: 'Herramientas en buen estado' },
  { key: 'andamios',     label: 'Andamios y estructuras temporales seguras' },
  { key: 'electrico',    label: 'Instalaciones eléctricas provisionales seguras' },
  { key: 'botiquin',     label: 'Botiquín de primeros auxilios disponible' },
  { key: 'charla',       label: 'Charla de seguridad realizada al inicio' },
]

type RespuestaVal = 'ok' | 'observado' | 'na'

interface Props {
  obraId: string
  onSave: (c: Omit<Checklist, 'id' | 'created_at'>) => Promise<void>
  onCancel: () => void
}

const btnConfig: Record<RespuestaVal, string> = {
  ok:        'bg-teal-500 text-white',
  observado: 'bg-amber-400 text-white',
  na:        'bg-gray-300 text-gray-600',
}

const btnIdle = 'bg-gray-100 text-gray-400 hover:bg-gray-200'

export default function ChecklistForm({ obraId, onSave, onCancel }: Props) {
  const [respuestas, setRespuestas] = useState<Record<string, RespuestaVal>>({})
  const [observaciones, setObservaciones] = useState('')
  const [saving, setSaving] = useState(false)

  function setRespuesta(key: string, val: RespuestaVal) {
    setRespuestas(prev => ({ ...prev, [key]: val }))
  }

  function calcularEstado(): 'ok' | 'observado' | 'critico' {
    const vals = Object.values(respuestas)
    if (vals.includes('observado') && vals.filter(v => v === 'observado').length >= 3) return 'critico'
    if (vals.includes('observado')) return 'observado'
    return 'ok'
  }

  const completados = ITEMS.filter(i => respuestas[i.key]).length

  async function handleSubmit() {
    if (completados < ITEMS.length) return
    setSaving(true)
    await onSave({
      obra_id: obraId,
      fecha_inspeccion: new Date().toISOString().split('T')[0],
      respuestas,
      estado_general: calcularEstado(),
      observaciones: observaciones || null,
      fotos_url: null,
    })
    setSaving(false)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="font-medium text-gray-900 text-sm">Nueva inspección de seguridad</h2>
        <span className="text-xs text-gray-400">{completados}/{ITEMS.length} ítems</span>
      </div>

      <div className="divide-y divide-gray-100">
        {ITEMS.map(item => {
          const val = respuestas[item.key]
          return (
            <div key={item.key} className="flex items-center justify-between gap-4 px-5 py-3">
              <p className="text-sm text-gray-700 flex-1">{item.label}</p>
              <div className="flex gap-1.5 flex-shrink-0">
                {(['ok', 'observado', 'na'] as RespuestaVal[]).map(opt => (
                  <button
                    key={opt}
                    onClick={() => setRespuesta(item.key, opt)}
                    className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                      val === opt ? btnConfig[opt] : btnIdle
                    }`}
                  >
                    {opt === 'ok' ? 'OK' : opt === 'observado' ? 'Obs.' : 'N/A'}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
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
            disabled={completados < ITEMS.length || saving}
            className="flex-1 bg-teal-600 text-white text-sm py-2.5 rounded-lg hover:bg-teal-700 disabled:opacity-40 transition-colors"
          >
            {saving ? 'Guardando...' : completados < ITEMS.length ? `Faltan ${ITEMS.length - completados} ítems` : 'Guardar inspección'}
          </button>
        </div>
      </div>
    </div>
  )
}