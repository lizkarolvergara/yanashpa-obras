import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { deleteArchivo } from '../lib/storage'
import { esModoDemo, idDemo, esIdDemo } from '../lib/demo'
import type { BitacoraEntry } from '../types'

export function useBitacora(obraId: string) {
  const [entradas, setEntradas] = useState<BitacoraEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!obraId) return
    fetch()
  }, [obraId])

  async function fetch() {
    if (esIdDemo(obraId)) { setEntradas([]); setLoading(false); return }
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

  async function updateEntrada(
    id: string,
    campos: Partial<Pick<BitacoraEntry, 'contenido' | 'foto_url'>>
  ) {
    const anterior = entradas.find(e => e.id === id)

    if (!(await esModoDemo())) {
      const { error } = await supabase
        .from('bitacora')
        .update(campos)
        .eq('id', id)
      if (error) throw error

      // Si la foto se quitó o se reemplazó, borrar la anterior de Storage
      const fotoAnterior = anterior?.foto_url
      if (fotoAnterior && 'foto_url' in campos && campos.foto_url !== fotoAnterior) {
        await deleteArchivo(fotoAnterior)
      }
    }
    setEntradas(prev => prev.map(e => e.id === id ? { ...e, ...campos } : e))
  }

  async function deleteEntrada(id: string) {
    const anterior = entradas.find(e => e.id === id)

    if (!(await esModoDemo())) {
      const { error } = await supabase
        .from('bitacora')
        .delete()
        .eq('id', id)
      if (error) throw error
      if (anterior?.foto_url) await deleteArchivo(anterior.foto_url)
    }
    setEntradas(prev => prev.filter(e => e.id !== id))
  }

  return { entradas, loading, createEntrada, updateEntrada, deleteEntrada }
}