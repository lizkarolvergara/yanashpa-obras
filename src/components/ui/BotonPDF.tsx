interface Props {
  onClick: () => void
  generando?: boolean
  disabled?: boolean
  /** 'sm' para tarjetas, 'md' para cabeceras de página */
  tamano?: 'sm' | 'md'
}

export default function BotonPDF({ onClick, generando = false, disabled = false, tamano = 'sm' }: Props) {
  const clase = tamano === 'sm'
    ? 'inline-flex items-center gap-1 text-xs px-2.5 py-1.5'
    : 'inline-flex items-center gap-1.5 text-sm px-4 py-2'

  return (
    <button
      onClick={onClick}
      disabled={disabled || generando}
      className={`${clase} rounded-lg border border-teal-200 text-teal-600 hover:bg-teal-50 disabled:opacity-40 transition-colors`}
    >
      <svg width={tamano === 'sm' ? 13 : 15} height={tamano === 'sm' ? 13 : 15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
      </svg>
      {generando ? 'Generando...' : 'PDF'}
    </button>
  )
}