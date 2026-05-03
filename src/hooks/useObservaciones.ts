import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { ObservacionRecorrido } from '../types'

export function useObservaciones(recorridoId: string) {
  const [observaciones, setObservaciones] = useState<ObservacionRecorrido[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!recorridoId) return
    fetch()
  }, [recorridoId])

  async function fetch() {
    setLoading(true)
    const { data } = await supabase
      .from('observaciones_recorrido')
      .select('*')
      .eq('recorrido_id', recorridoId)
      .order('orden', { ascending: true })
    setObservaciones(data ?? [])
    setLoading(false)
  }

  async function createObservacion(obs: Omit<ObservacionRecorrido, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('observaciones_recorrido')
      .insert(obs)
      .select()
      .single()
    if (error) throw error
    setObservaciones(prev => [...prev, data])
    return data
  }

  async function updateObservacion(
    id: string,
    changes: Partial<Pick<ObservacionRecorrido, 'descripcion' | 'area_zona' | 'foto_url' | 'fotos_url'>>
  ) {
    const { error } = await supabase
      .from('observaciones_recorrido')
      .update(changes)
      .eq('id', id)
    if (error) throw error
    setObservaciones(prev => prev.map(o => o.id === id ? { ...o, ...changes } : o))
  }

  async function deleteObservacion(id: string) {
    const { error } = await supabase
      .from('observaciones_recorrido')
      .delete()
      .eq('id', id)
    if (error) throw error
    setObservaciones(prev => prev.filter(o => o.id !== id))
  }

  return { observaciones, loading, createObservacion, updateObservacion, deleteObservacion }
}