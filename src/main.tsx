import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import { App } from './App'
import { FamilyProvider, SessionProvider } from './state'

registerSW({ immediate: true })

function Splash() {
  return (
    <div className="night-sky grid min-h-dvh place-items-center text-bg">
      <div className="text-center">
        <div className="text-7xl" aria-hidden="true">🏰</div>
        <p className="title-display mt-3 text-xl text-gold-bright">Abrindo os portões…</p>
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FamilyProvider fallback={<Splash />}>
      <SessionProvider>
        <App />
      </SessionProvider>
    </FamilyProvider>
  </StrictMode>,
)
