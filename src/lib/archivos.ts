import { supabase } from './supabase'

export const BUCKET = 'documentos'
export const BUCKET_DEMO = 'demo'

/**
 * Obtiene bucket y ruta interna a partir de lo guardado en la base,
 * que puede ser una URL pública completa o una ruta.
 */
export function rutaDeArchivo(valor: string): { bucket: string; ruta: string } | null {
  if (!valor || valor.startsWith('blob:')) return null // archivo local del modo demo

  for (const bucket of [BUCKET_DEMO, BUCKET]) {
    const marca = `/${bucket}/`
    if (valor.includes(marca)) {
      const ruta = valor.split(marca)[1]
      return { bucket, ruta: decodeURIComponent(ruta.split('?')[0]) }
    }
  }
  return null
}

interface Opciones {
  /** Segundos de validez del enlace (por defecto 1 hora) */
  segundos?: number
  /** Nombre de archivo para forzar la descarga */
  descargar?: string
}

/**
 * Devuelve una URL utilizable para mostrar o descargar un archivo.
 * Los del bucket demo son públicos; el resto se firman con la sesión activa.
 */
export async function urlVisible(valor: string, opciones: Opciones = {}): Promise<string> {
  const info = rutaDeArchivo(valor)
  if (!info) return valor
  if (info.bucket === BUCKET_DEMO) return valor

  const { data, error } = await supabase.storage
    .from(info.bucket)
    .createSignedUrl(
      info.ruta,
      opciones.segundos ?? 3600,
      opciones.descargar ? { download: opciones.descargar } : undefined
    )

  // Sin sesión no se puede firmar: se devuelve el valor original
  if (error || !data) return valor
  return data.signedUrl
}

/**
 * Decide a qué bucket va un archivo nuevo.
 * Los del proyecto o recorrido de ejemplo van al bucket público `demo`,
 * para que los visitantes puedan verlos sin sesión.
 */
export async function bucketDestino(
  tabla: 'obras' | 'recorridos',
  id: string | null | undefined
): Promise<string> {
  if (!id) return BUCKET
  const { data } = await supabase
    .from(tabla)
    .select('es_demo')
    .eq('id', id)
    .maybeSingle()
  return data?.es_demo ? BUCKET_DEMO : BUCKET
}