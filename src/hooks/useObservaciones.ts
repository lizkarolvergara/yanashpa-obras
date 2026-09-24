import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { esModoDemo, idDemo, ahoraIso, esIdDemo } from '../lib/demo'
import type { ObservacionRecorrido } from '../types'
import { deleteArchivos } from '../lib/storage'

export function useObservaciones(recorridoId: string) {
  const [observaciones, setObservaciones] = useState<ObservacionRecorrido[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!recorridoId) return
    fetch()
  }, [recorridoId])

  async function fetch() {
    if (esIdDemo(recorridoId)) { setObservaciones([]); setLoading(false); return }
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
    if (await esModoDemo()) {
      const nueva: ObservacionRecorrido = { ...obs, id: idDemo(), created_at: ahoraIso() }
      setObservaciones(prev => [...prev, nueva])
      return nueva
    }

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
    if (!(await esModoDemo())) {
      const { error } = await supabase
        .from('observaciones_recorrido')
        .update(changes)
        .eq('id', id)
      if (error) throw error
    }
    setObservaciones(prev => prev.map(o => o.id === id ? { ...o, ...changes } : o))
  }

  async function deleteObservacion(id: string) {
    const anterior = observaciones.find(o => o.id === id)

    if (!(await esModoDemo())) {
      const { error } = await supabase
        .from('observaciones_recorrido')
        .delete()
        .eq('id', id)
      if (error) throw error

      const fotos = [
        ...(anterior?.foto_url ? [anterior.foto_url] : []),
        ...(anterior?.fotos_url ?? []),
      ]
      await deleteArchivos(fotos)
    }
    setObservaciones(prev => prev.filter(o => o.id !== id))
  }

  return { observaciones, loading, createObservacion, updateObservacion, deleteObservacion }
}