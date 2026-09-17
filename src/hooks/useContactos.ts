import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { esModoDemo, idDemo, ahoraIso } from '../lib/demo'
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
    if (await esModoDemo()) {
      const nuevo: Contacto = { ...c, id: idDemo(), created_at: ahoraIso() }
      setContactos(prev => [...prev, nuevo])
      return nuevo
    }

    const { data, error } = await supabase
      .from('contactos')
      .insert(c)
      .select()
      .single()
    if (error) throw error
    setContactos(prev => [...prev, data])
    return data
  }

  async function updateContacto(
    id: string,
    campos: Partial<Pick<Contacto, 'nombre' | 'cargo' | 'telefono' | 'email'>>
  ) {
    if (!(await esModoDemo())) {
      const { error } = await supabase
        .from('contactos')
        .update(campos)
        .eq('id', id)
      if (error) throw error
    }
    setContactos(prev => prev.map(c => c.id === id ? { ...c, ...campos } : c))
  }

  async function deleteContacto(id: string) {
    if (!(await esModoDemo())) {
      const { error } = await supabase
        .from('contactos')
        .delete()
        .eq('id', id)
      if (error) throw error
    }
    setContactos(prev => prev.filter(c => c.id !== id))
  }

  return { contactos, loading, createContacto, updateContacto, deleteContacto }
}