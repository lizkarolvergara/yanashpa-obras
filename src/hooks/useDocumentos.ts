import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { uploadArchivo, deleteArchivo } from '../lib/storage'
import { esModoDemo, idDemo, ahoraIso, esIdDemo } from '../lib/demo'
import type { Documento } from '../types'

type MetaDocumento = { nombre: string; categoria: Documento['categoria']; descripcion: string; version: string }

export function useDocumentos(obraId: string) {
  const [documentos, setDocumentos] = useState<Documento[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch()
  }, [obraId])

  async function fetch() {
    if (esIdDemo(obraId)) { setDocumentos([]); setLoading(false); return }
    setLoading(true)
    const { data } = await supabase
      .from('documentos')
      .select('*')
      .eq('obra_id', obraId)
      .order('created_at', { ascending: false })
    setDocumentos(data ?? [])
    setLoading(false)
  }

  async function uploadDocumento(file: File, meta: MetaDocumento) {
    const archivo_url = await uploadArchivo(file, obraId)
    const fila = {
      obra_id: obraId,
      nombre: meta.nombre || file.name,
      categoria: meta.categoria,
      descripcion: meta.descripcion || null,
      version: meta.version || null,
      archivo_url,
    }

    if (await esModoDemo()) {
      const nuevo: Documento = { ...fila, id: idDemo(), created_at: ahoraIso() }
      setDocumentos(prev => [nuevo, ...prev])
      return nuevo
    }

    const { data, error } = await supabase
      .from('documentos')
      .insert(fila)
      .select()
      .single()
    if (error) throw error
    setDocumentos(prev => [data, ...prev])
    return data
  }

  async function updateDocumento(
    id: string,
    campos: Partial<Pick<Documento, 'nombre' | 'categoria' | 'descripcion' | 'version'>>
  ) {
    if (!(await esModoDemo())) {
      const { error } = await supabase
        .from('documentos')
        .update(campos)
        .eq('id', id)
      if (error) throw error
    }
    setDocumentos(prev => prev.map(d => d.id === id ? { ...d, ...campos } : d))
  }

  async function deleteDocumento(id: string, archivo_url: string) {
    if (!(await esModoDemo())) {
      await deleteArchivo(archivo_url)
      const { error } = await supabase
        .from('documentos')
        .delete()
        .eq('id', id)
      if (error) throw error
    }
    setDocumentos(prev => prev.filter(d => d.id !== id))
  }

  return { documentos, loading, uploadDocumento, updateDocumento, deleteDocumento }
}