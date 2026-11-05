import { useEffect } from 'react'
import { useRoute, go } from './router'
import { useFamily, useSession } from './state'
import { Nav } from './components/Nav'
import { PinPad } from './components/PinPad'
import { CelebrationOverlay, Toasts } from './components/Overlays'
import { Kingdom } from './screens/Kingdom'
import { Adventure } from './screens/Adventure'
import { CharacterSheet } from './screens/CharacterSheet'
import { Week } from './screens/Week'
import { Chest } from './screens/Chest'
import { Mural } from './screens/Mural'
import { Parents } from './screens/Parents'
import { Welcome } from './screens/Welcome'

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
        <Welcome />
        <Toasts />
      </>
    )
  }

  return (
    <>
      {route.name === 'salao' && <Kingdom />}
      {route.name === 'heroi' && <Adventure id={route.id} />}
      {route.name === 'ficha' && <CharacterSheet id={route.id} />}
      {route.name === 'semana' && <Week />}
      {route.name === 'bau' && <Chest />}
      {route.name === 'mural' && <Mural />}
      {route.name === 'pais' && <Parents tab={route.tab} />}
      <Nav />
      {pinRequest && <PinPad />}
      <CelebrationOverlay />
      <Toasts />
    </>
  )
}
