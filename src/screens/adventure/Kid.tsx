// Aventura de 6 anos: nada precisa ser lido. Cartões enormes, voz, carimbo e estrelas.
import { TaskArt } from '../../components/taskart/TaskArt'
import { useEffect, useRef, useState } from 'react'
import type { Member } from '../../db/types'
import { useFamily } from '../../state'
import { memberDay, occurrencesFor, type Occurrence } from '../../domain/schedule'
import { levelOf } from '../../domain/levels'
import { xpOf } from '../../domain/economy'
import { addHelper, markDone, markThanksSeen, unmark } from '../../db/actions'
import { today } from '../../lib/date'
import { speak } from '../../lib/speech'
import { play } from '../../lib/sound'
import { buzz } from '../../lib/haptics'
import { Avatar } from '../../components/Avatar'
import { Sparks } from '../../components/Sparks'
import { Icon } from '../../components/Icon'
import { GoldStar, WaxSeal } from '../../components/Seal'
import { ThanksModal } from '../../components/ThanksModal'
import { heroColor, heroStyle, parentsLabel } from '../../components/hero'
import { go } from '../../router'
import { useArrival } from './arrival'
import { useWide } from '../../components/WeekGrid'

const MAX_KID_TASKS = 5

export function KidAdventure({ me }: { me: Member }) {
  const f = useFamily()
  const wide = useWide('(min-width: 640px)')
  const day = today()
  const occ = memberDay(me.id, occurrencesFor(day, f.tasks, f.completions)).slice(0, MAX_KID_TASKS)
  const celebrating = useArrival(me)
  const [thanksOpen, setThanksOpen] = useState(false)
  const parents = parentsLabel(f.settings)
  const lv = levelOf(xpOf(me.id, f.events))
  const stars = Math.floor((lv.into / lv.span) * 5)
  const letters = f.thanks.filter((t) => t.toId === me.id && !t.seen)
  const allDone = occ.length > 0 && occ.every((o) => o.completion)
  const wasAllDone = useRef(allDone)

  useEffect(() => {
    if (celebrating) return
    const n = occ.length
    speak(n ? `Olá, ${me.name}! Você tem ${n === 1 ? 'uma missão' : `${n} missões`} hoje.` : `Olá, ${me.name}! Hoje não tem missão. Aproveite o dia!`)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (allDone && !wasAllDone.current) {
      setTimeout(() => speak('Você fez todas as missões de hoje! O reino agradece.'), 1800)
    }
    wasAllDone.current = allDone
  }, [allDone])

  return (
    <main style={heroStyle(me)} className="mx-auto w-full max-w-5xl px-4 pb-[calc(124px+env(safe-area-inset-bottom))] pt-4 sm:px-6 lg:pb-10 lg:pl-32">
      <header className="card mb-6 flex items-center gap-3 p-3 sm:gap-4 sm:p-4" style={{ background: 'linear-gradient(120deg, var(--hero-tint), var(--color-surface) 70%)' }}>
        <button onClick={() => go(`/ficha/${me.id}`)} aria-label={`Ficha de ${me.name}`} className="rounded-full">
          <Avatar member={me} size={wide ? 80 : 64} />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="title-display truncate text-[28px] leading-tight sm:text-[32px]">{me.name}</h1>
          <div className="mt-1 flex gap-0.5 sm:gap-1" role="img" aria-label={`${stars} de 5 estrelas até o próximo nível`}>
            {[0, 1, 2, 3, 4].map((i) => (
              <span key={i} className={i < stars ? '' : 'opacity-25 grayscale'}><GoldStar size={wide ? 40 : 24} glow={false} /></span>
            ))}
          </div>
        </div>
        <button
          className="grid h-[72px] w-[72px] shrink-0 place-items-center rounded-full text-white shadow-[var(--shadow-e2)]"
          style={{ background: 'var(--hero)' }}
          aria-label="Ouvir de novo"
          onClick={() => speak(`Você tem ${occ.length} missões hoje.`)}
        >
          <Icon name="speaker" size={36} strokeWidth={2} />
        </button>
      </header>

      {letters.length > 0 && (
        <button
          className="card-gilded animate-rise mb-5 flex w-full items-center gap-4 rounded-[28px] p-4 text-left"
          onClick={() => {
            const t = letters[0]
            const from = f.byId.get(t.fromId)
            speak(`${from?.name ?? 'Alguém'} disse: ${t.message}`)
            void markThanksSeen([t.id])
          }}
          aria-label="Uma carta chegou! Toque para ouvir."
        >
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-b from-[#FFF7DE] to-gold-light text-gold-deep shadow-md" aria-hidden="true"><Icon name="heart" size={36} strokeWidth={2} filled /></span>
          {f.byId.get(letters[0].fromId) && <Avatar member={f.byId.get(letters[0].fromId)!} size={72} />}
          <span className="title-display text-[26px]">Uma carta chegou!</span>
          <span className="ml-auto grid h-16 w-16 place-items-center rounded-full bg-gold/20 text-gold-deep"><Icon name="speaker" size={32} strokeWidth={2} /></span>
        </button>
      )}

      {allDone && (
        <div className="night-sky relative mb-6 flex items-center justify-center gap-4 overflow-hidden rounded-[28px] p-5 text-center shadow-[var(--shadow-e2)]" role="status">
          <GoldStar size={64} />
          <span className="title-display text-[26px] text-gold-light">Todas as missões de hoje!</span>
          <GoldStar size={64} />
          <Sparks count={12} color={heroColor(me).solid} />
        </div>
      )}

      {occ.length === 0 ? (
        <div className="card grid place-items-center gap-2 rounded-[28px] p-10 text-center">
          <span className="text-8xl" aria-hidden="true">🌈</span>
          <p className="title-display text-[28px]">Dia livre!</p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {occ.map((o) => (
            <li key={o.task.id + o.slot}>
              <QuestCard o={o} me={me} parents={parents} />
            </li>
          ))}
        </ul>
      )}

      <button
        className="btn btn-secondary mt-7 h-[88px] w-full rounded-[28px] text-[26px]"
        onClick={() => {
          speak('Para quem você quer agradecer?')
          setThanksOpen(true)
        }}
      >
        <Icon name="heart" size={36} strokeWidth={2} className="text-gold-light" /> Agradecer
      </button>
      {thanksOpen && <ThanksModal from={me} onClose={() => setThanksOpen(false)} />}
    </main>
  )
}

type Phase = 'idle' | 'stamped' | 'askHelp' | 'confirmUndo'

function QuestCard({ o, me, parents }: { o: Occurrence; me: Member; parents: string }) {
  const f = useFamily()
  const [phase, setPhase] = useState<Phase>('idle')
  const timer = useRef<number | undefined>(undefined)
  const status = o.completion?.status
  const say = o.task.speak || o.task.title
  const helpers = f.members.filter((m) => m.role === 'teen' && m.id !== me.id)
  const helper = o.completion?.helperId ? f.byId.get(o.completion.helperId) : undefined

  useEffect(() => () => window.clearTimeout(timer.current), [])

  async function done() {
    await markDone(o.task, o.date, o.slot, o.forIds, me)
    play('done')
    buzz(30)
    speak(`Muito bem! Agora ${parents} vai ver.`)
    setPhase('stamped')
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      if (helpers.length) {
        setPhase('askHelp')
        speak('Alguém te ajudou?')
        timer.current = window.setTimeout(() => setPhase('idle'), 10000)
      } else setPhase('idle')
    }, 2200)
  }

  const label = `${o.task.title}. ${status === 'validated' ? 'Feita e validada.' : status === 'done' ? 'Feita, esperando o selo.' : 'A fazer.'}`

  return (
    <article
      aria-label={label}
      className="relative flex min-h-[320px] flex-col overflow-hidden rounded-[28px] p-4 pt-6 shadow-[var(--shadow-e2)]"
      style={{
        background: status === 'done' ? 'linear-gradient(180deg, #FFF7E0, #FBEBC4)' : status === 'validated' ? 'linear-gradient(180deg, #FFFBEA, #F8EBC2)' : 'var(--color-surface)',
        boxShadow: `inset 0 0 0 2px ${status ? '#E8CB7E' : 'var(--hero)'}, var(--shadow-e2)`,
      }}
    >
      <span className="absolute inset-x-0 top-0 h-2" style={{ background: 'var(--hero)' }} aria-hidden="true" />
      <button className="flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl" onClick={() => speak(say)} aria-label={`Ouvir: ${o.task.title}`}>
        <span
          className="grid h-[148px] w-[148px] place-items-center rounded-full"
          style={{ background: 'radial-gradient(circle at 50% 40%, #FFFFFF, var(--hero-tint) 70%)', boxShadow: 'inset 0 -6px 14px rgb(30 26 43 / .06), 0 0 0 6px var(--color-surface), 0 0 0 7px var(--color-line)' }}
          aria-hidden="true"
        >
          <TaskArt emoji={o.task.emoji} size={118} />
        </span>
        <span className="title-display mt-1 text-center text-[26px] leading-tight">{o.task.title}</span>
        {helper && (
          <span className="flex items-center gap-2 text-lg">
            <Icon name="users" size={24} className="text-muted" />
            <Avatar member={helper} size={40} />
          </span>
        )}
      </button>
      <button
        className="absolute right-3 top-5 grid h-[72px] w-[72px] place-items-center rounded-full bg-white text-[var(--hero)] shadow-[var(--shadow-e1)] ring-1 ring-line"
        onClick={() => speak(say)}
        tabIndex={-1}
        aria-hidden="true"
      >
        <Icon name="speaker" size={34} strokeWidth={2} />
      </button>

      <div className="relative mt-2 flex min-h-[112px] items-center justify-center">
        {phase === 'askHelp' ? (
          <div className="flex flex-wrap items-center justify-center gap-3" role="group" aria-label="Alguém te ajudou?">
            <span className="grid h-[72px] w-[72px] place-items-center rounded-full bg-wait text-gold-deep" aria-hidden="true"><Icon name="users" size={40} strokeWidth={2} /></span>
            {helpers.map((h) => (
              <button
                key={h.id}
                aria-label={`${h.name} me ajudou`}
                className="rounded-full border-4 border-transparent active:border-gold"
                onClick={async () => {
                  if (o.completion) await addHelper(o.completion.id, h.id)
                  speak(`Que legal! ${h.name} te ajudou.`)
                  setPhase('idle')
                }}
              >
                <Avatar member={h} size={88} />
              </button>
            ))}
            <button className="grid h-[88px] w-[88px] place-items-center rounded-full bg-white text-muted shadow-[var(--shadow-e1)] ring-1 ring-line" aria-label="Ninguém, pular" onClick={() => setPhase('idle')}>
              <Icon name="close" size={40} strokeWidth={2.25} />
            </button>
          </div>
        ) : phase === 'confirmUndo' ? (
          <div className="flex items-center gap-4" role="group" aria-label="Quer desfazer?">
            <button
              className="grid h-[88px] w-[88px] place-items-center rounded-full bg-white text-ink shadow-[var(--shadow-e1)] ring-1 ring-line"
              aria-label="Desfazer"
              onClick={async () => {
                if (o.completion) await unmark(o.completion.id)
                setPhase('idle')
              }}
            >
              <Icon name="undo" size={44} strokeWidth={2.25} />
            </button>
            <button className="btn-primary grid h-[88px] w-[88px] place-items-center rounded-full text-ink" aria-label="Manter feita" onClick={() => setPhase('idle')}>
              <Icon name="check" size={48} strokeWidth={2.5} />
            </button>
          </div>
        ) : !status ? (
          <button
            onClick={done}
            aria-label={`Marcar como feita: ${o.task.title}`}
            className="grid h-[104px] w-[104px] place-items-center rounded-full border-[5px] border-dashed bg-white shadow-[inset_0_2px_8px_rgba(30,26,43,0.08)] transition-transform active:scale-95"
            style={{ borderColor: 'var(--hero)' }}
          />
        ) : status === 'done' ? (
          <button
            aria-label="Esperando o selo. Toque para desfazer."
            onClick={() => {
              speak('Quer desfazer?')
              setPhase('confirmUndo')
              window.clearTimeout(timer.current)
              timer.current = window.setTimeout(() => setPhase('idle'), 8000)
            }}
            className="relative grid h-[104px] w-[104px] place-items-center"
          >
            <span className="animate-stamp block"><WaxSeal size={108} /></span>
            {phase === 'stamped' && <Sparks color={heroColor(me).solid} />}
          </button>
        ) : (
          <span className="animate-pop block"><GoldStar size={112} /></span>
        )}
      </div>
    </article>
  )
}
