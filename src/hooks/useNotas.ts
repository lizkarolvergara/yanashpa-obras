import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { NotaCampo } from '../types'

export function useNotas(obraId: string) {
  const [notas, setNotas] = useState<NotaCampo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch()
  }, [obraId])

  async function fetch() {
    setLoading(true)
    const { data } = await supabase
      .from('notas_campo')
      .select('*')
      .eq('obra_id', obraId)
      .order('fecha', { ascending: false })
    setNotas(data ?? [])
    setLoading(false)
  }

  async function createNota(n: Omit<NotaCampo, 'id'>) {
    const { data, error } = await supabase
      .from('notas_campo')
      .insert(n)
      .select()
      .single()
    if (error) throw error
    setNotas(prev => [data, ...prev])
    return data
  }

  async function deleteNota(id: string) {
    const { error } = await supabase
      .from('notas_campo')
      .delete()
      .eq('id', id)
    if (error) throw error
    setNotas(prev => prev.filter(n => n.id !== id))
  }

  return { notas, loading, createNota, deleteNota }
}