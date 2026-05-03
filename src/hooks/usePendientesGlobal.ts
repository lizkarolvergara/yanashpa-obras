import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Pendiente } from '../types'

export function usePendientesGlobal() {
  const [pendientes, setPendientes] = useState<Pendiente[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAll()
  }, [])

  async function fetchAll() {
    setLoading(true)
    const { data } = await supabase
      .from('pendientes')
      .select('*')
      .order('created_at', { ascending: false })
    setPendientes(data ?? [])
    setLoading(false)
  }

  return { pendientes, loading }
}