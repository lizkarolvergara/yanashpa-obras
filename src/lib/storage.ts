import { supabase } from './supabase'

export async function uploadArchivo(file: File, obraId: string): Promise<string> {
  const ext = file.name.split('.').pop()
  const path = `${obraId}/${Date.now()}.${ext}`

  const { error } = await supabase.storage
    .from('documentos')
    .upload(path, file)

  if (error) throw error

  const { data } = supabase.storage
    .from('documentos')
    .getPublicUrl(path)

  return data.publicUrl
}

export async function deleteArchivo(url: string) {
  const path = url.split('/documentos/')[1]
  if (!path) return
  await supabase.storage.from('documentos').remove([path])
}