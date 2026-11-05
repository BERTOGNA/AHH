import { useEffect } from 'react'
import { useFamily, useSession } from '../state'
import { Sparks } from './Sparks'
import { Avatar } from './Avatar'
import { GoldStar } from './Seal'
import { speak } from '../lib/speech'
import { play } from '../lib/sound'

export function Toasts() {
  const { toasts, dismissToast } = useSession()
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(88px+env(safe-area-inset-bottom))] z-[60] flex flex-col items-center gap-2 px-4 lg:bottom-6" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="on-night animate-rise pointer-events-auto flex min-h-14 items-center gap-3 rounded-2xl border border-gold-light/25 bg-night-2/95 px-5 py-2 text-ivory shadow-[var(--shadow-e3)] backdrop-blur">
          <span className="font-semibold">{t.text}</span>
          {t.action && (
            <button
              className="btn btn-primary h-11 min-h-11 rounded-xl px-4"
              onClick={() => {
                t.action!.run()
                dismissToast(t.id)
              }}
            >
              {t.action.label}
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

/** Celebração em tela cheia: nível novo, conquista, missão. */
export function CelebrationOverlay() {
  const { celebration, celebrate } = useSession()
  const { byId } = useFamily()
  useEffect(() => {
    if (!celebration) return
    play('level')
    if (celebration.speak) speak(celebration.speak)
  }, [celebration])
  if (!celebration) return null
  const hero = celebration.heroId ? byId.get(celebration.heroId) : undefined
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={celebration.title}
      className="night-sky on-night fixed inset-0 z-[70] flex flex-col items-center justify-center gap-6 p-6 text-center"
      onClick={() => celebrate(null)}
    >
      <div className="relative grid place-items-center">
        <span className="absolute h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(241,213,138,0.35),transparent_65%)]" aria-hidden="true" />
        {hero ? <Avatar member={hero} size={168} glow /> : celebration.emoji === '⭐' ? <span className="animate-pop"><GoldStar size={150} /></span> : <span className="animate-pop text-[120px] leading-none">{celebration.emoji}</span>}
        {hero && (
          <span className="animate-pop absolute -right-8 -top-6">
            {celebration.emoji === '⭐' ? <GoldStar size={84} /> : <span className="grid h-20 w-20 place-items-center rounded-full bg-night-2 text-5xl shadow-lg ring-2 ring-gold-light/60">{celebration.emoji}</span>}
          </span>
        )}
        <Sparks count={16} color="#F1D58A" />
      </div>
      <h2 className="insignia animate-rise bg-gradient-to-b from-[#FFF1C4] to-gold bg-clip-text text-[34px] leading-tight text-transparent sm:text-5xl">{celebration.title}</h2>
      {celebration.text && <p className="story animate-rise max-w-md text-xl text-moon">{celebration.text}</p>}
      <button autoFocus className="btn btn-primary mt-2 h-16 min-w-52 text-xl" onClick={() => celebrate(null)}>
        Continuar ✦
      </button>
    </div>
  )
}
