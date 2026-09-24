import { supabase } from './supabase'
import { esModoDemo } from './demo'
import { BUCKET, bucketDestino, rutaDeArchivo } from './archivos'

/** Sube un documento y devuelve su URL. En modo demo devuelve una URL local. */
export async function uploadArchivo(file: File, obraId: string): Promise<string> {
  const ext = file.name.split('.').pop()

  if (await esModoDemo()) {
    // El #archivo.ext permite que DocumentoItem muestre el ícono correcto
    return `${URL.createObjectURL(file)}#archivo.${ext}`
  }

  const bucket = await bucketDestino('obras', obraId)
  const path = `${obraId}/${Date.now()}.${ext}`

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file)

  if (error) throw error

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)

  return data.publicUrl
}

/**
 * Sube una imagen y devuelve su URL (o null si falla).
 * En modo demo devuelve una URL local.
 * `demoDe` indica de qué proyecto o recorrido depende, para elegir el bucket.
 */
export async function subirImagen(
  archivo: Blob,
  path: string,
  demoDe?: { tabla: 'obras' | 'recorridos'; id: string }
): Promise<string | null> {
  if (await esModoDemo()) return URL.createObjectURL(archivo)

  const bucket = demoDe
    ? await bucketDestino(demoDe.tabla, demoDe.id)
    : BUCKET

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, archivo, { upsert: true, contentType: archivo.type || 'image/jpeg' })

  if (error) return null

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

export async function deleteArchivo(url: string) {
  await deleteArchivos([url])
}

export async function deleteArchivos(urls: string[]) {
  if (await esModoDemo()) return

  // Agrupar por bucket, porque cada uno se borra por separado
  const porBucket = new Map<string, string[]>()

  for (const url of urls) {
    const info = rutaDeArchivo(url)
    if (!info) continue
    porBucket.set(info.bucket, [...(porBucket.get(info.bucket) ?? []), info.ruta])
  }

  for (const [bucket, rutas] of porBucket) {
    const { error } = await supabase.storage.from(bucket).remove(rutas)
    if (error) console.error(`No se pudieron borrar archivos de ${bucket}:`, error.message)
  }
}