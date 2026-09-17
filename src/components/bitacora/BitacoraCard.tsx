import { useState, useRef } from 'react'
import type { BitacoraEntry } from '../../types'
import { comprimirImagen } from '../../lib/comprimirImagen'
import { subirImagen } from '../../lib/storage'

interface Props {
  entrada: BitacoraEntry
  onDelete: (id: string) => void
  onUpdate: (id: string, campos: Partial<Pick<BitacoraEntry, 'contenido' | 'foto_url'>>) => Promise<void>
}

export default function BitacoraCard({ entrada, onDelete, onUpdate }: Props) {
  const fecha = new Date(entrada.fecha)
  const [editando, setEditando] = useState(false)
  const [texto, setTexto] = useState(entrada.contenido)
  const [saving, setSaving] = useState(false)
  const [confirmando, setConfirmando] = useState(false)

  // Foto en edición: la actual (o null si se quitó) y una nueva pendiente de subir
  const [fotoActual, setFotoActual] = useState<string | null>(entrada.foto_url)
  const [fotoNueva, setFotoNueva] = useState<{ file: File; preview: string } | null>(null)
  const inputCamaraRef = useRef<HTMLInputElement>(null)
  const inputGaleriaRef = useRef<HTMLInputElement>(null)

  const fotoVisible = fotoNueva?.preview ?? fotoActual

  function abrirEdicion() {
    setTexto(entrada.contenido)
    setFotoActual(entrada.foto_url)
    setFotoNueva(null)
    setEditando(true)
  }

  function cerrarEdicion() {
    setEditando(false)
    setConfirmando(false)
    setFotoNueva(null)
  }

  function handleSeleccionarFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFotoNueva({ file, preview: URL.createObjectURL(file) })
    e.target.value = ''
  }

  function handleQuitarFoto() {
    setFotoNueva(null)
    setFotoActual(null)
  }

  async function handleGuardar() {
    if (!texto.trim()) return
    setSaving(true)
    try {
      let foto_url = fotoActual
      if (fotoNueva) {
        const blob = await comprimirImagen(fotoNueva.file)
        const subida = await subirImagen(blob, `bitacora/${entrada.obra_id}/${Date.now()}.jpg`)
        if (!subida) throw new Error('No se pudo subir la foto.')
        foto_url = subida
      }
      await onUpdate(entrada.id, { contenido: texto.trim(), foto_url })
      cerrarEdicion()
    } catch (err) {
      console.error(err)
      alert('No se pudo guardar la entrada. Inténtalo de nuevo.')
    } finally {
      setSaving(false)
    }
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
            onClick={abrirEdicion}
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

  // ── Vista edición ─────────────────────────────────────────────────────────
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

      {fotoVisible ? (
        <div className="relative">
          <img
            src={fotoVisible}
            alt="Foto de bitácora"
            className="rounded-lg w-full object-cover max-h-48"
          />
          <button
            onClick={handleQuitarFoto}
            aria-label="Quitar foto"
            className="absolute top-2 right-2 bg-white rounded-full w-6 h-6 flex items-center justify-center text-gray-500 hover:text-red-500 shadow text-sm"
          >
            ×
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            ref={inputCamaraRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleSeleccionarFoto}
            className="hidden"
          />
          <input
            ref={inputGaleriaRef}
            type="file"
            accept="image/*"
            onChange={handleSeleccionarFoto}
            className="hidden"
          />
          <button
            onClick={() => inputCamaraRef.current?.click()}
            className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            📷 Cámara
          </button>
          <button
            onClick={() => inputGaleriaRef.current?.click()}
            className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            🖼 Galería
          </button>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={cerrarEdicion}
          disabled={saving}
          className="flex-1 border border-gray-200 text-gray-600 text-sm py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
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