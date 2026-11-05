import { useEffect } from 'react'
import { useFamily, useSession } from '../state'
import { Sparks } from './Sparks'
import { Avatar } from './Avatar'
import { speak } from '../lib/speech'
import { play } from '../lib/sound'

export function Toasts() {
  const { toasts, dismissToast } = useSession()
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(88px+env(safe-area-inset-bottom))] z-[60] flex flex-col items-center gap-2 px-4 lg:bottom-6" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="animate-rise pointer-events-auto flex min-h-14 items-center gap-3 rounded-2xl bg-night px-5 py-2 text-bg shadow-xl">
          <span className="font-semibold">{t.text}</span>
          {t.action && (
            <button
              className="btn h-11 min-h-11 rounded-xl bg-gold-bright px-4 text-ink"
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
      className="night-sky fixed inset-0 z-[70] flex flex-col items-center justify-center gap-5 p-6 text-center text-bg"
      onClick={() => celebrate(null)}
    >
      <div className="relative grid place-items-center">
        {hero ? <Avatar member={hero} size={160} glow /> : <span className="animate-pop text-[120px] leading-none">{celebration.emoji}</span>}
        {hero && <span className="animate-pop absolute -right-6 -top-4 text-6xl">{celebration.emoji}</span>}
        <Sparks count={14} />
      </div>
      <h2 className="title-display animate-rise text-3xl font-bold text-gold-bright sm:text-4xl">{celebration.title}</h2>
      {celebration.text && <p className="story animate-rise max-w-md text-xl">{celebration.text}</p>}
      <button autoFocus className="btn btn-gold mt-2 h-16 min-w-48 text-xl" onClick={() => celebrate(null)}>
        Continuar ✦
      </button>
    </div>
  )
}
