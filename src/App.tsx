import { lazy, Suspense, useEffect } from 'react'
import { useRoute, go } from './router'
import { useFamily, useSession } from './state'
import { Nav } from './components/Nav'
import { PinPad } from './components/PinPad'
import { CelebrationOverlay, Toasts } from './components/Overlays'
import { Kingdom } from './screens/Kingdom'
import { Adventure } from './screens/Adventure'
// Salão e Aventura carregam já; as demais telas vêm em pedaços (todos ficam no cache offline).
const CharacterSheet = lazy(() => import('./screens/CharacterSheet').then((m) => ({ default: m.CharacterSheet })))
const Week = lazy(() => import('./screens/Week').then((m) => ({ default: m.Week })))
const Chest = lazy(() => import('./screens/Chest').then((m) => ({ default: m.Chest })))
const Mural = lazy(() => import('./screens/Mural').then((m) => ({ default: m.Mural })))
const Parents = lazy(() => import('./screens/Parents').then((m) => ({ default: m.Parents })))
const Welcome = lazy(() => import('./screens/Welcome').then((m) => ({ default: m.Welcome })))

function Loading() {
  return <div className="grid min-h-[60dvh] place-items-center" aria-busy="true"><span className="sr-only">Carregando…</span></div>
}

export function App() {
  const route = useRoute()
  const { settings } = useFamily()
  const { pinRequest } = useSession()

  // Sem família cadastrada → assistente de boas-vindas.
  useEffect(() => {
    if (!settings.onboardingDone && route.name !== 'bem-vindo') go('/bem-vindo')
  }, [settings.onboardingDone, route.name])

  if (route.name === 'bem-vindo' || !settings.onboardingDone) {
    return (
      <>
        <Suspense fallback={<Loading />}>
          <Welcome />
        </Suspense>
        <Toasts />
      </>
    )
  }

  return (
    <>
      <Suspense fallback={<Loading />}>
      {route.name === 'salao' && <Kingdom />}
      {route.name === 'heroi' && <Adventure id={route.id} />}
      {route.name === 'ficha' && <CharacterSheet id={route.id} />}
      {route.name === 'semana' && <Week />}
      {route.name === 'bau' && <Chest />}
      {route.name === 'mural' && <Mural chronicle={route.chronicle} />}
      {route.name === 'pais' && <Parents tab={route.tab} />}
      </Suspense>
      <Nav />
      {pinRequest && <PinPad />}
      <CelebrationOverlay />
      <Toasts />
    </>
  )
}
