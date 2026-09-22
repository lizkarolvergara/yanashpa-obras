import { useState, useEffect } from 'react'
import { urlVisible } from '../lib/archivos'

export function useUrlArchivo(valor: string | null | undefined) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!valor) {
      setUrl(null)
      return
    }
    let vigente = true
    urlVisible(valor).then(u => { if (vigente) setUrl(u) })
    return () => { vigente = false }
  }, [valor])

  return url
}