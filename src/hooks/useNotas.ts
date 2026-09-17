import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { esModoDemo, idDemo, esIdDemo } from '../lib/demo'
import type { NotaCampo } from '../types'

export function useNotas(obraId: string) {
  const [notas, setNotas] = useState<NotaCampo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch()
  }, [obraId])

  async function fetch() {
    if (esIdDemo(obraId)) { setNotas([]); setLoading(false); return }
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
    if (await esModoDemo()) {
      const nueva: NotaCampo = { ...n, id: idDemo() }
      setNotas(prev => [nueva, ...prev])
      return nueva
    }

    const { data, error } = await supabase
      .from('notas_campo')
      .insert(n)
      .select()
      .single()
    if (error) throw error
    setNotas(prev => [data, ...prev])
    return data
  }

  async function updateNota(id: string, contenido: string) {
    if (!(await esModoDemo())) {
      const { error } = await supabase
        .from('notas_campo')
        .update({ contenido })
        .eq('id', id)
      if (error) throw error
    }
    setNotas(prev => prev.map(n => n.id === id ? { ...n, contenido } : n))
  }

  async function deleteNota(id: string) {
    if (!(await esModoDemo())) {
      const { error } = await supabase
        .from('notas_campo')
        .delete()
        .eq('id', id)
      if (error) throw error
    }
    setNotas(prev => prev.filter(n => n.id !== id))
  }

  return { notas, loading, createNota, updateNota, deleteNota }
}