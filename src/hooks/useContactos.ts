import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Contacto } from '../types'

export function useContactos(obraId: string) {
  const [contactos, setContactos] = useState<Contacto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch()
  }, [obraId])

  async function fetch() {
    setLoading(true)
    const { data } = await supabase
      .from('contactos')
      .select('*')
      .eq('obra_id', obraId)
      .order('created_at', { ascending: true })
    setContactos(data ?? [])
    setLoading(false)
  }

  async function createContacto(c: Omit<Contacto, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('contactos')
      .insert(c)
      .select()
      .single()
    if (error) throw error
    setContactos(prev => [...prev, data])
    return data
  }

  async function deleteContacto(id: string) {
    const { error } = await supabase
      .from('contactos')
      .delete()
      .eq('id', id)
    if (error) throw error
    setContactos(prev => prev.filter(c => c.id !== id))
  }

  return { contactos, loading, createContacto, deleteContacto }
}