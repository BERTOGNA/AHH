import { useCurrent } from '../state'
import { go, useRoute } from '../router'
import { speak } from '../lib/speech'

interface Item {
  icon: string
  label: string
  path: string
  active: boolean
}

/** Barra inferior (celular) ou trilho lateral (tablet paisagem). Perfil de 6 anos: só 3 botões grandes. */
export function Nav() {
  const route = useRoute()
  const me = useCurrent()
  // No Salão (espaço da família) a barra é a completa; nas telas da criança, a versão de 3 botões.
  const kid = me?.role === 'child' && route.name !== 'salao'
  const items: Item[] = [
    ...(me ? [{ icon: '🗺️', label: 'Aventura', path: `/heroi/${me.id}`, active: route.name === 'heroi' }] : []),
    { icon: '🏰', label: 'Salão', path: '/', active: route.name === 'salao' },
    ...(kid ? [] : [{ icon: '📅', label: 'Semana', path: '/semana', active: route.name === 'semana' }]),
    { icon: '🎁', label: 'Baú', path: '/bau', active: route.name === 'bau' },
    ...(kid ? [] : [{ icon: '📜', label: 'Mural', path: '/mural', active: route.name === 'mural' }]),
  ]
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:inset-y-0 lg:left-0 lg:right-auto lg:w-24 lg:border-r lg:border-t-0 lg:pb-0"
    >
      <ul className={`mx-auto flex max-w-xl justify-around lg:h-full lg:flex-col lg:justify-center lg:gap-3 ${kid ? 'py-2' : ''}`}>
        {items.map((it) => (
          <li key={it.path}>
            <button
              onClick={() => {
                if (kid) speak(it.label)
                go(it.path)
              }}
              aria-current={it.active ? 'page' : undefined}
              className={`flex flex-col items-center justify-center rounded-2xl font-semibold transition-colors ${
                kid ? 'h-[88px] w-[88px] text-base' : 'h-[64px] w-[64px] text-[13px] lg:h-[72px] lg:w-[72px]'
              } ${it.active ? 'bg-night text-bg' : 'text-ink hover:bg-wait/60'}`}
            >
              <span aria-hidden="true" className={kid ? 'text-4xl' : 'text-[28px]'}>
                {it.icon}
              </span>
              {it.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
