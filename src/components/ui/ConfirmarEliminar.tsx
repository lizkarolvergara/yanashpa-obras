import { useState } from 'react'

interface Props {
  /** Pregunta de confirmación, ej: "¿Eliminar este documento?" */
  mensaje: string
  onConfirm: () => void
  /** Texto del botón que abre la confirmación */
  etiqueta?: string
  /** Versión reducida, para cabeceras con varios botones */
  compacto?: boolean
}

export default function ConfirmarEliminar({ mensaje, onConfirm, etiqueta = 'Eliminar', compacto = false }: Props) {
  const [confirmando, setConfirmando] = useState(false)

  if (confirmando) {
    return (
      <div className="flex items-center gap-2">
        <span className={`text-xs text-red-500 ${compacto ? 'hidden sm:inline' : 'flex-1'}`}>
          {mensaje}
        </span>
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
      className={compacto
        ? 'text-xs px-2.5 py-1.5 rounded-lg border border-red-100 text-red-400 hover:bg-red-50 transition-colors'
        : 'text-xs text-red-400 hover:text-red-600 transition-colors'}
    >
      {etiqueta}
    </button>
  )
}