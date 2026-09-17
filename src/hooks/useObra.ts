import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { aplicarCambiosDemo, buscarCreadoDemo, esIdDemo } from '../lib/demo'
import type { Obra } from '../types'

export function useObra(id: string) {
  const [obra, setObra] = useState<Obra | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetch() {
      setLoading(true)
      setError(null)

      // Formulario de nuevo proyecto: no hay nada que cargar
      if (!id) {
        setObra(null)
        setLoading(false)
        return
      }

      // Proyecto creado en modo demo: vive en memoria
      if (esIdDemo(id)) {
        const creada = buscarCreadoDemo<Obra>('obras', id)
        setObra(creada)
        if (!creada) setError('Proyecto no encontrado.')
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('obras')
        .select('*')
        .eq('id', id)
        .single()

      if (error) setError(error.message)
      else setObra(data ? aplicarCambiosDemo('obras', data) : null)
      setLoading(false)
    }
    fetch()
  }, [id])

  return { obra, loading, error }
}