import { useUrlArchivo } from '../../hooks/useUrlArchivo'
import { urlVisible } from '../../lib/archivos'

interface Props {
  src: string
  alt: string
  className?: string
  /** Si es true, al hacer clic abre la imagen en otra pestaña */
  ampliable?: boolean
}

export default function ImagenPrivada({ src, alt, className = '', ampliable = false }: Props) {
  const url = useUrlArchivo(src)

  async function handleClick() {
    if (!ampliable) return
    // Se abre la pestaña antes del await para que Safari no la bloquee
    const ventana = window.open('', '_blank')
    const destino = await urlVisible(src, { segundos: 300 })
    if (ventana) ventana.location.href = destino
  }

  if (!url) {
    return <div className={`bg-gray-100 animate-pulse rounded-lg ${className}`} aria-hidden="true" />
  }

  return (
    <img
      src={url}
      alt={alt}
      className={`${className} ${ampliable ? 'cursor-pointer' : ''}`}
      onClick={ampliable ? handleClick : undefined}
    />
  )
}