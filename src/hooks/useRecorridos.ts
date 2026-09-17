import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import {
  esModoDemo, esIdDemo, idDemo, ahoraIso,
  guardarCambioDemo, aplicarCambiosDemo,
  crearDemo, listarCreadosDemo, eliminarCreadoDemo,
} from '../lib/demo'
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
    setRecorridos([
      ...listarCreadosDemo<Recorrido>('recorridos'),
      ...(data ?? []).map(r => aplicarCambiosDemo('recorridos', r)),
    ])
    setLoading(false)
  }

  async function createRecorrido(r: Omit<Recorrido, 'id' | 'created_at'>) {
    if (await esModoDemo()) {
      const nuevo = crearDemo<Recorrido>('recorridos', {
        ...r,
        id: idDemo(),
        created_at: ahoraIso(),
        es_demo: true,
      })
      setRecorridos(prev => [nuevo, ...prev])
      return nuevo
    }

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
    if (await esModoDemo()) {
      guardarCambioDemo('recorridos', id, changes)
      const actual = recorridos.find(r => r.id === id)
      const actualizado = { ...actual, ...changes } as Recorrido
      setRecorridos(prev => prev.map(r => r.id === id ? { ...r, ...changes } : r))
      return actualizado
    }

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
    if (await esModoDemo()) {
      if (!esIdDemo(id)) throw new Error('El recorrido de ejemplo no se puede eliminar.')
      eliminarCreadoDemo('recorridos', id)
      setRecorridos(prev => prev.filter(r => r.id !== id))
      return
    }

    const { error } = await supabase
      .from('recorridos')
      .delete()
      .eq('id', id)
    if (error) throw error
    setRecorridos(prev => prev.filter(r => r.id !== id))
  }

  return { recorridos, loading, createRecorrido, updateRecorrido, deleteRecorrido }
}