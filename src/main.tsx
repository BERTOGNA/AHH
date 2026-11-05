import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import { App } from './App'
import { FamilyProvider, SessionProvider } from './state'
import { ErrorBoundary, Trouble } from './components/ErrorBoundary'
import { db } from './db/db'
import { backfillSchoolDay, backfillSteps } from './db/actions'

registerSW({ immediate: true })

function Splash() {
  return (
    <div className="night-sky grid min-h-dvh place-items-center text-ivory">
      <div className="text-center">
        <div className="text-7xl" aria-hidden="true">🏰</div>
        <p className="title-display mt-3 text-xl text-gold-bright">Abrindo os portões…</p>
      </div>
    </div>
  )
}

const root = createRoot(document.getElementById('root')!)
root.render(<Splash />)
// Se o armazenamento não responder (navegador travado/bloqueado), avisa em vez de ficar em branco.
const slow = window.setTimeout(
  () => root.render(<Trouble title="O reino está demorando para abrir" text="O armazenamento do navegador não respondeu. Feche outras abas do Reino da Família e tente de novo." action />),
  10000,
)

// Sem IndexedDB (ex.: navegação privada em alguns navegadores) o app não consegue guardar nada: avisa com calma.
db.open()
  .then(async () => {
    window.clearTimeout(slow)
    await backfillSteps().catch(() => {})
    await backfillSchoolDay().catch(() => {})
  })
  .then(() =>
    root.render(
      <StrictMode>
        <ErrorBoundary>
          <FamilyProvider fallback={<Splash />}>
            <SessionProvider>
              <App />
            </SessionProvider>
          </FamilyProvider>
        </ErrorBoundary>
      </StrictMode>,
    ),
  )
  .catch(() => {
    window.clearTimeout(slow)
    root.render(
      <Trouble
        title="Este navegador não deixa guardar o reino"
        text="Parece uma janela privada ou um navegador com armazenamento bloqueado. Abra o Reino da Família numa janela normal (ou instale-o na tela inicial) para que os dados fiquem salvos no aparelho."
      />,
    )
  })
