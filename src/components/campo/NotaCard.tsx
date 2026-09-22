import { useState } from 'react'
import type { NotaCampo } from '../../types'
import ConfirmarEliminar from '../ui/ConfirmarEliminar'

interface Props {
  nota: NotaCampo
  onDelete: (id: string) => void
  onUpdate: (id: string, contenido: string) => Promise<void>
}

export default function NotaCard({ nota, onDelete, onUpdate }: Props) {
  const fecha = new Date(nota.fecha)
  const [editando, setEditando] = useState(false)
  const [texto, setTexto] = useState(nota.contenido)
  const [saving, setSaving] = useState(false)

  async function handleGuardar() {
    if (!texto.trim()) return
    setSaving(true)
    await onUpdate(nota.id, texto.trim())
    setSaving(false)
    setEditando(false)
  }

  // ── Vista normal ──────────────────────────────────────────────────────────
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
            onClick={() => { setTexto(nota.contenido); setEditando(true) }}
            className="text-xs text-teal-600 hover:text-teal-700 font-medium flex-shrink-0 transition-colors"
          >
            Editar
          </button>
        </div>
        <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
          {nota.contenido}
        </p>
        {nota.foto_url && (
          <img
            src={nota.foto_url}
            alt="Foto de campo"
            className="mt-3 rounded-lg w-full object-cover max-h-48"
          />
        )}
      </div>
    )
  }

  // ── Vista edición ─────────────────────────────────────────────────────────
  return (
    <div className="bg-white border border-teal-200 rounded-xl p-4 space-y-3">
      <div className="text-xs text-gray-400">
        {fecha.toLocaleDateString('es-PE', {
          weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
        })}
        {' · '}
        {fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
      </div>

      <textarea
        value={texto}
        onChange={e => setTexto(e.target.value)}
        rows={4}
        className="w-full text-sm text-gray-800 border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-teal-400"
      />

      {nota.foto_url && (
        <img
          src={nota.foto_url}
          alt="Foto de campo"
          className="rounded-lg w-full object-cover max-h-48"
        />
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={() => setEditando(false)}
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
        <ConfirmarEliminar
          mensaje="¿Eliminar esta nota?"
          onConfirm={() => onDelete(nota.id)}
        />
      </div>
    </div>
  )
}