import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { esModoDemo, idDemo, ahoraIso, esIdDemo } from '../lib/demo'
import type { Checklist } from '../types'

export function useChecklist(obraId: string) {
  const [checklists, setChecklists] = useState<Checklist[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch()
  }, [obraId])

  async function fetch() {
    if (esIdDemo(obraId)) { setChecklists([]); setLoading(false); return }
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
    if (await esModoDemo()) {
      const nuevo: Checklist = { ...c, id: idDemo(), created_at: ahoraIso() }
      setChecklists(prev => [nuevo, ...prev])
      return nuevo
    }

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
    if (!(await esModoDemo())) {
      const { error } = await supabase
        .from('checklists')
        .delete()
        .eq('id', id)
      if (error) throw error
    }
    setChecklists(prev => prev.filter(c => c.id !== id))
  }

  return { checklists, loading, createChecklist, deleteChecklist }
}