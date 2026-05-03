import { useState } from 'react'
import type { Pendiente } from '../../types'

interface Props {
  pendiente: Pendiente
  onToggle: (id: string, estado: 'abierto' | 'resuelto') => void
  onDelete: (id: string) => void
  onUpdate: (id: string, campos: Partial<Pick<Pendiente, 'descripcion' | 'responsable' | 'fecha_limite' | 'prioridad'>>) => Promise<void>
}

const prioridadConfig = {
  alta:  { label: 'Alta',  className: 'bg-red-50 text-red-600' },
  media: { label: 'Media', className: 'bg-amber-50 text-amber-700' },
  baja:  { label: 'Baja',  className: 'bg-gray-100 text-gray-500' },
}

export default function PendienteItem({ pendiente, onToggle, onDelete, onUpdate }: Props) {
  const resuelto = pendiente.estado === 'resuelto'
  const vencido = pendiente.fecha_limite
    && new Date(pendiente.fecha_limite) < new Date()
    && !resuelto
  const prio = prioridadConfig[pendiente.prioridad]

  const [editando, setEditando] = useState(false)
  const [confirmando, setConfirmando] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState({
    descripcion:  pendiente.descripcion,
    responsable:  pendiente.responsable ?? '',
    fecha_limite: pendiente.fecha_limite ?? '',
    prioridad:    pendiente.prioridad,
  })

  async function handleGuardar() {
    if (!editForm.descripcion.trim()) return
    setSaving(true)
    await onUpdate(pendiente.id, {
      descripcion:  editForm.descripcion.trim(),
      responsable:  editForm.responsable.trim() || null,
      fecha_limite: editForm.fecha_limite || null,
      prioridad:    editForm.prioridad,
    })
    setSaving(false)
    setEditando(false)
    setConfirmando(false)
  }

  // ── Vista normal ──────────────────────────────────────────────────────────
  if (!editando) {
    return (
      <div className={`flex items-start gap-3 p-4 rounded-xl border transition-colors ${
        resuelto ? 'bg-gray-50 border-gray-100' : 'bg-white border-gray-200'
      }`}>
        {/* Toggle estado */}
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
          onClick={() => {
            setEditForm({
              descripcion:  pendiente.descripcion,
              responsable:  pendiente.responsable ?? '',
              fecha_limite: pendiente.fecha_limite ?? '',
              prioridad:    pendiente.prioridad,
            })
            setEditando(true)
          }}
          className="text-xs text-teal-600 hover:text-teal-700 font-medium flex-shrink-0 transition-colors"
        >
          Editar
        </button>
      </div>
    )
  }

  // ── Vista edición ─────────────────────────────────────────────────────────
  return (
    <div className="bg-white border border-teal-200 rounded-xl p-4 space-y-3">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Editar pendiente</p>

      <div>
        <label className="block text-xs text-gray-500 mb-1">Descripción *</label>
        <input
          value={editForm.descripcion}
          onChange={e => setEditForm(prev => ({ ...prev, descripcion: e.target.value }))}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Prioridad</label>
          <select
            value={editForm.prioridad}
            onChange={e => setEditForm(prev => ({ ...prev, prioridad: e.target.value as Pendiente['prioridad'] }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
          >
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Fecha límite</label>
          <input
            type="date"
            value={editForm.fecha_limite}
            onChange={e => setEditForm(prev => ({ ...prev, fecha_limite: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">Responsable</label>
        <input
          value={editForm.responsable}
          onChange={e => setEditForm(prev => ({ ...prev, responsable: e.target.value }))}
          placeholder="Nombre del responsable"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => { setEditando(false); setConfirmando(false) }}
          className="flex-1 border border-gray-200 text-gray-600 text-sm py-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleGuardar}
          disabled={saving || !editForm.descripcion.trim()}
          className="flex-1 bg-teal-600 text-white text-sm py-2 rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>

      <div className="border-t border-gray-100 pt-3">
        {confirmando ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-red-500 flex-1">¿Eliminar este pendiente?</span>
            <button
              onClick={() => onDelete(pendiente.id)}
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
            Eliminar pendiente
          </button>
        )}
      </div>
    </div>
  )
}
