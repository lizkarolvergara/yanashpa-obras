import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import ObrasPage from './pages/obras/ObrasPage'
import ObraFormPage from './pages/obras/ObraFormPage'
import ObraDetallePage from './pages/obras/ObraDetallePage'
import PendientesPage from './pages/campo/PendientesPage'
import ChecklistPage from './pages/seguridad/ChecklistPage'

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
          <Route path="campo" element={<PendientesPage />} />
          <Route path="seguridad" element={<ChecklistPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}