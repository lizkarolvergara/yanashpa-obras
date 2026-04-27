import type { NotaCampo } from '../../types'

interface Props {
  nota: NotaCampo
  onDelete: (id: string) => void
}

export default function NotaCard({ nota, onDelete }: Props) {
  const fecha = new Date(nota.fecha)

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
          onClick={() => onDelete(nota.id)}
          className="text-gray-300 hover:text-red-400 transition-colors text-lg leading-none flex-shrink-0"
        >
          ×
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