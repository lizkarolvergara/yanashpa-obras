import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRecorridos } from '../../hooks/useRecorridos'

export default function RecorridosPage() {
  const navigate = useNavigate()
  const { recorridos, loading, createRecorrido } = useRecorridos()
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ titulo: '', participantes: '', descripcion: '' })

  async function handleCrear() {
    setSaving(true)
    const nuevo = await createRecorrido({
      fecha:         new Date().toISOString().split('T')[0],
      titulo:        form.titulo.trim() || null,
      participantes: form.participantes.trim() || null,
      descripcion:   form.descripcion.trim() || null,
    })
    setSaving(false)
    setShowForm(false)
    setForm({ titulo: '', participantes: '', descripcion: '' })
    navigate(`/recorridos/${nuevo.id}`)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-medium text-gray-900">Recorridos</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-teal-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
          >
            + Nuevo recorrido
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 space-y-4">
          <p className="text-sm font-medium text-gray-700">Nuevo recorrido</p>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Título (opcional)</label>
            <input
              value={form.titulo}
              onChange={e => setForm(prev => ({ ...prev, titulo: e.target.value }))}
              placeholder="Ej: Recorrido semanal zona norte"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Participantes</label>
            <input
              value={form.participantes}
              onChange={e => setForm(prev => ({ ...prev, participantes: e.target.value }))}
              placeholder="Ej: Liz, Juan, contratista ABC"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Descripción general (opcional)</label>
            <textarea
              value={form.descripcion}
              onChange={e => setForm(prev => ({ ...prev, descripcion: e.target.value }))}
              rows={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-teal-400"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setShowForm(false); setForm({ titulo: '', participantes: '', descripcion: '' }) }}
              className="flex-1 border border-gray-200 text-gray-600 text-sm py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleCrear}
              disabled={saving}
              className="flex-1 bg-teal-600 text-white text-sm py-2 rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Creando...' : 'Crear y agregar observaciones'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-400 text-center py-16">Cargando...</p>
      ) : recorridos.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-16">No hay recorridos registrados.</p>
      ) : (
        <div className="space-y-3">
          {recorridos.map(r => (
            <div
              key={r.id}
              onClick={() => navigate(`/recorridos/${r.id}`)}
              className="bg-white border border-gray-200 rounded-xl p-5 cursor-pointer hover:border-teal-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 leading-snug">
                    {r.titulo ?? 'Recorrido sin título'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(r.fecha + 'T12:00:00').toLocaleDateString('es-PE', {
                      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                    })}
                  </p>
                  {r.participantes && (
                    <p className="text-xs text-gray-500 mt-1">{r.participantes}</p>
                  )}
                </div>
                <span className="text-gray-300 text-lg flex-shrink-0">›</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}