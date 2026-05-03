import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useObras } from '../../hooks/useObras'
import { useObra } from '../../hooks/useObra'

const camposVacios = {
  nombre_corto: '',
  nombre: '',
  contratista: '',
  tipo: 'obra_civil' as 'obra_civil' | 'mantenimiento' | 'jardineria' | 'carpinteria',
  monto: '',
  fecha_inicio: '',
  plazo_dias: '',   // nuevo campo UI — no se persiste en BD
  fecha_fin: '',
  estado: 'activa' as 'activa' | 'pausada' | 'cerrada',
  ubicacion: '',
  descripcion: '',
  ruc: '',
}

/** Suma N días calendario a una fecha ISO (YYYY-MM-DD) */
function sumarDias(fechaIso: string, dias: number): string {
  const d = new Date(fechaIso + 'T00:00:00')
  d.setDate(d.getDate() + dias)
  return d.toISOString().split('T')[0]
}

/** Diferencia en días calendarios entre dos fechas ISO */
function difDias(inicio: string, fin: string): number {
  const a = new Date(inicio + 'T00:00:00')
  const b = new Date(fin + 'T00:00:00')
  return Math.round((b.getTime() - a.getTime()) / 86400000)
}

export default function ObraFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const esEdicion = !!id

  const { createObra, updateObra } = useObras()
  const { obra, loading } = useObra(esEdicion ? id! : '')

  const [form, setForm] = useState(camposVacios)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (esEdicion && obra) {
      const plazo = obra.fecha_inicio && obra.fecha_fin
        ? difDias(obra.fecha_inicio, obra.fecha_fin).toString()
        : ''
      setForm({
        nombre_corto: obra.nombre_corto ?? '',
        nombre:      obra.nombre,
        contratista: obra.contratista,
        tipo:        obra.tipo,
        monto:       obra.monto?.toString() ?? '',
        fecha_inicio: obra.fecha_inicio,
        plazo_dias:  plazo,
        fecha_fin:   obra.fecha_fin,
        estado:      obra.estado,
        ubicacion:   obra.ubicacion ?? '',
        descripcion: obra.descripcion ?? '',
        ruc:         obra.ruc ?? '',
      })
    }
  }, [obra])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target

    setForm(prev => {
      const next = { ...prev, [name]: value }

      // Si cambia fecha_inicio y hay plazo → recalcula fecha_fin
      if (name === 'fecha_inicio' && next.plazo_dias && parseInt(next.plazo_dias) > 0) {
        next.fecha_fin = sumarDias(value, parseInt(next.plazo_dias))
      }

      // Si cambia plazo_dias y hay fecha_inicio → recalcula fecha_fin
      if (name === 'plazo_dias' && next.fecha_inicio && parseInt(value) > 0) {
        next.fecha_fin = sumarDias(next.fecha_inicio, parseInt(value))
      }

      // Si cambia fecha_fin manualmente → recalcula plazo si hay fecha_inicio
      if (name === 'fecha_fin' && next.fecha_inicio && value) {
        const dias = difDias(next.fecha_inicio, value)
        next.plazo_dias = dias > 0 ? dias.toString() : ''
      }

      return next
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const payload = {
        nombre_corto: form.nombre_corto.trim() || null,
        nombre:      form.nombre,
        contratista: form.contratista,
        tipo:        form.tipo,
        monto:       form.monto ? parseFloat(form.monto) : null,
        fecha_inicio: form.fecha_inicio,
        fecha_fin:   form.fecha_fin,
        estado:      form.estado,
        ubicacion:   form.ubicacion || null,
        descripcion: form.descripcion || null,
        ruc:         form.ruc || null,
      }
      if (esEdicion) {
        await updateObra(id!, payload)
        navigate(`/proyectos/${id}`)
      } else {
        await createObra(payload)
        navigate('/proyectos')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (esEdicion && loading) return (
    <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
      Cargando...
    </div>
  )

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(esEdicion ? `/proyectos/${id}` : '/proyectos')}
          className="text-gray-400 hover:text-gray-600 text-sm"
        >
          ← Volver
        </button>
        <h1 className="text-xl font-medium text-gray-900">
          {esEdicion ? 'Editar proyecto' : 'Nuevo proyecto'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm text-gray-600 mb-1.5">Alias</label>
          <input
            name="nombre_corto"
            value={form.nombre_corto}
            onChange={handleChange}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
            placeholder="Ej: Mantenimiento de techo clubhouse"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1.5">Nombre contractual *</label>
          <input
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            required
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
            placeholder="Ej: SERVICIO DE CONSTRUCCIÓN DE CERCO PERIMÉTRICO..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1.5">Contratista *</label>
            <input
              name="contratista"
              value={form.contratista}
              onChange={handleChange}
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
              placeholder="Nombre o razón social"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1.5">RUC</label>
            <input
              name="ruc"
              value={form.ruc}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
              placeholder="20xxxxxxxxx"
              maxLength={11}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1.5">Tipo *</label>
            <select
              name="tipo"
              value={form.tipo}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
            >
              <option value="obra_civil">Obra civil</option>
              <option value="mantenimiento">Mantenimiento</option>
              <option value="jardineria">Jardinería</option>
              <option value="carpinteria">Carpintería</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1.5">Estado *</label>
            <select
              name="estado"
              value={form.estado}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
            >
              <option value="activa">Activo</option>
              <option value="pausada">Pausado</option>
              <option value="cerrada">Cerrado</option>
            </select>
          </div>
        </div>

        {/* Fechas + plazo */}
        <div>
          <p className="text-sm text-gray-600 mb-2">Plazo contractual *</p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Fecha de inicio</label>
              <input
                type="date"
                name="fecha_inicio"
                value={form.fecha_inicio}
                onChange={handleChange}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Plazo (días cal.)</label>
              <input
                type="number"
                name="plazo_dias"
                value={form.plazo_dias}
                onChange={handleChange}
                min="1"
                placeholder="Ej: 90"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Fecha de fin</label>
              <input
                type="date"
                name="fecha_fin"
                value={form.fecha_fin}
                onChange={handleChange}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
              />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-1.5">
            Ingresa fecha de inicio y plazo para calcular automáticamente la fecha de fin, o edita cualquier campo manualmente.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1.5">Monto contractual (S/.)</label>
            <input
              type="number"
              name="monto"
              value={form.monto}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1.5">Ubicación</label>
            <input
              name="ubicacion"
              value={form.ubicacion}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
              placeholder="Ej: Yanashpa Village"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1.5">Descripción del alcance</label>
          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400 resize-none"
            placeholder="Describe brevemente el alcance contractual..."
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(esEdicion ? `/proyectos/${id}` : '/proyectos')}
            className="flex-1 border border-gray-200 text-gray-600 text-sm py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-teal-600 text-white text-sm py-2.5 rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Guardar proyecto'}
          </button>
        </div>

      </form>
    </div>
  )
}
