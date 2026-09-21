import { useNavigate } from 'react-router-dom'

interface Props {
  to: string
  label: string
}

export default function BotonVolver({ to, label }: Props) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate(to)}
      className="inline-flex items-center gap-1.5 mb-3 text-sm text-gray-400 hover:text-gray-600 transition-colors"
    >
      <svg
        width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
      {label}
    </button>
  )
}