/**
 * Las columnas tipo `date` llegan como 'YYYY-MM-DD'. Si se pasan directo a
 * new Date(), el navegador las interpreta como UTC y en Perú muestra el día
 * anterior. Usamos el mediodía para evitarlo.
 */
export function fechaLocal(iso: string): Date {
  return new Date(iso + 'T12:00:00')
}

/** Días calendario entre hoy y la fecha indicada (negativo si ya pasó) */
export function diasRestantes(iso: string): number {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const fin = fechaLocal(iso)
  fin.setHours(0, 0, 0, 0)
  return Math.round((fin.getTime() - hoy.getTime()) / 86400000)
}

/** Hoy en formato 'YYYY-MM-DD' según la hora local */
export function fechaHoy(): string {
  const d = new Date()
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mes}-${dia}`
}