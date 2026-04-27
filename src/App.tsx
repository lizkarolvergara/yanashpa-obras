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
          <Route index element={<Navigate to="/obras" replace />} />
          <Route path="obras" element={<ObrasPage />} />
          <Route path="obras/nueva" element={<ObraFormPage />} />
          <Route path="obras/:id" element={<ObraDetallePage />} />
          <Route path="obras/:id/editar" element={<ObraFormPage />} />
          <Route path="campo" element={<PendientesPage />} />
          <Route path="seguridad" element={<ChecklistPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}