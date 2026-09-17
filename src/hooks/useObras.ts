import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { deleteArchivos } from '../lib/storage'
import {
  esModoDemo, esIdDemo, idDemo, ahoraIso,
  guardarCambioDemo, aplicarCambiosDemo,
  crearDemo, listarCreadosDemo, eliminarCreadoDemo,
} from '../lib/demo'
import type { Obra } from '../types'

export function useObras() {
  const [obras, setObras] = useState<Obra[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchObras()
  }, [])

  async function fetchObras() {
    setLoading(true)
    const { data, error } = await supabase
      .from('obras')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) setError(error.message)
    else setObras([
      ...listarCreadosDemo<Obra>('obras'),
      ...(data ?? []).map(o => aplicarCambiosDemo('obras', o)),
    ])
    setLoading(false)
  }

  async function createObra(obra: Omit<Obra, 'id' | 'created_at'>) {
    if (await esModoDemo()) {
      const nueva = crearDemo<Obra>('obras', {
        ...obra,
        id: idDemo(),
        created_at: ahoraIso(),
        es_demo: true,
      })
      setObras(prev => [nueva, ...prev])
      return nueva
    }

    const { data, error } = await supabase
      .from('obras')
      .insert(obra)
      .select()
      .single()

    if (error) throw error
    setObras(prev => [data, ...prev])
    return data
  }

  async function updateObra(id: string, changes: Partial<Obra>) {
    if (await esModoDemo()) {
      guardarCambioDemo('obras', id, changes)
      const actual = obras.find(o => o.id === id)
      const actualizada = { ...actual, ...changes } as Obra
      setObras(prev => prev.map(o => o.id === id ? { ...o, ...changes } : o))
      return actualizada
    }

    const { data, error } = await supabase
      .from('obras')
      .update(changes)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    setObras(prev => prev.map(o => o.id === id ? data : o))
    return data
  }

  async function deleteObra(id: string) {
    if (await esModoDemo()) {
      if (!esIdDemo(id)) throw new Error('El proyecto de ejemplo no se puede eliminar.')
      eliminarCreadoDemo('obras', id)
      setObras(prev => prev.filter(o => o.id !== id))
      return
    }

    // 1. Reunir los archivos antes de borrar (la cascada elimina las filas)
    const [docs, bitacora, notas, checklists] = await Promise.all([
      supabase.from('documentos').select('archivo_url').eq('obra_id', id),
      supabase.from('bitacora').select('foto_url').eq('obra_id', id),
      supabase.from('notas_campo').select('foto_url').eq('obra_id', id),
      supabase.from('checklists').select('fotos_url').eq('obra_id', id),
    ])

    const urls: string[] = [
      ...(docs.data ?? []).map(d => d.archivo_url),
      ...(bitacora.data ?? []).map(b => b.foto_url),
      ...(notas.data ?? []).map(n => n.foto_url),
      ...(checklists.data ?? []).flatMap(c => c.fotos_url ?? []),
    ].filter((u): u is string => !!u)

    // 2. Borrar el proyecto (y en cascada sus tablas hijas)
    const { data, error } = await supabase
      .from('obras')
      .delete()
      .eq('id', id)
      .select('id')

    if (error) throw error
    if (!data || data.length === 0) {
      throw new Error('No se pudo eliminar el proyecto. Verifica que tu sesión siga activa.')
    }

    setObras(prev => prev.filter(o => o.id !== id))

    // 3. Borrar los archivos de Storage (si falla, solo quedan archivos huérfanos)
    await deleteArchivos(urls)
  }

  return { obras, loading, error, fetchObras, createObra, updateObra, deleteObra }
}