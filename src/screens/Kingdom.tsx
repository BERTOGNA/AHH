// Salão do Reino: "este é o nosso reino e cada um tem seu papel".
import { useMemo } from 'react'
import { useFamily, useParentGate, useSession } from '../state'
import type { Member } from '../db/types'
import { go } from '../router'
import { Avatar } from '../components/Avatar'
import { Progress } from '../components/Progress'
import { className, heroStyle } from '../components/hero'
import { occurrencesFor, routineAt, statusAt } from '../domain/schedule'
import { weekXp } from '../domain/economy'
import { missionById, stageOf } from '../data/missions'
import { formatLong, formatTime, isoWeekday, minutes, nowMinutes, today, weekKey } from '../lib/date'
import { play } from '../lib/sound'

export function Kingdom() {
  const f = useFamily()
  const { setCurrent, adultId, lock } = useSession()
  const gate = useParentGate()
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

  const upcoming = useUpcoming(day, now)
  const lastThanks = [...f.thanks].sort((a, b) => b.createdAt - a.createdAt).slice(0, 3)

  return (
    <main className="pb-[calc(104px+env(safe-area-inset-bottom))] lg:pb-10 lg:pl-24">
      {/* Faixa-título */}
      <header className="night-sky relative overflow-hidden px-4 pb-16 pt-6 text-bg sm:px-8">
        <div className="mx-auto flex max-w-5xl items-start gap-3">
          <div className="flex-1">
            <p className="text-sm capitalize opacity-85">{formatLong(day)}</p>
            <h1 className="title-display text-3xl font-bold text-gold-bright sm:text-4xl">{f.settings.kingdomName}</h1>
            <p className="story mt-1 text-lg opacity-90">A casa funciona porque cada um faz a sua parte.</p>
          </div>
          {adultId ? (
            <button className="btn h-12 border-2 border-gold-bright/60 px-3 text-bg" onClick={lock}>
              🔓 <span className="hidden sm:inline">Sair do modo pais</span>
              <span className="sr-only sm:hidden">Sair do modo pais</span>
            </button>
          ) : (
            <button className="btn h-12 border-2 border-gold-bright/60 px-3 text-bg" onClick={() => gate(() => go('/pais'))}>
              🔒 Pais
            </button>
          )}
        </div>
        <Skyline />
      </header>

      <div className="mx-auto -mt-12 max-w-5xl px-4 sm:px-6">
        <h2 className="sr-only">Quem vai jogar?</h2>
        {/* Estandartes dos heróis — todos do mesmo tamanho, na ordem fixa da família */}
        <ul className="relative z-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {f.members.map((m) => {
            const st = statusAt(m.id, day, now, f.routines)
            const waiting = pending.filter((c) => c.memberIds.includes(m.id)).length
            return (
              <li key={m.id}>
                <button
                  onClick={() => enter(m)}
                  style={heroStyle(m)}
                  aria-label={`${m.name}, ${className(m)}. Agora: ${st.label}.${waiting ? ` ${waiting} aguardando o selo.` : ''}${m.role === 'adult' ? ' Pede PIN.' : ''}`}
                  className="banner group flex w-full flex-col items-center px-2 pb-8 pt-5 text-center transition-transform active:scale-[0.98]"
                >
                  <span className="relative">
                    <Avatar member={m} size={112} className="sm:hidden" />
                    <Avatar member={m} size={128} className="hidden sm:inline-grid" />
                    {waiting > 0 && (
                      <span className="absolute -right-2 top-0 grid h-9 min-w-9 place-items-center rounded-full border-2 border-gold bg-wait px-1 text-sm font-bold" aria-hidden="true">
                        ⏳{waiting}
                      </span>
                    )}
                  </span>
                  <span className="title-display mt-2 text-xl font-bold">{m.name}</span>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: 'var(--hero)' }} aria-hidden="true" />
                    {className(m)}
                  </span>
                  <span className="mt-0.5 line-clamp-2 text-xs text-muted">{m.kingdomRole}</span>
                  <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-surface/90 px-3 py-1 text-sm font-semibold">
                    <span aria-hidden="true">{st.emoji}</span> {st.label}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>

        {pending.length > 0 && (
          <button
            onClick={() => gate(() => go('/pais'))}
            className="plaque mt-5 flex w-full items-center gap-4 p-4 text-left"
          >
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-wait text-3xl" aria-hidden="true">🔏</span>
            <span className="flex-1">
              <span className="title-display block text-lg font-bold">Ritual do Selo</span>
              <span className="text-muted">
                {pending.length === 1 ? '1 tarefa espera' : `${pending.length} tarefas esperam`} o selo dos pais. Que tal validar com todos juntos?
              </span>
            </span>
            <span aria-hidden="true" className="text-2xl">›</span>
          </button>
        )}

        <div className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          {mission && <MissionCard goal={mission.goalXp} templateId={mission.templateId} reward={mission.reward} />}

          <section className="plaque p-4" aria-labelledby="agora">
            <h2 id="agora" className="title-display mb-3 text-lg font-bold">Acontecendo agora</h2>
            {upcoming.length ? (
              <ul className="flex flex-col gap-2">
                {upcoming.map((u) => (
                  <li key={u.key} className="flex items-center gap-3">
                    <span className="w-14 shrink-0 text-right font-bold tabular-nums">{u.time}</span>
                    <span className="text-2xl" aria-hidden="true">{u.emoji}</span>
                    <span className="min-w-0 flex-1 font-semibold">{u.title}</span>
                    <span className="flex -space-x-2">
                      {u.who.map((m) => <Avatar key={m.id} member={m} size={32} />)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="story text-muted">O dia está tranquilo no reino.</p>
            )}
          </section>
        </div>

        <section className="plaque mt-5 p-4" aria-labelledby="gratidao">
          <div className="mb-3 flex items-center gap-3">
            <h2 id="gratidao" className="title-display flex-1 text-lg font-bold">Gratidão no reino</h2>
            <button className="btn btn-ghost h-11 min-h-11 text-sm" onClick={() => go('/mural')}>
              {isoWeekday(day) === 7 ? 'Crônica da Semana ›' : 'Ver o Mural ›'}
            </button>
          </div>
          {lastThanks.length ? (
            <ul className="flex flex-col gap-2">
              {lastThanks.map((t) => {
                const from = f.byId.get(t.fromId)
                const to = f.byId.get(t.toId)
                if (!from || !to) return null
                return (
                  <li key={t.id} className="flex items-center gap-3">
                    <Avatar member={from} size={36} />
                    <span className="story min-w-0 flex-1">
                      <b>{from.name}</b> para <b>{to.name}</b>: “{t.message}”
                    </span>
                    <span aria-hidden="true" className="text-xl">{t.emoji}</span>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="story text-muted">Quando alguém agradecer, a mensagem aparece aqui.</p>
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
      if (s >= now || routineAt(r.memberId, day, now, f.routines)?.id === r.id) {
        const label = r.label ?? (r.kind === 'school' ? 'Escola' : r.kind === 'work' ? 'Trabalho' : r.kind === 'meal' ? 'Refeição' : 'Compromisso')
        if (s >= now) add(s, r.kind === 'meal' ? '🍽️' : r.kind === 'school' ? '🏫' : r.kind === 'work' ? '💼' : '📌', label, m)
      }
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
    <section className="plaque plaque-star overflow-hidden" aria-labelledby="missao">
      <button className="block w-full p-4 text-left" onClick={() => go('/mural')}>
        <p className="text-xs font-bold uppercase tracking-widest text-gold">Missão da família</p>
        <h2 id="missao" className="title-display text-xl font-bold">{t.name}</h2>
        <div className="my-3 grid h-28 place-items-center rounded-2xl bg-gradient-to-b from-[#dbe9d4] to-[#f2e6c6] text-5xl tracking-widest sm:text-6xl" aria-hidden="true">
          {t.stages[stage].scene}
        </div>
        <p className="story mb-2 text-lg">{t.stages[stage].text}</p>
        <Progress value={progress} max={goal} label={`Missão: ${pct}% restaurado`} height={16} />
        <p className="mt-2 flex justify-between text-sm text-muted">
          <span>{pct >= 100 ? 'Missão cumprida! ✨' : `${pct}% restaurado juntos`}</span>
          <span>🎁 {reward}</span>
        </p>
      </button>
    </section>
  )
}

function Skyline() {
  return (
    <svg aria-hidden="true" viewBox="0 0 1200 120" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-16 w-full text-bg sm:h-20">
      <path
        fill="#2f3361"
        d="M0 120V70h60V50h20v20h40V40h16V22l12-14 12 14v18h16v30h70V58h24v12h50V36h18v-12h12v12h18v34h120V48h20v22h40V30l16-18 16 18v40h60V52h30v18h120V40h16V26l10-10 10 10v14h16v30h90V56h24v14h120v50z"
      />
      <path fill="currentColor" d="M0 120V96c120-16 240-16 360-4s240 16 360 4 300-20 480-6v30z" />
    </svg>
  )
}
