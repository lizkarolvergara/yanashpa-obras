import { useState } from 'react'
import type { BitacoraEntry } from '../../types'


interface Props {
  entrada: BitacoraEntry
  onDelete: (id: string) => void
  onUpdate: (id: string, contenido: string) => Promise<void>
}

export default function BitacoraCard({ entrada, onDelete, onUpdate }: Props) {
  const fecha = new Date(entrada.fecha)
  const [editando, setEditando] = useState(false)
  const [texto, setTexto] = useState(entrada.contenido)
  const [saving, setSaving] = useState(false)
  const [confirmando, setConfirmando] = useState(false)

  async function handleGuardar() {
    if (!texto.trim()) return
    setSaving(true)
    await onUpdate(entrada.id, texto.trim())
    setSaving(false)
    setEditando(false)
    setConfirmando(false)
  }

  if (!editando) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="text-xs text-gray-400">
            {fecha.toLocaleDateString('es-PE', {
              weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
            })}
            {' · '}
            {fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
          </div>
          <button
            onClick={() => { setTexto(entrada.contenido); setEditando(true) }}
            className="text-xs text-teal-600 hover:text-teal-700 font-medium flex-shrink-0"
          >
            Editar
          </button>
        </div>
        <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
          {entrada.contenido}
        </p>
        {entrada.foto_url && (
          <img
            src={entrada.foto_url}
            alt="Foto de bitácora"
            className="mt-3 rounded-lg w-full object-cover max-h-64 cursor-pointer"
            onClick={() => window.open(entrada.foto_url!, '_blank')}
          />
        )}
      </div>
    )
  }

  return (
    <div className="bg-white border border-teal-200 rounded-xl p-4 space-y-3">
      <div className="text-xs text-gray-400">
        {fecha.toLocaleDateString('es-PE', {
          weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
        })}
      </div>
      <textarea
        value={texto}
        onChange={e => setTexto(e.target.value)}
        rows={4}
        className="w-full text-sm text-gray-800 border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-teal-400"
      />
      {entrada.foto_url && (
        <img
          src={entrada.foto_url}
          alt="Foto de bitácora"
          className="rounded-lg w-full object-cover max-h-48"
        />
      )}
      <div className="flex gap-2">
        <button
          onClick={() => { setEditando(false); setConfirmando(false) }}
          className="flex-1 border border-gray-200 text-gray-600 text-sm py-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleGuardar}
          disabled={saving || !texto.trim()}
          className="flex-1 bg-teal-600 text-white text-sm py-2 rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
      <div className="border-t border-gray-100 pt-3">
        {confirmando ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-red-500 flex-1">¿Eliminar esta entrada?</span>
            <button
              onClick={() => onDelete(entrada.id)}
              className="text-xs px-3 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
            >
              Sí, eliminar
            </button>
            <button
              onClick={() => setConfirmando(false)}
              className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
            >
              No
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmando(true)}
            className="text-xs text-red-400 hover:text-red-600 transition-colors"
          >
            Eliminar entrada
          </button>
        )}
      </div>
    </div>
  )
}