import { useState } from 'react'
import { useUrlArchivo } from '../../hooks/useUrlArchivo'
import ModalImagen from './ModalImagen'

interface Props {
  src: string
  alt: string
  className?: string
  /** Si es true, al hacer clic se abre en un modal a pantalla completa */
  ampliable?: boolean
}

export default function ImagenPrivada({ src, alt, className = '', ampliable = false }: Props) {
  const url = useUrlArchivo(src)
  const [abierta, setAbierta] = useState(false)

  if (!url) {
    return <div className={`bg-gray-100 animate-pulse rounded-lg ${className}`} aria-hidden="true" />
  }

  return (
    <>
      <img
        src={url}
        alt={alt}
        className={`${className} ${ampliable ? 'cursor-pointer' : ''}`}
        onClick={ampliable ? () => setAbierta(true) : undefined}
      />
      {abierta && (
        <ModalImagen url={url} alt={alt} onClose={() => setAbierta(false)} />
      )}
    </>
  )
}