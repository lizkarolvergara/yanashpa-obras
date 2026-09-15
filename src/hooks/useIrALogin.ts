import { useNavigate, useLocation } from 'react-router-dom'

export function useIrALogin() {
  const navigate = useNavigate()
  const location = useLocation()

  return (mensaje: string, from?: string) =>
    navigate('/login', { state: { mensaje, from: from ?? location.pathname } })
}