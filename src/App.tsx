import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import ObrasPage from './pages/obras/ObrasPage'
import PendientesPage from './pages/campo/PendientesPage'
import ChecklistPage from './pages/seguridad/ChecklistPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/obras" replace />} />
          <Route path="obras" element={<ObrasPage />} />
          <Route path="campo" element={<PendientesPage />} />
          <Route path="seguridad" element={<ChecklistPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}