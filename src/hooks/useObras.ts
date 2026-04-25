import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Obra } from '../types'

export function useObras() {
  const [obras, setObras] = useState<Obra[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchObras()
  }, [])

  async function fetchObras() {
    setLoading(true)
    const { data, error } = await supabase
      .from('obras')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) setError(error.message)
    else setObras(data ?? [])
    setLoading(false)
  }

  async function createObra(obra: Omit<Obra, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('obras')
      .insert(obra)
      .select()
      .single()

    if (error) throw error
    setObras(prev => [data, ...prev])
    return data
  }

  async function updateObra(id: string, changes: Partial<Obra>) {
    const { data, error } = await supabase
      .from('obras')
      .update(changes)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    setObras(prev => prev.map(o => o.id === id ? data : o))
    return data
  }

  async function deleteObra(id: string) {
    const { error } = await supabase
      .from('obras')
      .delete()
      .eq('id', id)

    if (error) throw error
    setObras(prev => prev.filter(o => o.id !== id))
  }

  return { obras, loading, error, fetchObras, createObra, updateObra, deleteObra }
}