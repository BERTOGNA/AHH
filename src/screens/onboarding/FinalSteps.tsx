import { useMemo, useState } from 'react'
import type { Weekday } from '../../db/types'
import { generateWeek } from '../../domain/week'
import { WeekGrid } from '../../components/WeekGrid'
import { Avatar } from '../../components/Avatar'
import { MISSIONS } from '../../data/missions'
import { WEEKDAYS, WEEKDAY_SHORT, formatTime, today } from '../../lib/date'
import { buzz } from '../../lib/haptics'
import { Card } from './ui'
import { toAnswers, type Draft } from './draft'

// ---------- 7. PIN dos pais ----------

export function StepPin({ pin, onPin }: { pin: string | null; onPin: (p: string | null) => void }) {
  const [first, setFirst] = useState<string | null>(null)
  const [typed, setTyped] = useState('')
  const [mismatch, setMismatch] = useState(false)
  const phase = pin ? 'done' : first ? 'confirm' : 'first'

  function press(k: string) {
    if (phase === 'done' || typed.length >= 4) return
    const next = typed + k
    setTyped(next)
    setMismatch(false)
    if (next.length < 4) return
    setTimeout(() => {
      setTyped('')
      if (!first) setFirst(next)
      else if (next === first) onPin(next)
      else {
        buzz([40, 40, 40])
        setMismatch(true)
        setFirst(null)
      }
    }, 200)
  }

  return (
    <Card className="mx-auto w-full max-w-md text-center">
      <p className="story mb-1 text-lg">Só os adultos usam este PIN para validar e configurar.</p>
      <p className="mb-4 text-sm text-muted">Ele protege contra toques curiosos das crianças. Guarde-o bem: são 4 números.</p>
      {phase === 'done' ? (
        <div className="flex flex-col items-center gap-3 py-4" role="status">
          <span className="text-5xl" aria-hidden="true">🔐</span>
          <p className="text-lg font-bold">PIN definido.</p>
          <button type="button" className="btn btn-ghost" onClick={() => { onPin(null); setFirst(null) }}>Trocar o PIN</button>
        </div>
      ) : (
        <>
          <p className="font-semibold" aria-live="polite">
            {mismatch ? 'Os dois PINs ficaram diferentes. Vamos de novo.' : phase === 'confirm' ? 'Digite de novo para confirmar.' : 'Escolha um PIN de 4 dígitos.'}
          </p>
          <div className={`my-4 flex justify-center gap-4 ${mismatch ? 'animate-shake' : ''}`}>
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className={`h-5 w-5 rounded-full border-2 border-ink ${i < typed.length ? 'bg-ink' : ''}`} />
            ))}
            <span className="sr-only">{typed.length} de 4 dígitos</span>
          </div>
          <div className="mx-auto grid max-w-[264px] grid-cols-3 gap-3">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((k) => (
              <PinKey key={k} label={k} onClick={() => press(k)} />
            ))}
            <span />
            <PinKey label="0" onClick={() => press('0')} />
            <PinKey label="⌫" aria="Apagar" onClick={() => setTyped((t) => t.slice(0, -1))} />
          </div>
        </>
      )}
    </Card>
  )
}

function PinKey({ label, aria, onClick }: { label: string; aria?: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-label={aria ?? label} className="h-[72px] w-[72px] justify-self-center rounded-full border-2 border-line bg-surface text-2xl font-bold tabular-nums active:bg-wait">
      {label}
    </button>
  )
}

// ---------- 8. Revisão ----------

const OCC_LABEL = { school: '🏫 Escola', work: '💼 Trabalho', home: '🏠 Em casa' } as const

export function StepReview({ d, onAdjust }: { d: Draft; onAdjust: () => void }) {
  const answers = useMemo(() => toAnswers(d), [d])
  const week = useMemo(() => generateWeek(answers), [answers])
  const mission = MISSIONS.find((m) => m.id === d.missionId) ?? MISSIONS[0]
  const rewards = answers.rewards.length

  return (
    <div className="flex flex-col gap-4">
      <Card className="card-gilded text-center">
        <p className="title-display text-2xl font-bold text-gold-deep">{answers.kingdomName}</p>
        <p className="mt-1 font-semibold tabular-nums">
          {week.tasks.length} tarefas · {rewards} {rewards === 1 ? 'recompensa' : 'recompensas'} · Missão: {mission.emoji} {mission.name}
        </p>
      </Card>
      <div className="grid gap-3 sm:grid-cols-2">
        {week.members.map((m, i) => {
          const wm = answers.members[i]
          const perDay = (day: Weekday) => week.tasks.filter((t) => t.weekdays.includes(day) && t.assigneeIds.includes(m.id)).length
          return (
            <Card key={m.id}>
              <div className="mb-2 flex items-center gap-3">
                <Avatar member={m} size={48} />
                <div className="min-w-0">
                  <p className="truncate text-lg font-bold">{m.name}</p>
                  <p className="flex flex-wrap gap-x-2 text-sm text-muted">
                    <span className="whitespace-nowrap">⏰ {formatTime(wm.wake)}</span>
                    <span className="whitespace-nowrap">
                      {OCC_LABEL[wm.occupation]}
                      {wm.occupation !== 'home' ? ` ${formatTime(wm.occStart)}–${formatTime(wm.occEnd)}` : ''}
                    </span>
                    <span className="whitespace-nowrap">😴 {formatTime(wm.sleep)}</span>
                  </p>
                </div>
              </div>
              <p className="mb-1 text-sm font-semibold">Tarefas por dia</p>
              <ul className="flex gap-1" aria-label={`Tarefas por dia de ${m.name}`}>
                {WEEKDAYS.map((day) => (
                  <li key={day} className="flex w-10 flex-col items-center rounded-lg border border-line bg-raised py-1 text-xs">
                    <span className="text-muted">{WEEKDAY_SHORT[day]}</span>
                    <span className="text-base font-bold tabular-nums">{perDay(day)}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )
        })}
      </div>
      <div className="card overflow-x-auto p-2">
        <WeekGrid members={week.members} routines={week.routines} tasks={week.tasks} date={today()} />
      </div>
      <p className="text-center text-sm text-muted">Tudo isso pode ser ajustado depois, na Semana e no Painel dos Pais.</p>
      <button type="button" className="btn btn-ghost self-center" onClick={onAdjust}>✎ Ajustar algo</button>
    </div>
  )
}
