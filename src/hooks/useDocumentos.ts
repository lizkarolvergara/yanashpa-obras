import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { uploadArchivo, deleteArchivo } from '../lib/storage'
import type { Documento } from '../types'

export function useDocumentos(obraId: string) {
  const [documentos, setDocumentos] = useState<Documento[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch()
  }, [obraId])

  async function fetch() {
    setLoading(true)
    const { data } = await supabase
      .from('documentos')
      .select('*')
      .eq('obra_id', obraId)
      .order('created_at', { ascending: false })
    setDocumentos(data ?? [])
    setLoading(false)
  }

  async function uploadDocumento(
    file: File,
    meta: { nombre: string; categoria: Documento['categoria']; descripcion: string; version: string }
  ) {
    const archivo_url = await uploadArchivo(file, obraId)
    const { data, error } = await supabase
      .from('documentos')
      .insert({
        obra_id: obraId,
        nombre: meta.nombre || file.name,
        categoria: meta.categoria,
        descripcion: meta.descripcion || null,
        version: meta.version || null,
        archivo_url,
      })
      .select()
      .single()
    if (error) throw error
    setDocumentos(prev => [data, ...prev])
    return data
  }

  async function deleteDocumento(id: string, archivo_url: string) {
    await deleteArchivo(archivo_url)
    const { error } = await supabase
      .from('documentos')
      .delete()
      .eq('id', id)
    if (error) throw error
    setDocumentos(prev => prev.filter(d => d.id !== id))
  }

  return { documentos, loading, uploadDocumento, deleteDocumento }
}