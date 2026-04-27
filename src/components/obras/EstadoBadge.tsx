interface Props {
  estado: 'activa' | 'pausada' | 'cerrada'
}

const config = {
  activa:  { label: 'Activa',  className: 'bg-teal-50 text-teal-700' },
  pausada: { label: 'Pausada', className: 'bg-amber-50 text-amber-700' },
  cerrada: { label: 'Cerrada', className: 'bg-gray-100 text-gray-500' },
}

export default function EstadoBadge({ estado }: Props) {
  const { label, className } = config[estado]
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${className}`}>
      {label}
    </span>
  )
}