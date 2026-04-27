import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Obra } from '../types'

export function useObra(id: string) {
  const [obra, setObra] = useState<Obra | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetch() {
      setLoading(true)
      const { data, error } = await supabase
        .from('obras')
        .select('*')
        .eq('id', id)
        .single()

      if (error) setError(error.message)
      else setObra(data)
      setLoading(false)
    }
    fetch()
  }, [id])

  return { obra, loading, error }
}