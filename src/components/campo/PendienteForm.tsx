import { useState } from 'react'
import type { Pendiente } from '../../types'

interface Props {
  obraId: string
  onSave: (p: Omit<Pendiente, 'id' | 'created_at'>) => Promise<void>
  onCancel: () => void
}

export default function PendienteForm({ obraId, onSave, onCancel }: Props) {
  const [form, setForm] = useState({
    descripcion: '',
    prioridad: 'media' as 'alta' | 'media' | 'baja',
    fecha_limite: '',
    responsable: '',
  })
  const [saving, setSaving] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.descripcion.trim()) return
    setSaving(true)
    await onSave({
      obra_id: obraId,
      descripcion: form.descripcion,
      estado: 'abierto',
      prioridad: form.prioridad,
      fecha_limite: form.fecha_limite || null,
      responsable: form.responsable || null,
    })
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-teal-50 border border-teal-200 rounded-xl p-4 space-y-3">
      <input
        name="descripcion"
        value={form.descripcion}
        onChange={handleChange}
        required
        autoFocus
        placeholder="Descripción del pendiente..."
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400 bg-white"
      />
      <div className="grid grid-cols-3 gap-2">
        <select
          name="prioridad"
          value={form.prioridad}
          onChange={handleChange}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400 bg-white"
        >
          <option value="alta">Alta</option>
          <option value="media">Media</option>
          <option value="baja">Baja</option>
        </select>
        <input
          type="date"
          name="fecha_limite"
          value={form.fecha_limite}
          onChange={handleChange}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400 bg-white"
        />
        <input
          name="responsable"
          value={form.responsable}
          onChange={handleChange}
          placeholder="Responsable"
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400 bg-white"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 border border-gray-200 text-gray-600 text-sm py-2 rounded-lg hover:bg-white transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 bg-teal-600 text-white text-sm py-2 rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Guardando...' : 'Agregar'}
        </button>
      </div>
    </form>
  )
}