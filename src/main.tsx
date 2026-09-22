import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'

// Actualización automática de la PWA
const actualizarSW = registerSW({
  immediate: true,
  onRegisteredSW(_url, registration) {
    if (!registration) return

    // Revisa si hay versión nueva al volver a la app y cada hora
    const revisar = () => { if (document.visibilityState === 'visible') registration.update() }
    document.addEventListener('visibilitychange', revisar)
    setInterval(revisar, 60 * 60 * 1000)
  },
})

// Cuando la versión nueva toma el control, recarga al volver a la app
// (no en medio de una edición)
if ('serviceWorker' in navigator) {
  let pendiente = false
  let recargando = false

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    pendiente = true
    if (document.visibilityState !== 'visible') aplicar()
  })

  function aplicar() {
    if (!pendiente || recargando) return
    recargando = true
    window.location.reload()
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') aplicar()
  })
}

void actualizarSW

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)