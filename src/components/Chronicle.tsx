// Crônica da Semana: cartões narrados que contam a semana do reino. Ordem fixa da família, nunca por desempenho.
import { AchievementBadge } from './badges/AchievementBadge'
import { TaskArt } from './taskart/TaskArt'
import { useEffect, useMemo, useState } from 'react'
import type { Category, Member } from '../db/types'
import { useFamily } from '../state'
import { BACKSTAGE, CATEGORIES } from '../data/categories'
import { achievementById } from '../data/achievements'
import { missionById, stageOf } from '../data/missions'
import { weekXp } from '../domain/economy'
import { formatDayMonth, weekDates, weekKey } from '../lib/date'
import { speak, stopSpeaking } from '../lib/speech'
import { Avatar } from './Avatar'
import { Icon } from './Icon'
import { MissionScene } from './MissionScene'
import { Sparks } from './Sparks'
import { className } from './hero'

interface Card {
  key: string
  eyebrow: string
  title: string
  text: string
  art: React.ReactNode
  extra?: React.ReactNode
}

export function Chronicle({ date, onClose, onThank }: { date: string; onClose: () => void; onThank?: () => void }) {
  const f = useFamily()
  const [i, setI] = useState(0)
  const [narrate, setNarrate] = useState(false)
  const cards = useChronicle(date)
  const c = cards[i]
  const last = i === cards.length - 1

  useEffect(() => {
    if (narrate) speak(`${c.title}. ${c.text}`, true)
  }, [i, narrate]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => stopSpeaking(), [])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') setI((x) => Math.min(cards.length - 1, x + 1))
      if (e.key === 'ArrowLeft') setI((x) => Math.max(0, x - 1))
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [cards.length, onClose])

  return (
    <div role="dialog" aria-modal="true" aria-label="Crônica da Semana" className="night-sky on-night fixed inset-0 z-[65] flex flex-col overflow-y-auto">
      <header className="flex items-center gap-3 px-4 pt-4 sm:px-8">
        <p className="insignia flex-1 text-lg text-gold-light">Crônica da Semana</p>
        <button className="btn btn-ghost h-12 px-3" aria-pressed={narrate} onClick={() => (narrate ? (stopSpeaking(), setNarrate(false)) : setNarrate(true))}>
          <Icon name="speaker" size={20} /> {narrate ? 'Narrando' : 'Narrar'}
        </button>
        <button className="btn btn-ghost h-12 w-12 rounded-full p-0" onClick={onClose} aria-label="Fechar a crônica">
          <Icon name="close" size={22} />
        </button>
      </header>

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-4 py-6 sm:px-6">
        <article key={c.key} className="panel-night animate-rise overflow-hidden" aria-live="polite">
          <div className="relative">{c.art}</div>
          <div className="p-6 text-center">
            <p className="eyebrow">{c.eyebrow}</p>
            <h2 className="title-display mt-1 text-[28px] leading-tight text-ivory sm:text-3xl">{c.title}</h2>
            <p className="story mx-auto mt-3 max-w-md text-lg text-moon">{c.text}</p>
            {c.extra}
            {last && onThank && (
              <button className="btn btn-primary mt-5 h-14 text-lg" onClick={onThank}>
                <Icon name="heart" size={22} /> Agradecer alguém agora
              </button>
            )}
          </div>
        </article>

        <nav className="mt-5 flex items-center justify-between gap-3" aria-label="Cartões da crônica">
          <button className="btn btn-ghost h-14 w-14 rounded-full p-0" disabled={i === 0} onClick={() => setI(i - 1)} aria-label="Cartão anterior">
            <Icon name="chevron-left" size={26} />
          </button>
          <ol className="flex gap-0.5">
            {cards.map((x, k) => (
              <li key={x.key}>
                <button
                  className="grid h-12 min-w-6 place-items-center px-1"
                  aria-label={`Cartão ${k + 1} de ${cards.length}`}
                  aria-current={k === i ? 'step' : undefined}
                  onClick={() => setI(k)}
                >
                  <span className={`block h-3 rounded-full transition-all ${k === i ? 'w-8 bg-gold-light' : 'w-3 bg-white/25'}`} />
                </button>
              </li>
            ))}
          </ol>
          {last ? (
            <button className="btn btn-primary h-14 px-6" onClick={onClose}>Fim</button>
          ) : (
            <button className="btn btn-primary h-14 w-14 rounded-full p-0" onClick={() => setI(i + 1)} aria-label="Próximo cartão">
              <Icon name="chevron-right" size={26} />
            </button>
          )}
        </nav>
        <p className="mt-3 text-center text-sm text-moon">
          {formatDayMonth(weekDates(date)[0])} a {formatDayMonth(weekDates(date)[6])} · {f.settings.kingdomName}
        </p>
      </div>
    </div>
  )
}

