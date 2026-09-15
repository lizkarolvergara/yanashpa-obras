import { useIrALogin } from '../../hooks/useIrALogin'

interface Props {
  variante: 'obra' | 'recorrido'
  cantidad?: number
}

const anchos = ['w-2/3', 'w-1/2', 'w-3/4']

function Candado() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 018 0v4" />
    </svg>
  )
}

function RellenoObra({ i }: { i: number }) {
  return (
    <>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className={`h-4 bg-gray-200 rounded ${anchos[i % 3]}`} />
        <div className="h-5 w-14 bg-teal-100 rounded-full flex-shrink-0" />
      </div>
      <div className="h-3 w-1/2 bg-gray-100 rounded mb-4" />
      <div className="grid grid-cols-2 gap-3">
        {[0, 1, 2, 3].map(j => (
          <div key={j}>
            <div className="h-2.5 w-14 bg-gray-100 rounded mb-1.5" />
            <div className="h-3 w-20 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </>
  )
}

function RellenoRecorrido({ i }: { i: number }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1">
        <div className={`h-4 bg-gray-200 rounded ${anchos[i % 3]}`} />
        <div className="h-3 w-2/5 bg-gray-100 rounded mt-2" />
        <div className="h-3 w-1/3 bg-gray-100 rounded mt-2" />
      </div>
      <span className="text-gray-300 text-lg flex-shrink-0">›</span>
    </div>
  )
}

export default function TarjetasBloqueadas({ variante, cantidad = 3 }: Props) {
  const irALogin = useIrALogin()
  const mensaje = variante === 'obra'
    ? 'Inicia sesión para ver todos los proyectos.'
    : 'Inicia sesión para ver todos los recorridos.'

  return (
    <>
      {Array.from({ length: cantidad }, (_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => irALogin(mensaje)}
          aria-label="Contenido privado. Inicia sesión para verlo."
          className="relative w-full text-left bg-white border border-gray-200 rounded-xl p-5 overflow-hidden hover:border-teal-300 transition-colors"
        >
          <div aria-hidden="true" className="blur-[3px] select-none">
            {variante === 'obra' ? <RellenoObra i={i} /> : <RellenoRecorrido i={i} />}
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="flex items-center gap-1.5 bg-white/90 border border-gray-200 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-full shadow-sm">
              <Candado />
              Requiere inicio de sesión
            </span>
          </div>
        </button>
      ))}
    </>
  )
}