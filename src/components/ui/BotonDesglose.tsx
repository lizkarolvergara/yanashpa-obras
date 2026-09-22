interface Props {
  abierto: boolean
  onToggle: () => void
}

export default function BotonDesglose({ abierto, onToggle }: Props) {
  return (
    <button
      onClick={onToggle}
      aria-expanded={abierto}
      aria-label={abierto ? 'Ocultar detalle' : 'Ver detalle'}
      className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
    >
      <svg
        width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className={`transition-transform duration-200 ${abierto ? 'rotate-180' : ''}`}
        aria-hidden="true"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </button>
  )
}