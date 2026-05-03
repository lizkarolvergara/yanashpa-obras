import { useState } from 'react'
import type { Documento } from '../../types'

interface Props {
  documento: Documento
  onDelete: (id: string, url: string) => void
  onUpdate: (id: string, campos: Partial<Pick<Documento, 'nombre' | 'categoria' | 'descripcion' | 'version'>>) => Promise<void>
}

const categoriaConfig: Record<Documento['categoria'], { label: string; className: string }> = {
  contrato: { label: 'Contrato',  className: 'bg-purple-50 text-purple-700' },
  anexo:    { label: 'Anexo',     className: 'bg-blue-50 text-blue-700' },
  informe:  { label: 'Informe',   className: 'bg-teal-50 text-teal-700' },
  plano:    { label: 'Plano',     className: 'bg-amber-50 text-amber-700' },
  foto:     { label: 'Foto',      className: 'bg-pink-50 text-pink-700' },
  otro:     { label: 'Otro',      className: 'bg-gray-100 text-gray-500' },
}

function getIcono(url: string) {
  const ext = url.split('?')[0].split('.').pop()?.toLowerCase()
  if (['jpg', 'jpeg', 'png', 'webp'].includes(ext ?? '')) return '🖼'
  if (ext === 'pdf') return '📄'
  if (['doc', 'docx'].includes(ext ?? '')) return '📝'
  return '📎'
}

async function descargarArchivo(url: string, nombre: string) {
  const link = document.createElement('a')
  link.href = url
  link.download = nombre
  link.target = '_blank'
  link.rel = 'noopener noreferrer'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export default function DocumentoItem({ documento, onDelete, onUpdate }: Props) {
  const cat = categoriaConfig[documento.categoria]
  const fecha = new Date(documento.created_at).toLocaleDateString('es-PE')
  const [descargando, setDescargando] = useState(false)
  const [editando, setEditando] = useState(false)
  const [confirmando, setConfirmando] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState({
    nombre:     documento.nombre,
    categoria:  documento.categoria,
    descripcion: documento.descripcion ?? '',
    version:    documento.version ?? '',
  })

  async function handleDescargar() {
    setDescargando(true)
    await descargarArchivo(documento.archivo_url, documento.nombre)
    setDescargando(false)
  }

  async function handleGuardar() {
    setSaving(true)
    await onUpdate(documento.id, {
      nombre:      editForm.nombre.trim() || documento.nombre,
      categoria:   editForm.categoria,
      descripcion: editForm.descripcion.trim() || null,
      version:     editForm.version.trim() || null,
    })
    setSaving(false)
    setEditando(false)
    setConfirmando(false)
  }

  // ── Vista normal ──────────────────────────────────────────────────────────
  if (!editando) {
    return (
      <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3">
        <span className="text-2xl flex-shrink-0">{getIcono(documento.archivo_url)}</span>

        {/* nombre + meta — ocupa todo el espacio disponible */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">{documento.nombre}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cat.className}`}>
              {cat.label}
            </span>
            {documento.version && (
              <span className="text-xs text-gray-400">v{documento.version}</span>
            )}
            <span className="text-xs text-gray-400">{fecha}</span>
          </div>
          {documento.descripcion && (
            <p className="text-xs text-gray-400 mt-0.5 truncate">{documento.descripcion}</p>
          )}
        </div>

        {/* botones — en móvil se apilan en columna para no tapar el nombre */}
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => window.open(documento.archivo_url, '_blank')}
            className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Ver
          </button>
          <button
            onClick={handleDescargar}
            disabled={descargando}
            className="text-xs px-3 py-1.5 rounded-lg border border-teal-200 text-teal-600 hover:bg-teal-50 disabled:opacity-50 transition-colors"
          >
            {descargando ? '...' : 'Descargar'}
          </button>
          <button
            onClick={() => setEditando(true)}
            className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Editar
          </button>
        </div>
      </div>
    )
  }

  // ── Vista edición ─────────────────────────────────────────────────────────
  return (
    <div className="bg-white border border-teal-200 rounded-xl px-4 py-4 space-y-3">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Editar documento</p>

      <div>
        <label className="block text-xs text-gray-500 mb-1">Nombre</label>
        <input
          value={editForm.nombre}
          onChange={e => setEditForm(prev => ({ ...prev, nombre: e.target.value }))}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Categoría</label>
          <select
            value={editForm.categoria}
            onChange={e => setEditForm(prev => ({ ...prev, categoria: e.target.value as Documento['categoria'] }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
          >
            <option value="contrato">Contrato</option>
            <option value="anexo">Anexo</option>
            <option value="informe">Informe</option>
            <option value="plano">Plano</option>
            <option value="foto">Foto</option>
            <option value="otro">Otro</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Versión</label>
          <input
            value={editForm.version}
            onChange={e => setEditForm(prev => ({ ...prev, version: e.target.value }))}
            placeholder="Ej: 1.0"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">Descripción</label>
        <input
          value={editForm.descripcion}
          onChange={e => setEditForm(prev => ({ ...prev, descripcion: e.target.value }))}
          placeholder="Descripción opcional"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
        />
      </div>

      {/* Botones acción */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => { setEditando(false); setConfirmando(false) }}
          className="flex-1 border border-gray-200 text-gray-600 text-sm py-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleGuardar}
          disabled={saving || !editForm.nombre.trim()}
          className="flex-1 bg-teal-600 text-white text-sm py-2 rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>

      {/* Zona de eliminar — separada visualmente */}
      <div className="border-t border-gray-100 pt-3">
        {confirmando ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-red-500 flex-1">¿Eliminar este documento?</span>
            <button
              onClick={() => onDelete(documento.id, documento.archivo_url)}
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
            Eliminar documento
          </button>
        )}
      </div>
    </div>
  )
}