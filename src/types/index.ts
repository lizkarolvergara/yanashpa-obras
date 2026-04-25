export interface Obra {
  id: string
  nombre: string
  contratista: string
  tipo: 'obra_civil' | 'servicio'
  monto: number | null
  fecha_inicio: string
  fecha_fin: string
  estado: 'activa' | 'pausada' | 'cerrada'
  ubicacion: string | null
  descripcion: string | null
  nro_contrato: string | null
  notas: string | null
  created_at: string
}

export interface Documento {
  id: string
  obra_id: string
  nombre: string
  categoria: 'contrato' | 'anexo' | 'informe' | 'plano' | 'foto' | 'otro'
  archivo_url: string
  descripcion: string | null
  version: string | null
  created_at: string
}

export interface Pendiente {
  id: string
  obra_id: string
  descripcion: string
  estado: 'abierto' | 'resuelto'
  fecha_limite: string | null
  responsable: string | null
  prioridad: 'alta' | 'media' | 'baja'
  created_at: string
}

export interface NotaCampo {
  id: string
  obra_id: string
  contenido: string
  foto_url: string | null
  fecha: string
}

export interface Checklist {
  id: string
  obra_id: string
  fecha_inspeccion: string
  respuestas: Record<string, 'ok' | 'observado' | 'na'>
  estado_general: 'ok' | 'observado' | 'critico'
  observaciones: string | null
  fotos_url: string[] | null
  created_at: string
}