import { useNavigate } from 'react-router-dom'
import { useObras } from '../../hooks/useObras'
import { useAuth } from '../../context/AuthContext'
import ObraCard from '../../components/obras/ObraCard'
import TarjetasBloqueadas from '../../components/auth/TarjetasBloqueadas'

export default function SeguimientoPage() {
  const navigate = useNavigate()
  const { obras, loading, error } = useObras()
  const { user, loading: authLoading } = useAuth()

  if (loading || authLoading) return (
    <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
      Cargando...
    </div>
  )

  if (error) return (
    <div className="flex items-center justify-center py-20 text-red-500 text-sm">
      Error al cargar proyectos.
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-medium text-gray-900">Seguimiento</h1>
      </div>

      {user && obras.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-16">No hay proyectos registrados.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {obras.map(obra => (
            <ObraCard
              key={obra.id}
              obra={obra}
              onClick={() => navigate(`/seguimiento/${obra.id}`)}
            />
          ))}
          {!user && <TarjetasBloqueadas variante="obra" />}
        </div>
      )}
    </div>
  )
}