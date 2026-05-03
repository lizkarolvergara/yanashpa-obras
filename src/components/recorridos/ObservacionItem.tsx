import { useState, useRef } from 'react'
import type { ObservacionRecorrido } from '../../types'
import { supabase } from '../../lib/supabase'

interface Props {
  observacion: ObservacionRecorrido
  numero: number
  onDelete: (id: string) => void
  onUpdate: (id: string, changes: Partial<Pick<ObservacionRecorrido, 'descripcion' | 'area_zona' | 'foto_url' | 'fotos_url'>>) => Promise<void>
}

export default function ObservacionItem({ observacion, numero, onDelete, onUpdate }: Props) {
  const [editando, setEditando] = useState(false)
  const [confirmando, setConfirmando] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingFoto, setUploadingFoto] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Combinar foto_url legacy + fotos_url array para mostrar todas
  const todasLasFotos: string[] = [
    ...(observacion.foto_url ? [observacion.foto_url] : []),
    ...(observacion.fotos_url ?? []),
  ]

  const [editForm, setEditForm] = useState({
    descripcion: observacion.descripcion,
    area_zona:   observacion.area_zona ?? '',
  })
  // Fotos editables
  const [fotosEdit, setFotosEdit] = useState<string[]>([
    ...(observacion.foto_url ? [observacion.foto_url] : []),
    ...(observacion.fotos_url ?? []),
  ])

  async function handleAgregarFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingFoto(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `observaciones/${observacion.recorrido_id}/${observacion.id}_${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('documentos')
        .upload(path, file, { upsert: true })
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('documentos').getPublicUrl(path)
        setFotosEdit(prev => [...prev, urlData.publicUrl])
      }
    } finally {
      setUploadingFoto(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function handleEliminarFoto(url: string) {
    // Solo elimina del array local — no borra del storage para no perder datos
    setFotosEdit(prev => prev.filter(f => f !== url))
  }

  async function handleGuardar() {
    if (!editForm.descripcion.trim()) return
    setSaving(true)
    const [primeraFoto, ...restoFotos] = fotosEdit
    await onUpdate(observacion.id, {
      descripcion: editForm.descripcion.trim(),
      area_zona:   editForm.area_zona.trim() || null,
      foto_url:    primeraFoto ?? null,
      fotos_url:   restoFotos,
    })
    setSaving(false)
    setEditando(false)
    setConfirmando(false)
  }

  // ── Vista normal ──────────────────────────────────────────────────────────
  if (!editando) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs flex items-center justify-center flex-shrink-0 font-medium">
              {numero}
            </span>
            {observacion.area_zona && (
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                {observacion.area_zona}
              </span>
            )}
          </div>
          <button
            onClick={() => {
              setEditForm({ descripcion: observacion.descripcion, area_zona: observacion.area_zona ?? '' })
              setFotosEdit([
                ...(observacion.foto_url ? [observacion.foto_url] : []),
                ...(observacion.fotos_url ?? []),
              ])
              setEditando(true)
            }}
            className="text-xs text-teal-600 hover:text-teal-700 font-medium flex-shrink-0"
          >
            Editar
          </button>
        </div>

        <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap ml-8">
          {observacion.descripcion}
        </p>

        {/* Fotos — grid si hay más de una */}
        {todasLasFotos.length > 0 && (
          <div className={`mt-3 ${todasLasFotos.length > 1 ? 'grid grid-cols-2 gap-2' : ''}`}>
            {todasLasFotos.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`Foto ${i + 1}`}
                className="rounded-lg w-full object-cover max-h-48 cursor-pointer"
                onClick={() => window.open(url, '_blank')}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  // ── Vista edición ─────────────────────────────────────────────────────────
  return (
    <div className="bg-white border border-teal-200 rounded-xl p-4 space-y-3">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Editar observación {numero}</p>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Área / Zona</label>
        <input
          value={editForm.area_zona}
          onChange={e => setEditForm(prev => ({ ...prev, area_zona: e.target.value }))}
          placeholder="Ej: Piscina, Área verde, Fachada..."
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Descripción *</label>
        <textarea
          value={editForm.descripcion}
          onChange={e => setEditForm(prev => ({ ...prev, descripcion: e.target.value }))}
          rows={3}
          className="w-full text-sm text-gray-800 border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-teal-400"
        />
      </div>

      {/* Fotos existentes con opción de eliminar */}
      {fotosEdit.length > 0 && (
        <div>
          <label className="block text-xs text-gray-400 mb-2">Fotos</label>
          <div className="space-y-2">
            {fotosEdit.map((url, i) => (
              <div key={i} className="relative">
                <img
                  src={url}
                  alt={`Foto ${i + 1}`}
                  className="rounded-lg w-full object-cover max-h-40"
                />
                <button
                  onClick={() => handleEliminarFoto(url)}
                  className="absolute top-2 right-2 bg-white rounded-full w-6 h-6 flex items-center justify-center text-gray-500 hover:text-red-500 shadow text-sm"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agregar fotos */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleAgregarFoto}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingFoto}
          className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          {uploadingFoto ? 'Subiendo...' : '+ Agregar foto'}
        </button>
      </div>

      <div className="flex gap-2">
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
            <span className="text-xs text-red-500 flex-1">¿Eliminar esta observación?</span>
            <button
              onClick={() => onDelete(observacion.id)}
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
            Eliminar observación
          </button>
        )}
      </div>
    </div>
  )
}
