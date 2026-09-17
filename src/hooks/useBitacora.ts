import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { esModoDemo, idDemo } from '../lib/demo'
import type { BitacoraEntry } from '../types'

export function useBitacora(obraId: string) {
  const [entradas, setEntradas] = useState<BitacoraEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!obraId) return
    fetch()
  }, [obraId])

  async function fetch() {
    setLoading(true)
    const { data } = await supabase
      .from('bitacora')
      .select('*')
      .eq('obra_id', obraId)
      .order('fecha', { ascending: false })
    setEntradas(data ?? [])
    setLoading(false)
  }

  async function createEntrada(entrada: Omit<BitacoraEntry, 'id'>) {
    if (await esModoDemo()) {
      const nueva: BitacoraEntry = { ...entrada, id: idDemo() }
      setEntradas(prev => [nueva, ...prev])
      return nueva
    }

    const { data, error } = await supabase
      .from('bitacora')
      .insert(entrada)
      .select()
      .single()
    if (error) throw error
    setEntradas(prev => [data, ...prev])
    return data
  }

  async function updateEntrada(id: string, contenido: string) {
    if (!(await esModoDemo())) {
      const { error } = await supabase
        .from('bitacora')
        .update({ contenido })
        .eq('id', id)
      if (error) throw error
    }
    setEntradas(prev => prev.map(e => e.id === id ? { ...e, contenido } : e))
  }

  async function deleteEntrada(id: string) {
    if (!(await esModoDemo())) {
      const { error } = await supabase
        .from('bitacora')
        .delete()
        .eq('id', id)
      if (error) throw error
    }
    setEntradas(prev => prev.filter(e => e.id !== id))
  }

  return { entradas, loading, createEntrada, updateEntrada, deleteEntrada }
}