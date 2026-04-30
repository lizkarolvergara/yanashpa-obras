import { useState } from 'react'
import type { Documento } from '../../types'

interface Props {
  documento: Documento
  onDelete: (id: string, url: string) => void
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
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    const blobUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = nombre
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(blobUrl)
  } catch {
    window.open(url, '_blank')
  }
}

export default function DocumentoItem({ documento, onDelete }: Props) {
  const cat = categoriaConfig[documento.categoria]
  const fecha = new Date(documento.created_at).toLocaleDateString('es-PE')
  const [confirmando, setConfirmando] = useState(false)
  const [descargando, setDescargando] = useState(false)

  async function handleDescargar() {
    setDescargando(true)
    await descargarArchivo(documento.archivo_url, documento.nombre)
    setDescargando(false)
  }

  return (
    <div className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl px-4 py-3">
      <span className="text-2xl flex-shrink-0">{getIcono(documento.archivo_url)}</span>

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

      <div className="flex items-center gap-2 flex-shrink-0">
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
        {confirmando ? (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onDelete(documento.id, documento.archivo_url)}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
            >
              Eliminar
            </button>
            <button
              onClick={() => setConfirmando(false)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
            >
              No
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmando(true)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-red-100 text-red-400 hover:bg-red-50 transition-colors"
          >
            Eliminar
          </button>
        )}
      </div>
    </div>
  )
}