import { useNavigate } from 'react-router-dom'
import { useObras } from '../../hooks/useObras'
import { usePendientesGlobal } from '../../hooks/usePendientesGlobal'
import { useRecorridos } from '../../hooks/useRecorridos'

function diasRestantes(fechaFin: string): number {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const fin = new Date(fechaFin)
  fin.setHours(0, 0, 0, 0)
  return Math.ceil((fin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
}

function recorridosEstaSemana(recorridos: { fecha: string }[]): number {
  const hoy = new Date()
  const inicioSemana = new Date(hoy)
  inicioSemana.setDate(hoy.getDate() - hoy.getDay())
  inicioSemana.setHours(0, 0, 0, 0)
  return recorridos.filter(r => new Date(r.fecha) >= inicioSemana).length
}

export default function InicioPage() {
  const navigate = useNavigate()
  const { obras, loading: loadingObras } = useObras()
  const { pendientes, loading: loadingPendientes } = usePendientesGlobal()
  const { recorridos, loading: loadingRecorridos } = useRecorridos()

  const loading = loadingObras || loadingPendientes || loadingRecorridos

  // Métricas
  const obrasActivas = obras.filter(o => o.estado === 'activa')
  const pendientesAbiertos = pendientes.filter(p => p.estado === 'abierto')
  const pendientesAlta = pendientesAbiertos.filter(p => p.prioridad === 'alta')
  const recorridosSemana = recorridosEstaSemana(recorridos)
  const obrasPorVencer = obrasActivas.filter(o => {
    const dias = diasRestantes(o.fecha_fin)
    return dias >= 0 && dias <= 7
  })

  // Alertas: pendientes vencidos + obras por vencer
  const pendientesVencidos = pendientesAbiertos.filter(p => {
    if (!p.fecha_limite) return false
    return diasRestantes(p.fecha_limite) < 0
  })

  // Obras activas ordenadas por días restantes (las más urgentes primero)
  const obrasActivasOrdenadas = [...obrasActivas].sort(
    (a, b) => diasRestantes(a.fecha_fin) - diasRestantes(b.fecha_fin)
  ).slice(0, 4)

  const accesos = [
    {
      label: 'Proyectos',
      desc: 'Ver todos los proyectos',
      ruta: '/proyectos',
      bg: 'bg-teal-50',
      iconColor: 'text-teal-600',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/>
          <rect x="14" y="14" width="7" height="7" rx="1"/>
        </svg>
      ),
    },
    {
      label: 'Seguimiento',
      desc: 'Pendientes y bitácora',
      ruta: '/seguimiento',
      bg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 11l3 3L22 4"/>
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
        </svg>
      ),
    },
    {
      label: 'Recorridos',
      desc: 'Campo y observaciones',
      ruta: '/recorridos',
      bg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="10" r="3"/>
          <path d="M12 2a8 8 0 018 8c0 5.25-8 14-8 14S4 15.25 4 10a8 8 0 018-8z"/>
        </svg>
      ),
    },
    {
      label: 'Informes',
      desc: 'Próximamente',
      ruta: '/informes',
      bg: 'bg-purple-50',
      iconColor: 'text-purple-500',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
          <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
        </svg>
      ),
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
        Cargando...
      </div>
    )
  }

  return (
    <div className="space-y-8">

      {/* Encabezado */}
      <div>
        <h1 className="text-xl font-medium text-gray-900">Resumen general</h1>
        <p className="text-sm text-gray-400 mt-0.5">MY Operaciones</p>
      </div>

      {/* Tarjetas de métricas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Proyectos activos</p>
          <p className="text-2xl font-medium text-teal-600">{obrasActivas.length}</p>
          <p className="text-xs text-gray-400 mt-0.5">de {obras.length} en total</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Pendientes abiertos</p>
          <p className={`text-2xl font-medium ${pendientesAbiertos.length > 0 ? 'text-red-500' : 'text-gray-700'}`}>
            {pendientesAbiertos.length}
          </p>
          {pendientesAlta.length > 0 && (
            <p className="text-xs text-red-400 mt-0.5">{pendientesAlta.length} de alta prioridad</p>
          )}
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Recorridos</p>
          <p className="text-2xl font-medium text-gray-700">{recorridosSemana}</p>
          <p className="text-xs text-gray-400 mt-0.5">esta semana</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Vencen pronto</p>
          <p className={`text-2xl font-medium ${obrasPorVencer.length > 0 ? 'text-amber-500' : 'text-gray-700'}`}>
            {obrasPorVencer.length}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">en los próximos 7 días</p>
        </div>
      </div>

      {/* Alertas */}
      {(pendientesVencidos.length > 0 || obrasPorVencer.length > 0) && (
        <div>
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Alertas</h2>
          <div className="space-y-2">
            {pendientesVencidos.map(p => (
              <div
                key={p.id}
                className="bg-red-50 border border-red-100 rounded-lg px-4 py-3 flex items-start gap-3 cursor-pointer hover:bg-red-100 transition-colors"
                onClick={() => navigate(`/seguimiento/${p.obra_id}`)}
              >
                <span className="mt-1.5 w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-800">{p.descripcion}</p>
                  <p className="text-xs text-red-400 mt-0.5">
                    Pendiente vencido hace {Math.abs(diasRestantes(p.fecha_limite!))} día{Math.abs(diasRestantes(p.fecha_limite!)) !== 1 ? 's' : ''}
                    {p.prioridad === 'alta' ? ' · Alta prioridad' : ''}
                  </p>
                </div>
              </div>
            ))}
            {obrasPorVencer.map(o => {
              const dias = diasRestantes(o.fecha_fin)
              return (
                <div
                  key={o.id}
                  className="bg-amber-50 border border-amber-100 rounded-lg px-4 py-3 flex items-start gap-3 cursor-pointer hover:bg-amber-100 transition-colors"
                  onClick={() => navigate(`/proyectos/${o.id}`)}
                >
                  <span className="mt-1.5 w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {o.nombre_corto ?? o.nombre}
                    </p>
                    <p className="text-xs text-amber-500 mt-0.5">
                      Vence {dias === 0 ? 'hoy' : `en ${dias} día${dias !== 1 ? 's' : ''}`}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Acceso rápido */}
      <div>
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Acceso rápido</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {accesos.map(a => (
            <button
              key={a.ruta}
              onClick={() => navigate(a.ruta)}
              className="bg-white border border-gray-200 rounded-xl p-4 text-left hover:bg-gray-50 transition-colors"
            >
              <div className={`w-9 h-9 rounded-lg ${a.bg} ${a.iconColor} flex items-center justify-center mb-3`}>
                {a.icon}
              </div>
              <p className="text-sm font-medium text-gray-800">{a.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{a.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Proyectos activos */}
      {obrasActivasOrdenadas.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Proyectos activos</h2>
            <button
              onClick={() => navigate('/proyectos')}
              className="text-xs text-teal-600 hover:text-teal-700"
            >
              Ver todos →
            </button>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
            {obrasActivasOrdenadas.map(o => {
              const dias = diasRestantes(o.fecha_fin)
              const critico = dias >= 0 && dias <= 7
              const vencido = dias < 0
              return (
                <div
                  key={o.id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors first:rounded-t-xl last:rounded-b-xl"
                  onClick={() => navigate(`/proyectos/${o.id}`)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {o.nombre_corto ?? o.nombre}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{o.contratista}</p>
                  </div>
                  <span className={`text-xs font-medium whitespace-nowrap ${
                    vencido ? 'text-red-500' : critico ? 'text-amber-500' : 'text-gray-400'
                  }`}>
                    {vencido
                      ? `Vencido hace ${Math.abs(dias)}d`
                      : dias === 0
                      ? 'Vence hoy'
                      : `${dias}d restantes`}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

    </div>
  )
}
