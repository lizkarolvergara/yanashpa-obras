import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Recorrido } from '../types'

export function useRecorridos() {
  const [recorridos, setRecorridos] = useState<Recorrido[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch()
  }, [])

  async function fetch() {
    setLoading(true)
    const { data } = await supabase
      .from('recorridos')
      .select('*')
      .order('created_at', { ascending: false })
    setRecorridos(data ?? [])
    setLoading(false)
  }

  async function createRecorrido(r: Omit<Recorrido, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('recorridos')
      .insert(r)
      .select()
      .single()
    if (error) throw error
    setRecorridos(prev => [data, ...prev])
    return data
  }

  async function updateRecorrido(id: string, changes: Partial<Omit<Recorrido, 'id' | 'created_at'>>) {
    const { data, error } = await supabase
      .from('recorridos')
      .update(changes)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    setRecorridos(prev => prev.map(r => r.id === id ? data : r))
    return data
  }

  async function deleteRecorrido(id: string) {
    const { error } = await supabase
      .from('recorridos')
      .delete()
      .eq('id', id)
    if (error) throw error
    setRecorridos(prev => prev.filter(r => r.id !== id))
  }

  return { recorridos, loading, createRecorrido, updateRecorrido, deleteRecorrido }
}