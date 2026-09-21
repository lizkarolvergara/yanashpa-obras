import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { esModoDemo, idDemo, ahoraIso, esIdDemo } from '../lib/demo'
import type { Auditoria } from '../types'

export function useAuditorias(obraId: string) {
  const [auditorias, setAuditorias] = useState<Auditoria[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch()
  }, [obraId])

  async function fetch() {
    if (esIdDemo(obraId)) { setAuditorias([]); setLoading(false); return }
    setLoading(true)
    const { data } = await supabase
      .from('auditorias')
      .select('*')
      .eq('obra_id', obraId)
      .order('fecha_auditoria', { ascending: false })
    setAuditorias(data ?? [])
    setLoading(false)
  }

  async function createAuditoria(a: Omit<Auditoria, 'id' | 'created_at'>) {
    if (await esModoDemo()) {
      const nueva: Auditoria = { ...a, id: idDemo(), created_at: ahoraIso() }
      setAuditorias(prev => [nueva, ...prev])
      return nueva
    }

    const { data, error } = await supabase
      .from('auditorias')
      .insert(a)
      .select()
      .single()
    if (error) throw error
    setAuditorias(prev => [data, ...prev])
    return data
  }

  async function deleteAuditoria(id: string) {
    if (!(await esModoDemo())) {
      const { error } = await supabase
        .from('auditorias')
        .delete()
        .eq('id', id)
      if (error) throw error
    }
    setAuditorias(prev => prev.filter(a => a.id !== id))
  }

  return { auditorias, loading, createAuditoria, deleteAuditoria }
}