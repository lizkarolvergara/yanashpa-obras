import { useState } from 'react'

interface Props {
  /** Pregunta de confirmación, ej: "¿Eliminar este documento?" */
  mensaje: string
  onConfirm: () => void
  /** Texto del botón que abre la confirmación */
  etiqueta?: string
}

export default function ConfirmarEliminar({ mensaje, onConfirm, etiqueta = 'Eliminar' }: Props) {
  const [confirmando, setConfirmando] = useState(false)

  if (confirmando) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-red-500 flex-1">{mensaje}</span>
        <button
          onClick={onConfirm}
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
    )
  }

  return (
    <button
      onClick={() => setConfirmando(true)}
      className="text-xs text-red-400 hover:text-red-600 transition-colors"
    >
      {etiqueta}
    </button>
  )
}