import { useState } from 'react'
import { useInstall } from '../lib/install'
import { Icon } from './Icon'

/** Cartão "Instalar no aparelho": abre o convite nativo ou explica o caminho no iPhone/iPad. */
export function InstallCard({ night }: { night?: boolean }) {
  const { state, install } = useInstall()
  const [help, setHelp] = useState(false)
  if (state === 'installed' || state === 'unavailable') return null
  return (
    <div className={`${night ? 'panel-night' : 'card'} flex flex-wrap items-center gap-3 p-4 text-left`}>
      <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${night ? 'bg-white/10 text-gold-light' : 'bg-wait text-gold-deep'}`}>
        <Icon name="download" size={24} />
      </span>
      <p className="min-w-[180px] flex-1">
        <b>Instale o reino no aparelho.</b>{' '}
        <span className={night ? 'text-moon' : 'text-muted'}>Abre como um app, em tela cheia, e funciona sem internet.</span>
      </p>
      {state === 'prompt' ? (
        <button className="btn btn-primary" onClick={() => void install()}>Instalar</button>
      ) : (
        <button className={night ? 'btn btn-ghost' : 'btn btn-secondary'} onClick={() => setHelp((v) => !v)} aria-expanded={help}>
          Como instalar
        </button>
      )}
      {help && (
        <ol className={`basis-full list-decimal pl-6 text-sm ${night ? 'text-moon' : 'text-muted'}`}>
          <li>Toque em <b>Compartilhar</b> (o quadrado com a seta para cima) no Safari.</li>
          <li>Escolha <b>Adicionar à Tela de Início</b>.</li>
          <li>Toque em <b>Adicionar</b>. O castelo aparece na tela do aparelho.</li>
        </ol>
      )}
    </div>
  )
}
