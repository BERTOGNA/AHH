// Mural do Reino: o que cada um fez pela casa nesta semana — inclusive o trabalho invisível.
// Sem totais por pessoa, sem ordenação por desempenho: a ordem é sempre a da família.
import { useMemo, useState } from 'react'
import type { Category, Completion, Member } from '../db/types'
import { useCurrent, useFamily } from '../state'
import { BACKSTAGE, CATEGORIES } from '../data/categories'
import { MISSIONS, missionById, stageOf } from '../data/missions'
import { weekXp } from '../domain/economy'
import { addDays, formatDayMonth, isoWeekday, today, weekDates, weekKey } from '../lib/date'
import { Screen, Section, Empty } from '../components/Screen'
import { Avatar } from '../components/Avatar'
import { Progress } from '../components/Progress'
import { ThanksModal } from '../components/ThanksModal'
import { className, heroStyle } from '../components/hero'

export function Mural() {
  const f = useFamily()
  const me = useCurrent()
  const [offset, setOffset] = useState(0)
  const [thanks, setThanks] = useState<{ to: string; about: string; completionId?: string } | null>(null)
  const anchor = addDays(today(), -7 * offset)
  const dates = weekDates(anchor)
  const days = new Set(dates)
  const wk = weekKey(anchor)
  const mission = f.missions.find((m) => m.weekKey === wk)
  const week = f.completions.filter((c) => days.has(c.date))
  const weekThanks = f.thanks.filter((t) => days.has(t.date)).sort((a, b) => a.createdAt - b.createdAt)
  const mentorships = week.filter((c) => c.helperId)
  const sunday = offset === 0 && isoWeekday(today()) === 7

  return (
    <Screen
      title={sunday ? 'Crônica da Semana' : 'Mural do Reino'}
      subtitle={`${offset === 0 ? 'Esta semana' : offset === 1 ? 'Semana passada' : 'Semana'} · ${formatDayMonth(dates[0])} a ${formatDayMonth(dates[6])}`}
      actions={
        <div className="flex gap-1">
          <button className="btn btn-ghost h-12 w-12 p-0" aria-label="Semana anterior" onClick={() => setOffset((o) => o + 1)}>‹</button>
          <button className="btn btn-ghost h-12 w-12 p-0" aria-label="Semana seguinte" disabled={offset === 0} style={{ opacity: offset === 0 ? 0.4 : 1 }} onClick={() => setOffset((o) => Math.max(0, o - 1))}>›</button>
        </div>
      }
    >
      {mission && <MissionSummary goal={mission.goalXp} templateId={mission.templateId} date={anchor} current={offset === 0} />}

      <Section title="O que cada um fez pelo reino">
        {week.length === 0 && <Empty>A semana está começando. Cada tarefa feita aparece aqui.</Empty>}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {f.members.map((m) => (
            <HeroColumn
              key={m.id}
              member={m}
              completions={week.filter((c) => c.memberIds.includes(m.id))}
              canThank={Boolean(me && me.id !== m.id)}
              onThank={(about, completionId) => setThanks({ to: m.id, about, completionId })}
            />
          ))}
        </div>
        {!me && <p className="mt-2 text-sm text-muted">Para agradecer, escolha o seu herói no Salão.</p>}
      </Section>

      {mentorships.length > 0 && (
        <Section title="Mentorias da semana">
          <ul className="plaque divide-y divide-line/60">
            {mentorships.map((c) => {
              const h = f.byId.get(c.helperId!)
              const a = f.byId.get(c.memberIds[0])
              if (!h || !a) return null
              return (
                <li key={c.id} className="flex min-h-14 items-center gap-3 px-3 py-2">
                  <Avatar member={h} size={36} />
                  <span className="story flex-1">
                    <b>{h.name}</b> ajudou <b>{a.name}</b>: {c.emoji} {c.title}
                  </span>
                  <span aria-hidden="true">🤝</span>
                </li>
              )
            })}
          </ul>
        </Section>
      )}

      <Section title="Agradecimentos">
        {weekThanks.length ? (
          <ul className="grid gap-3 sm:grid-cols-2">
            {weekThanks.map((t) => {
              const from = f.byId.get(t.fromId)
              const to = f.byId.get(t.toId)
              if (!from || !to) return null
              return (
                <li key={t.id} className="plaque flex items-start gap-3 p-3">
                  <span className="text-3xl" aria-hidden="true">{t.emoji}</span>
                  <div className="flex-1">
                    <p className="story text-lg">“{t.message}”</p>
                    <p className="mt-1 flex items-center gap-2 text-sm text-muted">
                      <Avatar member={from} size={24} /> {from.name} agradeceu {to.name}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        ) : (
          <Empty>Nenhum agradecimento ainda nesta semana. Um “obrigado” também faz o reino crescer.</Empty>
        )}
      </Section>

      <KingdomMap />

      {thanks && me && (
        <ThanksModal from={me} to={thanks.to} completionId={thanks.completionId} about={`por ${thanks.about}`} onClose={() => setThanks(null)} />
      )}
    </Screen>
  )
}

function MissionSummary({ goal, templateId, date, current }: { goal: number; templateId: string; date: string; current: boolean }) {
  const f = useFamily()
  const t = missionById(templateId)
  const progress = weekXp(date, f.events)
  const pct = Math.min(100, Math.round((progress / goal) * 100))
  const stage = stageOf(progress, goal)
  return (
    <section className="plaque plaque-star mb-6 grid gap-4 p-4 sm:grid-cols-[auto_1fr] sm:items-center">
      <div className="grid h-28 place-items-center rounded-2xl bg-gradient-to-b from-[#dbe9d4] to-[#f2e6c6] px-6 text-5xl tracking-widest" aria-hidden="true">
        {t.stages[stage].scene}
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-gold">Missão da família</p>
        <h2 className="title-display text-xl font-bold">{t.name}</h2>
        <p className="story my-1 text-lg">
          {pct >= 100 ? `Missão cumprida! ${t.stages[4].text}` : current ? t.stages[stage].text : `Restauramos ${pct}% do ${t.place}. ${t.stages[stage].text}`}
        </p>
        <Progress value={progress} max={goal} label={`Restaurado: ${pct}%`} height={14} />
        <p className="mt-1 text-sm text-muted">Todos contribuem para a mesma barra: {pct}% restaurado juntos.</p>
      </div>
    </section>
  )
}

/** Uma coluna por herói: o que fez, agrupado por categoria, em linguagem de fantasia. Sem total. */
function HeroColumn({ member, completions, canThank, onThank }: {
  member: Member; completions: Completion[]; canThank: boolean; onThank: (about: string, completionId?: string) => void
}) {
  const groups = useMemo(() => {
    const byCat = new Map<Category, Map<string, { title: string; emoji: string; n: number; pending: boolean; lastId: string }>>()
    for (const c of completions) {
      if (!byCat.has(c.category)) byCat.set(c.category, new Map())
      const g = byCat.get(c.category)!
      const it = g.get(c.title) ?? { title: c.title, emoji: c.emoji, n: 0, pending: false, lastId: c.id }
      it.n++
      it.pending ||= c.status === 'done'
      it.lastId = c.id
      g.set(c.title, it)
    }
    return byCat
  }, [completions])
  const adult = member.role === 'adult'
  const cats = [...groups.keys()]
  const front = adult ? cats.filter((c) => !BACKSTAGE.includes(c)) : cats
  const back = adult ? cats.filter((c) => BACKSTAGE.includes(c)) : []

  const renderCat = (cat: Category) => (
    <div key={cat} className="mb-3">
      <p className="story mb-1 text-[15px] italic text-muted">
        <span aria-hidden="true">{CATEGORIES[cat].emoji}</span> {CATEGORIES[cat].mural}
      </p>
      <ul className="flex flex-col gap-1">
        {[...groups.get(cat)!.values()].map((it) => (
          <li key={it.title} className="flex min-h-11 items-center gap-2 rounded-xl bg-white/70 px-2">
            <span aria-hidden="true">{it.emoji}</span>
            <span className="flex-1 text-[15px] font-semibold">
              {it.title}
              {it.n > 1 && <span className="font-normal text-muted"> · {it.n} vezes</span>}
              {it.pending && <span className="sr-only"> (aguardando o selo)</span>}
            </span>
            {it.pending && <span aria-hidden="true" title="aguardando o selo">⏳</span>}
            {canThank && (
              <button className="grid h-11 w-11 place-items-center rounded-full text-xl hover:bg-wait" aria-label={`Agradecer ${member.name} por ${it.title}`} onClick={() => onThank(it.title, it.lastId)}>
                💛
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )

  return (
    <article style={heroStyle(member)} className="plaque overflow-hidden" aria-label={`${member.name}: o que fez pelo reino`}>
      <header className="flex items-center gap-3 border-b-4 p-3" style={{ borderColor: 'var(--hero)', background: 'var(--hero-tint)' }}>
        <Avatar member={member} size={52} />
        <div>
          <h3 className="title-display text-lg font-bold">{member.name}</h3>
          <p className="text-sm">{className(member)}</p>
        </div>
      </header>
      <div className="p-3">
        {front.map(renderCat)}
        {back.length > 0 && (
          <div className="mt-2 rounded-2xl border-2 border-dashed border-gold/50 bg-wait/40 p-2">
            <p className="title-display mb-1 text-sm font-bold text-gold">✦ Bastidores do Reino</p>
            {back.map(renderCat)}
          </div>
        )}
        {cats.length === 0 && <p className="story text-muted">A aventura desta semana ainda vai começar.</p>}
      </div>
    </article>
  )
}

/** Mapa do Reino: cada lugar que as missões visitaram, no maior estágio já alcançado. Nunca regride. */
function KingdomMap() {
  const f = useFamily()
  const best = new Map<string, number>()
  for (const m of f.missions) {
    const anyDay = f.events.find((e) => weekKey(e.date) === m.weekKey)?.date
    const progress = anyDay ? weekXp(anyDay, f.events) : 0
    best.set(m.templateId, Math.max(best.get(m.templateId) ?? 0, stageOf(progress, m.goalXp)))
  }
  if (!best.size) return null
  return (
    <Section title="Mapa do Reino">
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {MISSIONS.map((t) => {
          const s = best.get(t.id)
          return (
            <li key={t.id} className={`plaque p-3 text-center ${s === undefined ? 'opacity-60' : ''}`}>
              <div className="text-3xl tracking-wider" aria-hidden="true">{s === undefined ? '🌫️' : t.stages[s].scene}</div>
              <p className="mt-1 text-sm font-semibold">{t.place}</p>
              <p className="text-xs text-muted">{s === undefined ? 'Ainda sob a névoa' : s === 4 ? 'Restaurado!' : `Restaurado até ${s * 25}%`}</p>
            </li>
          )
        })}
      </ul>
    </Section>
  )
}
