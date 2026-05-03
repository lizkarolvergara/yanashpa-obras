import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Pendiente } from '../types'

export function usePendientes(obraId: string) {
  const [pendientes, setPendientes] = useState<Pendiente[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPendientes()
  }, [obraId])

  async function fetchPendientes() {
    setLoading(true)
    const { data } = await supabase
      .from('pendientes')
      .select('*')
      .eq('obra_id', obraId)
      .order('created_at', { ascending: false })
    setPendientes(data ?? [])
    setLoading(false)
  }

  async function createPendiente(p: Omit<Pendiente, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('pendientes')
      .insert(p)
      .select()
      .single()
    if (error) throw error
    setPendientes(prev => [data, ...prev])
    return data
  }

  async function toggleEstado(id: string, estado: 'abierto' | 'resuelto') {
    const { data, error } = await supabase
      .from('pendientes')
      .update({ estado })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    setPendientes(prev => prev.map(p => p.id === id ? data : p))
  }

  async function updatePendiente(
    id: string,
    campos: Partial<Pick<Pendiente, 'descripcion' | 'responsable' | 'fecha_limite' | 'prioridad'>>
  ) {
    const { data, error } = await supabase
      .from('pendientes')
      .update(campos)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    setPendientes(prev => prev.map(p => p.id === id ? data : p))
  }

  async function deletePendiente(id: string) {
    const { error } = await supabase
      .from('pendientes')
      .delete()
      .eq('id', id)
    if (error) throw error
    setPendientes(prev => prev.filter(p => p.id !== id))
  }

  return { pendientes, loading, createPendiente, toggleEstado, updatePendiente, deletePendiente }
}