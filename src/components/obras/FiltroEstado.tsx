export type Filtro = 'todas' | 'activa' | 'pausada' | 'cerrada'

const opciones: { value: Filtro; label: string }[] = [
  { value: 'todas',   label: 'Todos' },
  { value: 'activa',  label: 'Activos' },
  { value: 'pausada', label: 'Pausados' },
  { value: 'cerrada', label: 'Cerrados' },
]

interface Props {
  valor: Filtro
  onChange: (filtro: Filtro) => void
}

export default function FiltroEstado({ valor, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {opciones.map(o => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
            valor === o.value
              ? 'bg-teal-50 text-teal-700 font-medium'
              : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}