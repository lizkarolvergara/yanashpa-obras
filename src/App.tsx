import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import ObrasPage from './pages/obras/ObrasPage'
import ObraFormPage from './pages/obras/ObraFormPage'
import PendientesPage from './pages/campo/PendientesPage'
import ChecklistPage from './pages/seguridad/ChecklistPage'
import ObraDetallePage from './pages/obras/ObraDetallePage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/obras" replace />} />
          <Route path="obras" element={<ObrasPage />} />
          <Route path="obras/nueva" element={<ObraFormPage />} />
          <Route path="campo" element={<PendientesPage />} />
          <Route path="seguridad" element={<ChecklistPage />} />
          <Route path="obras/:id" element={<ObraDetallePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}