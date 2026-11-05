// Convite de instalação do PWA. O navegador dispara `beforeinstallprompt` (Chrome/Edge/Android);
// no iPhone/iPad não existe: mostramos as instruções do "Adicionar à Tela de Início".
import { useSyncExternalStore } from 'react'

interface InstallEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

let deferred: InstallEvent | null = null
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferred = e as InstallEvent
    emit()
  })
  window.addEventListener('appinstalled', () => {
    deferred = null
    emit()
  })
}

export const isStandalone = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia?.('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true)

export const isIOS = () => typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

export type InstallState = 'installed' | 'prompt' | 'ios' | 'unavailable'

function state(): InstallState {
  if (isStandalone()) return 'installed'
  if (deferred) return 'prompt'
  if (isIOS()) return 'ios'
  return 'unavailable'
}

export function useInstall() {
  const s = useSyncExternalStore((cb) => (listeners.add(cb), () => listeners.delete(cb)), state, () => 'unavailable' as InstallState)
  async function install(): Promise<boolean> {
    if (!deferred) return false
    await deferred.prompt()
    const { outcome } = await deferred.userChoice
    deferred = null
    emit()
    return outcome === 'accepted'
  }
  return { state: s, install }
}
