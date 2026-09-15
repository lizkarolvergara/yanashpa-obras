import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRecorridos } from '../../hooks/useRecorridos'
import { useAuth } from '../../context/AuthContext'
import { useIrALogin } from '../../hooks/useIrALogin'
import TarjetasBloqueadas from '../../components/auth/TarjetasBloqueadas'

/** Fecha local de hoy en formato YYYY-MM-DD (evita el desfase UTC) */
function fechaHoy() {
  const d = new Date()
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mes}-${dia}`
}

const formVacio = { titulo: '', participantes: '', descripcion: '' }

export default function RecorridosPage() {
  const navigate = useNavigate()
  const { recorridos, loading, createRecorrido } = useRecorridos()
  const { user, loading: authLoading } = useAuth()
  const irALogin = useIrALogin()
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(formVacio)

  function handleNuevo() {
    if (user) setShowForm(true)
    else irALogin('Inicia sesión para crear un recorrido.')
  }

  async function handleCrear() {
    setSaving(true)
    try {
      const nuevo = await createRecorrido({
        fecha:         fechaHoy(),
        titulo:        form.titulo.trim() || null,
        participantes: form.participantes.trim() || null,
        descripcion:   form.descripcion.trim() || null,
      })
      setShowForm(false)
      setForm(formVacio)
      navigate(`/recorridos/${nuevo.id}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-medium text-gray-900">Recorridos</h1>
        {!showForm && (
          <button
            onClick={handleNuevo}
            className="bg-teal-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
          >
            + Nuevo recorrido
          </button>
        )}
      </div>

      {showForm && user && (
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
              onClick={() => { setShowForm(false); setForm(formVacio) }}
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

      {loading || authLoading ? (
        <p className="text-sm text-gray-400 text-center py-16">Cargando...</p>
      ) : user && recorridos.length === 0 ? (
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
          {!user && <TarjetasBloqueadas variante="recorrido" />}
        </div>
      )}
    </div>
  )
}