function useChronicle(date: string): Card[] {
  const f = useFamily()
  return useMemo(() => {
    const days = new Set(weekDates(date))
    const wk = weekKey(date)
    const week = f.completions.filter((c) => days.has(c.date))
    const thanks = f.thanks.filter((t) => days.has(t.date)).sort((a, b) => a.createdAt - b.createdAt)
    const cards: Card[] = []

    const m = f.missions.find((x) => x.weekKey === wk)
    if (m) {
      const t = missionById(m.templateId)
      const progress = weekXp(date, f.events)
      const pct = Math.min(100, Math.round((progress / m.goalXp) * 100))
      const stage = stageOf(progress, m.goalXp)
      cards.push({
        key: 'missao', eyebrow: 'Missão da família', title: pct >= 100 ? `Missão cumprida: ${t.place}!` : `Restauramos ${pct}% do ${t.place}`,
        text: `${t.stages[stage].text} Cada tarefa de cada um ajudou.`,
        art: (
          <>
            <MissionScene missionId={t.id} stage={stage as 0} night className="block aspect-[16/9] w-full" />
            {stage === 4 && <Sparks count={14} color="#F1D58A" />}
          </>
        ),
      })
    }

    for (const member of f.members) {
      const mine = week.filter((c) => c.memberIds.includes(member.id))
      const byCat = new Map<Category, number>()
      for (const c of mine) byCat.set(c.category, (byCat.get(c.category) ?? 0) + 1)
      const [top, second] = [...byCat.entries()].sort((a, b) => b[1] - a[1])
      const newAch = f.unlocks.filter((u) => u.memberId === member.id && days.has(isoDay(u.unlockedAt))).map((u) => achievementById(u.achievementId)).filter(Boolean)
      const helped = week.filter((c) => c.helperId === member.id).length
      const who = member.treatment === 'a' ? 'ela' : 'ele'
      cards.push({
        key: member.id,
        eyebrow: className(member),
        title: member.name,
        text: mine.length
          ? `Nesta semana, ${who} ${top ? CATEGORIES[top[0]].mural : 'ajudou o reino'}${second ? ` e ${CATEGORIES[second[0]].mural}` : ''}.${helped ? ` Também foi mentor${member.treatment === 'a' ? 'a' : ''} de quem estava aprendendo.` : ''}`
          : `A próxima aventura de ${member.name} começa já.`,
        art: <HeroArt member={member} />,
        extra: newAch.length ? (
          <ul className="mt-4 flex flex-wrap justify-center gap-2">
            {newAch.map((a) => (
              <li key={a!.id} className="flex items-center gap-2 rounded-full bg-gold/15 px-3 py-1.5 text-sm font-semibold text-gold-light ring-1 ring-gold-light/40">
                <AchievementBadge id={a!.id} size={28} /> {a!.name}
              </li>
            ))}
          </ul>
        ) : undefined,
      })
    }

    const backstage = week.filter((c) => BACKSTAGE.includes(c.category) && c.memberIds.some((id) => f.byId.get(id)?.role === 'adult'))
    if (backstage.length) {
      const titles = [...new Map(backstage.map((c) => [c.title, c.emoji])).entries()].slice(0, 6)
      cards.push({
        key: 'bastidores', eyebrow: 'Bastidores do Reino', title: 'O trabalho que ninguém vê',
        text: 'Enquanto o reino seguia, os adultos também cuidaram de tudo isto:',
        art: <IconArt name="feather" />,
        extra: (
          <ul className="mt-4 flex flex-wrap justify-center gap-2">
            {titles.map(([t, e]) => <li key={t} className="flex items-center gap-1.5 rounded-full bg-white/[0.07] py-1 pl-1.5 pr-3 text-sm text-ivory ring-1 ring-white/10"><TaskArt emoji={e} size={24} /> {t}</li>)}
          </ul>
        ),
      })
    }

    cards.push({
      key: 'gratidao', eyebrow: 'Gratidão',
      title: thanks.length ? `${thanks.length === 1 ? 'Um obrigado' : `${thanks.length} agradecimentos`} nesta semana` : 'Um obrigado faz o reino crescer',
      text: thanks.length ? thanks.slice(-2).map((t) => `${f.byId.get(t.fromId)?.name}: “${t.message}”`).join('  ·  ') : 'Quem vocês querem agradecer hoje?',
      art: <IconArt name="heart" />,
    })
    if (thanks.length) {
      cards.push({ key: 'fim', eyebrow: 'Para fechar a semana', title: 'Quem vocês querem agradecer hoje?', text: 'Cada um fez a sua parte. O reino funciona porque vocês estão juntos.', art: <IconArt name="castle" /> })
    }
    return cards
  }, [date, f])
}

const isoDay = (ms: number) => {
  const d = new Date(ms)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function HeroArt({ member }: { member: Member }) {
  return (
    <div className="relative grid h-56 place-items-center" style={{ background: 'radial-gradient(circle at 50% 60%, rgb(241 213 138 / .25), transparent 60%)' }}>
      <Avatar member={member} size={168} />
    </div>
  )
}

function IconArt({ name }: { name: 'heart' | 'feather' | 'castle' }) {
  return (
    <div className="grid h-44 place-items-center text-gold-light" style={{ background: 'radial-gradient(circle at 50% 55%, rgb(241 213 138 / .22), transparent 60%)' }}>
      <Icon name={name} size={88} strokeWidth={1.25} />
    </div>
  )
}
