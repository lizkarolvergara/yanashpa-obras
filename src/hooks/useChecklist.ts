import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Checklist } from '../types'

export function useChecklist(obraId: string) {
  const [checklists, setChecklists] = useState<Checklist[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch()
  }, [obraId])

  async function fetch() {
    setLoading(true)
    const { data } = await supabase
      .from('checklists')
      .select('*')
      .eq('obra_id', obraId)
      .order('fecha_inspeccion', { ascending: false })
    setChecklists(data ?? [])
    setLoading(false)
  }

  async function createChecklist(c: Omit<Checklist, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('checklists')
      .insert(c)
      .select()
      .single()
    if (error) throw error
    setChecklists(prev => [data, ...prev])
    return data
  }

  async function deleteChecklist(id: string) {
    const { error } = await supabase
      .from('checklists')
      .delete()
      .eq('id', id)
    if (error) throw error
    setChecklists(prev => prev.filter(c => c.id !== id))
  }

return { checklists, loading, createChecklist, deleteChecklist }
  return { checklists, loading, createChecklist, deleteChecklist }
}