import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { esModoDemo, idDemo, ahoraIso, esIdDemo } from '../lib/demo'
import type { Pendiente } from '../types'

export function usePendientes(obraId: string) {
  const [pendientes, setPendientes] = useState<Pendiente[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPendientes()
  }, [obraId])

  async function fetchPendientes() {
    if (esIdDemo(obraId)) { setPendientes([]); setLoading(false); return }
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
    if (await esModoDemo()) {
      const nuevo: Pendiente = { ...p, id: idDemo(), created_at: ahoraIso() }
      setPendientes(prev => [nuevo, ...prev])
      return nuevo
    }

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
    if (await esModoDemo()) {
      setPendientes(prev => prev.map(p => p.id === id ? { ...p, estado } : p))
      return
    }

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
    if (await esModoDemo()) {
      setPendientes(prev => prev.map(p => p.id === id ? { ...p, ...campos } : p))
      return
    }

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
    if (!(await esModoDemo())) {
      const { error } = await supabase
        .from('pendientes')
        .delete()
        .eq('id', id)
      if (error) throw error
    }
    setPendientes(prev => prev.filter(p => p.id !== id))
  }

  return { pendientes, loading, createPendiente, toggleEstado, updatePendiente, deletePendiente }
}