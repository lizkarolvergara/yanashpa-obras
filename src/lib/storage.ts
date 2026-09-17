import { supabase } from './supabase'
import { esModoDemo } from './demo'

/** Sube un documento y devuelve su URL. En modo demo devuelve una URL local. */
export async function uploadArchivo(file: File, obraId: string): Promise<string> {
  const ext = file.name.split('.').pop()

  if (await esModoDemo()) {
    // El #archivo.ext permite que DocumentoItem muestre el ícono correcto
    return `${URL.createObjectURL(file)}#archivo.${ext}`
  }

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

/** Sube una imagen y devuelve su URL (o null si falla). En modo demo devuelve una URL local. */
export async function subirImagen(archivo: Blob, path: string): Promise<string | null> {
  if (await esModoDemo()) return URL.createObjectURL(archivo)

  const { error } = await supabase.storage
    .from('documentos')
    .upload(path, archivo, { upsert: true, contentType: archivo.type || 'image/jpeg' })

  if (error) return null

  const { data } = supabase.storage.from('documentos').getPublicUrl(path)
  return data.publicUrl
}

/** Extrae la ruta interna del bucket a partir de la URL pública */
function rutaDesdeUrl(url: string): string | null {
  const ruta = url.split('/documentos/')[1]
  return ruta ? decodeURIComponent(ruta.split('?')[0]) : null
}

export async function deleteArchivo(url: string) {
  await deleteArchivos([url])
}

export async function deleteArchivos(urls: string[]) {
  if (await esModoDemo()) return

  const rutas = urls
    .map(rutaDesdeUrl)
    .filter((r): r is string => !!r)

  if (rutas.length === 0) return

  const { error } = await supabase.storage.from('documentos').remove(rutas)
  if (error) console.error('No se pudieron borrar algunos archivos:', error.message)
}