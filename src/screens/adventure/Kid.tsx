// Aventura de 6 anos: nada precisa ser lido. Cartões enormes, voz, carimbo e estrelas.
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
import { ThanksModal } from '../../components/ThanksModal'
import { heroColor, heroStyle, parentsLabel } from '../../components/hero'
import { go } from '../../router'
import { useArrival } from './arrival'

const MAX_KID_TASKS = 5

export function KidAdventure({ me }: { me: Member }) {
  const f = useFamily()
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
      <header className="mb-5 flex items-center gap-4">
        <button onClick={() => go(`/ficha/${me.id}`)} aria-label={`Ficha de ${me.name}`} className="rounded-full">
          <Avatar member={me} size={80} />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="story truncate text-[32px] font-bold leading-tight">{me.name}</h1>
          <div className="mt-1 flex gap-0.5 text-[28px] sm:gap-1 sm:text-4xl" role="img" aria-label={`${stars} de 5 estrelas até o próximo nível`}>
            {[0, 1, 2, 3, 4].map((i) => (
              <span key={i} className={i < stars ? '' : 'opacity-25 grayscale'} aria-hidden="true">⭐</span>
            ))}
          </div>
        </div>
        <button
          className="grid h-[72px] w-[72px] shrink-0 place-items-center rounded-full border-4 border-[var(--hero)] bg-surface text-4xl"
          aria-label="Ouvir de novo"
          onClick={() => speak(`Você tem ${occ.length} missões hoje.`)}
        >
          🔊
        </button>
      </header>

      {letters.length > 0 && (
        <button
          className="plaque animate-rise mb-5 flex w-full items-center gap-4 p-4 text-left"
          onClick={() => {
            const t = letters[0]
            const from = f.byId.get(t.fromId)
            speak(`${from?.name ?? 'Alguém'} disse: ${t.message}`)
            void markThanksSeen([t.id])
          }}
          aria-label="Uma carta chegou! Toque para ouvir."
        >
          <span className="text-6xl" aria-hidden="true">💌</span>
          {f.byId.get(letters[0].fromId) && <Avatar member={f.byId.get(letters[0].fromId)!} size={72} />}
          <span className="story text-[26px] font-bold">Uma carta chegou!</span>
          <span className="ml-auto text-4xl" aria-hidden="true">🔊</span>
        </button>
      )}

      {allDone && (
        <div className="plaque plaque-star relative mb-5 flex items-center justify-center gap-3 p-5 text-center" role="status">
          <span className="text-5xl" aria-hidden="true">🏆</span>
          <span className="story text-[26px] font-bold">Todas as missões de hoje!</span>
          <span className="text-5xl" aria-hidden="true">🎉</span>
          <Sparks count={12} color={heroColor(me).solid} />
        </div>
      )}

      {occ.length === 0 ? (
        <div className="plaque grid place-items-center gap-2 p-10 text-center">
          <span className="text-8xl" aria-hidden="true">🌈</span>
          <p className="story text-[26px] font-bold">Dia livre!</p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {occ.map((o) => (
            <li key={o.task.id + o.slot}>
              <QuestCard o={o} me={me} parents={parents} />
            </li>
          ))}
        </ul>
      )}

      <button
        className="btn mt-6 h-[88px] w-full rounded-3xl border-4 border-[var(--hero)] bg-surface text-[26px]"
        onClick={() => {
          speak('Para quem você quer agradecer?')
          setThanksOpen(true)
        }}
      >
        <span className="text-4xl" aria-hidden="true">💖</span> Agradecer
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
      className={`relative flex min-h-[300px] flex-col overflow-hidden rounded-3xl border-4 p-4 ${status === 'done' ? 'bg-wait' : status === 'validated' ? 'bg-[#fff3c9]' : 'bg-surface'}`}
      style={{ borderColor: 'var(--hero)' }}
    >
      <button className="flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl" onClick={() => speak(say)} aria-label={`Ouvir: ${o.task.title}`}>
        <span className="text-[112px] leading-none" aria-hidden="true">{o.task.emoji}</span>
        <span className="story text-center text-[26px] font-bold leading-tight">{o.task.title}</span>
        {helper && (
          <span className="flex items-center gap-2 text-lg">
            <span aria-hidden="true">🤝</span>
            <Avatar member={helper} size={40} />
          </span>
        )}
      </button>
      <button
        className="absolute right-3 top-3 grid h-[72px] w-[72px] place-items-center rounded-full border-2 border-line bg-white text-4xl"
        onClick={() => speak(say)}
        tabIndex={-1}
        aria-hidden="true"
      >
        🔊
      </button>

      <div className="relative mt-2 flex min-h-[112px] items-center justify-center">
        {phase === 'askHelp' ? (
          <div className="flex flex-wrap items-center justify-center gap-3" role="group" aria-label="Alguém te ajudou?">
            <span className="text-5xl" aria-hidden="true">🤝❓</span>
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
            <button className="grid h-[88px] w-[88px] place-items-center rounded-full border-2 border-line bg-white text-4xl" aria-label="Ninguém, pular" onClick={() => setPhase('idle')}>
              ✖️
            </button>
          </div>
        ) : phase === 'confirmUndo' ? (
          <div className="flex items-center gap-4" role="group" aria-label="Quer desfazer?">
            <button
              className="grid h-[88px] w-[88px] place-items-center rounded-full border-2 border-line bg-white text-5xl"
              aria-label="Desfazer"
              onClick={async () => {
                if (o.completion) await unmark(o.completion.id)
                setPhase('idle')
              }}
            >
              ↩️
            </button>
            <button className="grid h-[88px] w-[88px] place-items-center rounded-full border-2 border-line bg-white text-5xl" aria-label="Manter feita" onClick={() => setPhase('idle')}>
              ✅
            </button>
          </div>
        ) : !status ? (
          <button
            onClick={done}
            aria-label={`Marcar como feita: ${o.task.title}`}
            className="grid h-[104px] w-[104px] place-items-center rounded-full border-[5px] border-dashed bg-white text-5xl text-line active:scale-95"
            style={{ borderColor: 'var(--hero)' }}
          >
          </button>
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
            <span className="animate-stamp grid h-[104px] w-[104px] place-items-center rounded-full border-4 border-gold bg-[radial-gradient(circle_at_35%_30%,#f7d77a,#d9a62e_60%,#a26c00)] text-5xl shadow-lg">
              ⏳
            </span>
            {phase === 'stamped' && <Sparks color={heroColor(me).solid} />}
          </button>
        ) : (
          <span className="animate-pop grid h-[104px] w-[104px] place-items-center rounded-full bg-[radial-gradient(circle,#fff3c9,#f7d77a)] text-7xl" aria-hidden="true">
            ⭐
          </span>
        )}
      </div>
    </article>
  )
}
