// Roteador mínimo por hash: funciona offline e em qualquer hospedagem estática.
import { useSyncExternalStore } from 'react'

export type Route =
  | { name: 'salao' }
  | { name: 'heroi'; id: string }
  | { name: 'ficha'; id: string }
  | { name: 'semana' }
  | { name: 'quadro' }
  | { name: 'bau' }
  | { name: 'mural'; chronicle?: boolean }
  | { name: 'pais'; tab?: string }
  | { name: 'bem-vindo' }

export function parse(hash: string): Route {
  const [a, b] = hash.replace(/^#\/?/, '').split('/')
  switch (a) {
    case 'semana':
    case 'quadro':
    case 'bau':
    case 'bem-vindo':
      return { name: a }
    case 'mural':
      return { name: 'mural', chronicle: b === 'cronica' }
    case 'pais':
      return { name: 'pais', tab: b }
    case 'heroi':
    case 'ficha':
      if (b) return { name: a, id: decodeURIComponent(b) }
  }
  return { name: 'salao' }
}

const subscribe = (cb: () => void) => {
  window.addEventListener('hashchange', cb)
  return () => window.removeEventListener('hashchange', cb)
}

export const useRoute = () => parse(useSyncExternalStore(subscribe, () => location.hash))

export function go(path: string) {
  location.hash = path
  window.scrollTo({ top: 0 })
}
