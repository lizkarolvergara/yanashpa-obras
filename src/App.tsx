import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import ObrasPage from './pages/obras/ObrasPage'
import ObraFormPage from './pages/obras/ObraFormPage'
import ObraDetallePage from './pages/obras/ObraDetallePage'
import SeguimientoPage from './pages/seguimiento/SeguimientoPage'
import SeguimientoDetallePage from './pages/seguimiento/SeguimientoDetallePage'
import RecorridosPage from './pages/recorridos/RecorridosPage'
import RecorridoDetallePage from './pages/recorridos/RecorridoDetallePage'
import InformesPage from './pages/informes/InformesPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/proyectos" replace />} />
          <Route path="proyectos" element={<ObrasPage />} />
          <Route path="proyectos/nuevo" element={<ObraFormPage />} />
          <Route path="proyectos/:id" element={<ObraDetallePage />} />
          <Route path="proyectos/:id/editar" element={<ObraFormPage />} />
          <Route path="seguimiento" element={<SeguimientoPage />} />
          <Route path="seguimiento/:id" element={<SeguimientoDetallePage />} />
          <Route path="recorridos" element={<RecorridosPage />} />
          <Route path="recorridos/:id" element={<RecorridoDetallePage />} />
          <Route path="informes" element={<InformesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}