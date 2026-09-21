import { useRef } from 'react'

interface Props {
  onSelect: (file: File) => void
  disabled?: boolean
}

function IconoCamara() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  )
}

function IconoGaleria() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  )
}

const claseBoton = 'inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors'

export default function SelectorFoto({ onSelect, disabled = false }: Props) {
  const camaraRef = useRef<HTMLInputElement>(null)
  const galeriaRef = useRef<HTMLInputElement>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) onSelect(file)
    // Permite volver a elegir la misma foto
    e.target.value = ''
  }

  return (
    <div className="flex gap-2 flex-wrap">
      <input ref={camaraRef} type="file" accept="image/*" capture="environment" onChange={handleChange} className="hidden" />
      <input ref={galeriaRef} type="file" accept="image/*" onChange={handleChange} className="hidden" />
      <button type="button" onClick={() => camaraRef.current?.click()} disabled={disabled} className={claseBoton}>
        <IconoCamara />
        Cámara
      </button>
      <button type="button" onClick={() => galeriaRef.current?.click()} disabled={disabled} className={claseBoton}>
        <IconoGaleria />
        Galería
      </button>
    </div>
  )
}