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
  const ext = url.split('.').pop()?.toLowerCase()
  if (['jpg', 'jpeg', 'png', 'webp'].includes(ext ?? '')) return '🖼'
  if (ext === 'pdf') return '📄'
  if (['doc', 'docx'].includes(ext ?? '')) return '📝'
  return '📎'
}

export default function DocumentoItem({ documento, onDelete }: Props) {
  const cat = categoriaConfig[documento.categoria]
  const fecha = new Date(documento.created_at).toLocaleDateString('es-PE')

  return (
    <div className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl px-4 py-3">
      <span className="text-2xl flex-shrink-0">{getIcono(documento.archivo_url)}</span>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{documento.nombre}</p>
        <div className="flex items-center gap-2 mt-1">
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
        
          href={documento.archivo_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-teal-600 hover:text-teal-700 font-medium"
        <a>
          Ver
        </a>
        <button
          onClick={() => onDelete(documento.id, documento.archivo_url)}
          className="text-gray-300 hover:text-red-400 transition-colors text-lg leading-none"
        >
          ×
        </button>
      </div>
    </div>
  )
}