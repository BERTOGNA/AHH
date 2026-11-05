import type { ReactNode } from 'react'
import { useCurrent, useSession } from '../state'
import { go } from '../router'
import { Avatar } from './Avatar'
import { Icon } from './Icon'

interface Props {
  title: string
  subtitle?: ReactNode
  children: ReactNode
  actions?: ReactNode
  hideTitle?: boolean
  hideMe?: boolean
}

/** Moldura padrão das telas: cabeçalho com título e avatar do perfil ativo (→ Ficha). */
export function Screen({ title, subtitle, children, actions, hideTitle, hideMe }: Props) {
  const me = useCurrent()
  const { adultId, lock } = useSession()
  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-[calc(104px+env(safe-area-inset-bottom))] pt-4 sm:px-6 lg:pb-10 lg:pl-32">
      <header className="mb-5 flex flex-wrap items-center gap-3">
        <div className="min-w-[13rem] flex-1">
          <h1 className={`title-display text-[28px] leading-tight sm:text-4xl ${hideTitle ? 'sr-only' : ''}`}>{title}</h1>
          {subtitle && <div className="text-muted">{subtitle}</div>}
        </div>
        {actions}
        {adultId && (
          <button className="btn btn-ghost h-12 min-w-12 px-3 text-sm" onClick={lock} aria-label="Sair do modo pais">
            <Icon name="unlock" size={18} /> <span className="hidden sm:inline">Sair do modo pais</span>
          </button>
        )}
        {me && !hideMe && (
          <button onClick={() => go(`/ficha/${me.id}`)} aria-label={`Ficha de ${me.name}`} className="rounded-full">
            <Avatar member={me} size={me.role === 'child' ? 64 : 56} />
          </button>
        )}
      </header>
      {children}
    </main>
  )
}

export function Section({ title, children, aside }: { title: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <section className="mb-6">
      <div className="mb-3 flex items-center gap-3">
        <h2 className="title-display text-[21px]">{title}</h2>
        <span className="h-px flex-1 bg-gradient-to-r from-line to-transparent" aria-hidden="true" />
        {aside}
      </div>
      {children}
    </section>
  )
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="story rounded-[20px] border border-dashed border-[#d6c7a8] bg-surface/50 p-6 text-center text-[17px] text-muted">{children}</p>
}
