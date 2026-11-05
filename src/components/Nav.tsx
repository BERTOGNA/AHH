import { useCurrent } from '../state'
import { go, useRoute } from '../router'
import { speak } from '../lib/speech'
import { Icon, type IconName } from './Icon'

interface Item {
  icon: IconName
  label: string
  path: string
  active: boolean
}

/** Moldura de navegação em índigo (barra inferior no celular, trilho lateral no tablet). 6 anos: 3 botões grandes. */
export function Nav() {
  const route = useRoute()
  const me = useCurrent()
  // No Salão (espaço da família) a barra é a completa; nas telas da criança, a versão de 3 botões.
  const kid = me?.role === 'child' && route.name !== 'salao'
  const items: Item[] = [
    ...(me ? [{ icon: 'map' as IconName, label: 'Aventura', path: `/heroi/${me.id}`, active: route.name === 'heroi' }] : []),
    { icon: 'castle', label: 'Salão', path: '/', active: route.name === 'salao' },
    ...(kid ? [] : [{ icon: 'calendar' as IconName, label: 'Semana', path: '/semana', active: route.name === 'semana' }]),
    { icon: 'chest', label: 'Baú', path: '/bau', active: route.name === 'bau' },
    ...(kid ? [] : [{ icon: 'scroll' as IconName, label: 'Mural', path: '/mural', active: route.name === 'mural' }]),
  ]
  return (
    <nav
      aria-label="Navegação principal"
      className="on-night fixed inset-x-0 bottom-0 z-40 border-t border-gold-light/15 bg-[#12163a]/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_rgba(15,18,48,0.25)] backdrop-blur-md lg:inset-y-0 lg:left-0 lg:right-auto lg:w-24 lg:border-r lg:border-t-0 lg:pb-0 lg:shadow-[8px_0_30px_rgba(15,18,48,0.2)]"
    >
      <div className="hidden lg:absolute lg:inset-x-0 lg:top-6 lg:flex lg:justify-center" aria-hidden="true">
        <img src="./icon.svg" alt="" width={44} height={44} className="rounded-xl ring-1 ring-gold-light/30" />
      </div>
      <ul className={`mx-auto flex max-w-xl justify-around px-1 lg:h-full lg:flex-col lg:justify-center lg:gap-2 ${kid ? 'py-2' : 'py-1'}`}>
        {items.map((it) => (
          <li key={it.path}>
            <button
              onClick={() => {
                if (kid) speak(it.label)
                go(it.path)
              }}
              aria-current={it.active ? 'page' : undefined}
              className={`relative flex flex-col items-center justify-center gap-1 rounded-2xl font-semibold transition-colors ${
                kid ? 'h-[88px] w-[96px] text-base' : 'h-[64px] w-[68px] text-[12px] lg:h-[68px] lg:w-[72px]'
              } ${it.active ? 'text-gold-light' : 'text-moon hover:text-ivory'}`}
            >
              {it.active && (
                <span className="absolute inset-1 rounded-2xl bg-gradient-to-b from-white/[0.12] to-white/[0.03] ring-1 ring-gold-light/35" aria-hidden="true" />
              )}
              <Icon name={it.icon} size={kid ? 40 : 26} strokeWidth={it.active ? 2 : 1.75} className="relative" />
              <span className="relative">{it.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
