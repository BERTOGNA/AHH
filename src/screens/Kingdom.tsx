// Salão do Reino: "este é o nosso reino e cada um tem seu papel".
import { useEffect, useMemo } from 'react'
import { useFamily, useParentGate, useSession } from '../state'
import type { Member } from '../db/types'
import { go } from '../router'
import { Avatar } from '../components/Avatar'
import { Progress } from '../components/Progress'
import { Icon } from '../components/Icon'
import { WaxSeal } from '../components/Seal'
import { MissionScene } from '../components/MissionScene'
import { capitalize, className, heroStyle } from '../components/hero'
import { useWide } from '../components/WeekGrid'
import { occurrencesFor, routineAt, statusAt } from '../domain/schedule'
import { weekXp } from '../domain/economy'
import { missionById, stageOf } from '../data/missions'
import { formatLong, formatTime, isoWeekday, minutes, nowMinutes, today, weekKey } from '../lib/date'
import { play } from '../lib/sound'
import { takeMissionCelebration } from './missionCelebration'

export function Kingdom() {
  const f = useFamily()
  const { setCurrent, adultId, lock } = useSession()
  const gate = useParentGate()
  const wide = useWide('(min-width: 640px)')
  const day = today()
  const now = nowMinutes()
  const mission = f.missions.find((m) => m.weekKey === weekKey(day))
  const pending = f.completions.filter((c) => c.status === 'done')

  function enter(m: Member) {
    play('tap')
    if (m.role === 'adult') {
      gate(() => go(`/heroi/${m.id}`), m.id)
      return
    }
    setCurrent(m.id)
    go(`/heroi/${m.id}`)
  }

  const { celebrate, celebration } = useSession()
  // A família reunida no Salão também vê quando a missão avança.
  useEffect(() => {
    if (celebration) return
    const c = takeMissionCelebration(f, 'salao')
    if (c) celebrate(c)
  }, [f.events.length]) // eslint-disable-line react-hooks/exhaustive-deps

  const upcoming = useUpcoming(day, now)
  const lastThanks = [...f.thanks].sort((a, b) => b.createdAt - a.createdAt).slice(0, 3)

  return (
    <main className="night-sky on-night min-h-dvh pb-[calc(112px+env(safe-area-inset-bottom))] lg:pb-12 lg:pl-24">
      {/* Faixa-título */}
      <header className="relative px-4 pb-6 pt-7 sm:px-8">
        <div className="mx-auto flex max-w-5xl items-start gap-3">
          <div className="flex-1">
            <p className="eyebrow">{capitalize(formatLong(day))}</p>
            <h1 className="insignia mt-1 bg-gradient-to-b from-[#FFF1C4] via-gold-light to-gold bg-clip-text text-[34px] leading-tight text-transparent sm:text-5xl">
              {f.settings.kingdomName}
            </h1>
            <p className="story mt-2 text-lg text-moon">A casa funciona porque cada um faz a sua parte.</p>
          </div>
          {adultId ? (
            <button className="btn btn-ghost h-12 px-4" onClick={lock}>
              <Icon name="unlock" size={20} /> <span className="hidden sm:inline">Sair do modo pais</span>
              <span className="sr-only sm:hidden">Sair do modo pais</span>
            </button>
          ) : (
            <button className="btn btn-ghost h-12 px-4" onClick={() => gate(() => go('/pais'))}>
              <Icon name="lock" size={20} /> Pais
            </button>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <h2 className="sr-only">Quem vai jogar?</h2>
        {/* Estandartes dos heróis — todos do mesmo tamanho, na ordem fixa da família */}
        <ul className="relative z-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {f.members.map((m) => {
            const st = statusAt(m.id, day, now, f.routines)
            const waiting = pending.filter((c) => c.memberIds.includes(m.id)).length
            return (
              <li key={m.id} className="drop-shadow-[0_14px_24px_rgba(0,0,0,0.35)]">
                <button
                  onClick={() => enter(m)}
                  style={heroStyle(m)}
                  aria-label={`${m.name}, ${className(m)}. Agora: ${st.label}.${waiting ? ` ${waiting} aguardando o selo.` : ''}${m.role === 'adult' ? ' Pede PIN.' : ''}`}
                  className="banner group flex w-full flex-col items-center px-3 pb-10 pt-6 text-center transition-transform duration-200 hover:-translate-y-1 active:scale-[0.98]"
                >
                  <span className="relative">
                    <Avatar member={m} size={wide ? 124 : 96} />
                    {waiting > 0 && (
                      <span className="absolute -right-3 -top-1 grid h-9 min-w-9 place-items-center gap-0.5 rounded-full bg-gradient-to-b from-[#F6DD96] to-gold px-2 text-sm font-extrabold text-ink shadow-md ring-2 ring-white/70" aria-hidden="true">
                        <span className="flex items-center gap-0.5"><Icon name="hourglass" size={14} strokeWidth={2.25} />{waiting}</span>
                      </span>
                    )}
                  </span>
                  <span className="insignia mt-3 text-[22px] leading-none text-gold-light sm:text-2xl">{m.name}</span>
                  <span className="mt-1.5 text-sm font-semibold leading-tight text-white">{className(m)}</span>
                  <span className="mt-1 line-clamp-2 text-xs leading-snug text-white">{m.kingdomRole}</span>
                  <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-black/20 px-3 py-1.5 text-[13px] font-semibold text-white ring-1 ring-white/20">
                    <span aria-hidden="true">{st.emoji}</span> {st.label}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>

        {pending.length > 0 && (
          <button onClick={() => gate(() => go('/pais'))} className="panel-night mt-6 flex w-full items-center gap-4 p-4 text-left transition hover:border-gold-light/50">
            <span className="grid h-14 w-14 shrink-0 place-items-center"><WaxSeal size={56} /></span>
            <span className="flex-1">
              <span className="title-display block text-xl text-gold-light">Ritual do Selo</span>
              <span className="text-moon">
                {pending.length === 1 ? '1 tarefa espera' : `${pending.length} tarefas esperam`} o selo dos pais. Que tal validar com todos juntos?
              </span>
            </span>
            <Icon name="chevron-right" size={24} className="text-gold-light" />
          </button>
        )}

        <div className="mt-6 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
          {mission && <MissionCard goal={mission.goalXp} templateId={mission.templateId} reward={mission.reward} />}

          <section className="panel-night p-5" aria-labelledby="agora">
            <h2 id="agora" className="title-display mb-4 flex items-center gap-2 text-xl text-gold-light">
              <Icon name="clock" size={20} /> Acontecendo agora
            </h2>
            {upcoming.length ? (
              <ul className="flex flex-col gap-3">
                {upcoming.map((u) => (
                  <li key={u.key} className="flex items-center gap-3">
                    <span className="w-14 shrink-0 text-right font-bold tabular-nums text-gold-light">{u.time}</span>
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/8 text-xl ring-1 ring-white/10" aria-hidden="true">{u.emoji}</span>
                    <span className="min-w-0 flex-1 font-semibold">{u.title}</span>
                    <span className="flex -space-x-2">
                      {u.who.map((m) => <Avatar key={m.id} member={m} size={32} />)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="story text-moon">O dia está tranquilo no reino.</p>
            )}
          </section>
        </div>

        <section className="panel-night mt-5 p-5" aria-labelledby="gratidao">
          <div className="mb-4 flex items-center gap-3">
            <h2 id="gratidao" className="title-display flex flex-1 items-center gap-2 text-xl text-gold-light">
              <Icon name="heart" size={20} /> Gratidão no reino
            </h2>
            <button className="btn btn-ghost h-12 min-h-12 px-4 text-sm" onClick={() => go(isoWeekday(day) === 7 ? '/mural/cronica' : '/mural')}>
              {isoWeekday(day) === 7 ? 'Crônica da Semana' : 'Ver o Mural'} <Icon name="chevron-right" size={16} />
            </button>
          </div>
          {lastThanks.length ? (
            <ul className="grid gap-3 md:grid-cols-3">
              {lastThanks.map((t) => {
                const from = f.byId.get(t.fromId)
                const to = f.byId.get(t.toId)
                if (!from || !to) return null
                return (
                  <li key={t.id} className="rounded-2xl bg-white/[0.05] p-4 ring-1 ring-white/10">
                    <p className="story text-[17px] leading-snug">“{t.message}”</p>
                    <p className="mt-3 flex items-center gap-2 text-sm text-moon">
                      <Avatar member={from} size={28} /> <b className="text-ivory">{from.name}</b> para <b className="text-ivory">{to.name}</b>
                    </p>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="story text-moon">Quando alguém agradecer, a mensagem aparece aqui.</p>
          )}
        </section>
      </div>
    </main>
  )
}

/** Próximos compromissos da casa hoje (rotinas e tarefas com horário), agrupados por horário. */
function useUpcoming(day: string, now: number) {
  const f = useFamily()
  return useMemo(() => {
    const items = new Map<string, { key: string; min: number; time: string; emoji: string; title: string; who: Member[] }>()
    const add = (min: number, emoji: string, title: string, m?: Member) => {
      const key = `${min}|${title}`
      const it = items.get(key) ?? { key, min, time: formatTime(`${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`), emoji, title, who: [] }
      if (m && !it.who.includes(m)) it.who.push(m)
      items.set(key, it)
    }
    const wd = isoWeekday(day)
    for (const r of f.routines) {
      if (!r.weekdays.includes(wd) || r.kind === 'sleep' || r.kind === 'wake') continue
      const s = minutes(r.start)
      const m = f.byId.get(r.memberId)
      const label = r.label ?? (r.kind === 'school' ? 'Escola' : r.kind === 'work' ? 'Trabalho' : r.kind === 'meal' ? 'Refeição' : 'Compromisso')
      const emoji = r.kind === 'meal' ? '🍽️' : r.kind === 'school' ? '🏫' : r.kind === 'work' ? '💼' : '📌'
      if (s >= now) add(s, emoji, label, m)
      else if (routineAt(r.memberId, day, now, f.routines)?.id === r.id) add(s, emoji, `${label} até ${formatTime(r.end)}`, m)
    }
    for (const o of occurrencesFor(day, f.tasks, f.completions)) {
      if (!o.task.time || o.completion) continue
      const s = minutes(o.task.time)
      if (s < now) continue
      if (o.task.title === 'Expedição de trabalho') continue
      const who = o.forIds.map((id) => f.byId.get(id)).filter(Boolean) as Member[]
      if (!who.length) add(s, o.task.emoji, `${o.task.title} (quem puder)`)
      who.forEach((m) => add(s, o.task.emoji, o.task.title, m))
    }
    return [...items.values()].sort((a, b) => a.min - b.min).slice(0, 4)
  }, [day, now, f])
}

function MissionCard({ goal, templateId, reward }: { goal: number; templateId: string; reward: string }) {
  const f = useFamily()
  const t = missionById(templateId)
  const progress = weekXp(today(), f.events)
  const stage = stageOf(progress, goal)
  const pct = Math.min(100, Math.round((progress / goal) * 100))
  return (
    <section className="panel-night overflow-hidden" aria-labelledby="missao">
      <button className="block w-full text-left" onClick={() => go('/mural')}>
        <div className="px-5 pb-4 pt-5">
          <p className="eyebrow">Missão da família</p>
          <h2 id="missao" className="title-display text-2xl text-ivory">{t.name}</h2>
        </div>
        <MissionScene missionId={t.id} stage={stage as 0} night className="block aspect-[16/9] w-full border-y border-gold-light/15" />
        <div className="px-5 pb-5 pt-4">
          <p className="story mb-3 text-lg text-moon">{t.stages[stage].text}</p>
          <Progress value={progress} max={goal} label={`Missão: ${pct}% restaurado`} height={12} night />
          <p className="mt-2 flex flex-wrap justify-between gap-2 text-sm">
            <span className="font-semibold text-gold-light">{pct >= 100 ? 'Missão cumprida!' : `${pct}% restaurado juntos`}</span>
            <span className="flex items-center gap-1.5 text-moon"><Icon name="gift" size={16} /> {reward}</span>
          </p>
        </div>
      </button>
    </section>
  )
}
