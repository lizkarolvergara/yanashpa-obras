import { supabase } from './supabase'

// AuthContext la mantiene actualizada; así no consultamos la sesión en cada guardado
let sesionActiva: boolean | null = null

// Datos del demo en memoria: se mantienen al navegar y se borran al recargar
type TablaDemo = 'obras' | 'recorridos'
const cambiosDemo = new Map<string, Record<string, unknown>>()
const creadosDemo: Record<TablaDemo, Array<{ id: string }>> = { obras: [], recorridos: [] }

export function setSesionActiva(activa: boolean) {
  sesionActiva = activa
  if (activa) {
    cambiosDemo.clear()
    creadosDemo.obras = []
    creadosDemo.recorridos = []
  }
}

/** Sin sesión = modo demo: nada se escribe en Supabase */
export async function esModoDemo(): Promise<boolean> {
  if (sesionActiva !== null) return !sesionActiva
  const { data } = await supabase.auth.getSession()
  return !data.session
}

/** Id temporal para registros creados en modo demo */
export function idDemo(): string {
  return `demo-${crypto.randomUUID()}`
}

export function esIdDemo(id: string | undefined | null): boolean {
  return !!id && id.startsWith('demo-')
}

export function ahoraIso(): string {
  return new Date().toISOString()
}

// ── Cambios sobre filas existentes ────────────────────────────────────────────

export function guardarCambioDemo(tabla: TablaDemo, id: string, cambios: object) {
  const clave = `${tabla}:${id}`
  cambiosDemo.set(clave, { ...cambiosDemo.get(clave), ...cambios })
}

export function aplicarCambiosDemo<T extends { id: string }>(tabla: TablaDemo, fila: T): T {
  const cambios = cambiosDemo.get(`${tabla}:${fila.id}`)
  return cambios ? { ...fila, ...cambios } : fila
}

// ── Filas creadas en modo demo ────────────────────────────────────────────────

export function crearDemo<T extends { id: string }>(tabla: TablaDemo, fila: T): T {
  creadosDemo[tabla] = [fila, ...creadosDemo[tabla]]
  return fila
}

export function listarCreadosDemo<T extends { id: string }>(tabla: TablaDemo): T[] {
  return (creadosDemo[tabla] as T[]).map(f => aplicarCambiosDemo(tabla, f))
}

export function buscarCreadoDemo<T extends { id: string }>(tabla: TablaDemo, id: string): T | null {
  const fila = (creadosDemo[tabla] as T[]).find(f => f.id === id)
  return fila ? aplicarCambiosDemo(tabla, fila) : null
}

export function eliminarCreadoDemo(tabla: TablaDemo, id: string) {
  creadosDemo[tabla] = creadosDemo[tabla].filter(f => f.id !== id)
  cambiosDemo.delete(`${tabla}:${id}`)
}