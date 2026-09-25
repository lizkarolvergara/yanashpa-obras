import { useEffect } from 'react'

interface Props {
  url: string
  alt: string
  onClose: () => void
}

export default function ModalImagen({ url, alt, onClose }: Props) {
  // Cerrar con Escape y bloquear el scroll del fondo
  useEffect(() => {
    function handleTecla(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleTecla)
    const overflowPrevio = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleTecla)
      document.body.style.overflow = overflowPrevio
    }
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-[aparecer_150ms_ease-out]"
    >
      <button
        onClick={onClose}
        aria-label="Cerrar"
        className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>

      <img
        src={url}
        alt={alt}
        onClick={e => e.stopPropagation()}
        className="max-w-full max-h-full object-contain rounded-lg"
      />
    </div>
  )
}