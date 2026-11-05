// Grade da semana da família: dias × horas, uma faixa fina por pessoa, blocos de rotina e tarefas.
import { RoutineIcon } from './RoutineIcon'
import { TaskArt } from './taskart/TaskArt'
// Tablet/desktop: 7 colunas (rolagem horizontal se faltar espaço). Celular: um dia por vez.
import { useEffect, useMemo, useRef, useState, type PointerEvent as RPointerEvent } from 'react'
import type { Completion, Member, RoutineBlock, Task } from '../db/types'
import { occurrencesFor, ROUTINE_INFO, routineOn, togetherRanges, type Occurrence } from '../domain/schedule'
import { addDays, formatDayMonth, formatTime, hhmm, isoWeekday, minutes, nowMinutes, today, weekDates, WEEKDAY_SHORT } from '../lib/date'
import { heroColor, heroTint } from './hero'
import { buzz } from '../lib/haptics'
import { Icon } from './Icon'
import { Avatar } from './Avatar'

export interface WeekGridProps {
  members: Member[]
  routines: RoutineBlock[]
  tasks: Task[]
  completions?: Completion[]
  date: string // qualquer dia da semana mostrada
  editable?: boolean
  canEdit?: (item: { task?: Task; routine?: RoutineBlock }) => boolean
  onTaskTap?: (task: Task, date: string) => void
  onRoutineTap?: (r: RoutineBlock) => void
  /** Arrastar: novo dia e novo início (minutos). */
  onMove?: (item: { task?: Task; routine?: RoutineBlock }, fromDate: string, toDate: string, startMin: number) => void
  /** Celular: dia mostrado (controlado pelo pai). */
  day?: string
  /** Tablet: mostrar só este dia em largura total (blocos grandes, com nomes). */
  focusDay?: string
  onDayTap?: (date: string) => void
}

const FROM = 6 * 60
const TO = 22 * 60
const SNAP = 15

export function useWide(query = '(min-width: 768px)') {
  const [wide, setWide] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setWide(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [query])
  return wide
}

interface Segment {
  routine: RoutineBlock
  start: number
  end: number
}

/** Pedaços de rotina visíveis num dia (o sono cruza a meia-noite e aparece de manhã e à noite). */
function segmentsFor(date: string, routines: RoutineBlock[]): Segment[] {
  const out: Segment[] = []
  for (const r of routines) {
    const s = minutes(r.start)
    const e = minutes(r.end)
    if (e > s) {
      if (routineOn(r, date)) out.push({ routine: r, start: s, end: e })
    } else {
      if (routineOn(r, date)) out.push({ routine: r, start: s, end: 1440 })
      if (routineOn(r, addDays(date, -1))) out.push({ routine: r, start: 0, end: e })
    }
  }
  return out
    .map((x) => ({ ...x, start: Math.max(FROM, x.start), end: Math.min(TO, x.end) }))
    .filter((x) => x.end > x.start)
}

interface Drag {
  item: { task?: Task; routine?: RoutineBlock }
  fromDate: string
  startMin: number
  offsetMin: number
  date: string
  min: number
  pointerId: number
}

export function WeekGrid(p: WeekGridProps) {
  const wide = useWide()
  const days = p.focusDay && wide ? [p.focusDay] : p.day && !wide ? [p.day] : weekDates(p.date)
  const pxh = wide && !p.focusDay ? 48 : 72
  const lanes = p.members
  const [drag, setDrag] = useState<Drag | null>(null)
  const pressTimer = useRef<number | null>(null)
  const justDragged = useRef(false)
  const scroller = useRef<HTMLDivElement>(null)
  const todayKey = today()

  // Abre rolado perto da hora atual.
  useEffect(() => {
    const el = scroller.current
    if (!el) return
    const n = nowMinutes()
    if (n > FROM && n < TO) el.scrollTop = Math.max(0, ((n - FROM) / 60) * pxh - 120)
  }, [pxh])

  const occByDay = useMemo(
    () => new Map(days.map((d) => [d, occurrencesFor(d, p.tasks, p.completions ?? [])])),
    [days.join(), p.tasks, p.completions], // eslint-disable-line react-hooks/exhaustive-deps
  )

  const yOf = (m: number) => ((m - FROM) / 60) * pxh
  const height = yOf(TO)

  function minuteAt(clientY: number, col: HTMLElement) {
    const rect = col.getBoundingClientRect()
    return FROM + ((clientY - rect.top) / pxh) * 60
  }

  function startPress(e: RPointerEvent, item: Drag['item'], fromDate: string, startMin: number) {
    if (!p.editable || !p.onMove || (p.canEdit && !p.canEdit(item))) return
    const col = (e.currentTarget as HTMLElement).closest<HTMLElement>('[data-date]')
    if (!col) return
    const offsetMin = minuteAt(e.clientY, col) - startMin
    const pointerId = e.pointerId
    const target = e.currentTarget as HTMLElement
    pressTimer.current = window.setTimeout(() => {
      buzz(10)
      try {
        target.setPointerCapture(pointerId)
      } catch {
        /* nada */
      }
      setDrag({ item, fromDate, startMin, offsetMin, date: fromDate, min: startMin, pointerId })
    }, 400)
  }

  function cancelPress() {
    if (pressTimer.current) window.clearTimeout(pressTimer.current)
    pressTimer.current = null
  }

  function onPointerMove(e: RPointerEvent) {
    if (!drag) return
    e.preventDefault()
    const el = document.elementsFromPoint(e.clientX, e.clientY).find((x) => (x as HTMLElement).dataset?.date) as HTMLElement | undefined
    if (!el) return
    const raw = minuteAt(e.clientY, el) - drag.offsetMin
    const min = Math.max(0, Math.min(TO - SNAP, Math.round(raw / SNAP) * SNAP))
    setDrag({ ...drag, date: el.dataset.date!, min })
  }

  function onPointerUp() {
    cancelPress()
    if (!drag) return
    if (drag.date !== drag.fromDate || drag.min !== drag.startMin) p.onMove?.(drag.item, drag.fromDate, drag.date, drag.min)
    justDragged.current = true
    window.setTimeout(() => (justDragged.current = false), 50)
    setDrag(null)
  }

  const laneWidth = 100 / Math.max(1, lanes.length)
  const laneIndex = new Map(lanes.map((m, i) => [m.id, i]))
  const showText = !wide || lanes.length === 1 || Boolean(p.focusDay)

  return (
    <div
      className="card overflow-hidden"
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        cancelPress()
        setDrag(null)
      }}
      style={{ touchAction: drag ? 'none' : undefined }}
    >
      <div ref={scroller} className="max-h-[70dvh] overflow-auto overscroll-contain">
        <div className="relative flex" style={{ minWidth: wide ? Math.max(640, days.length * 120 + 56) : undefined }}>
          {/* coluna de horas */}
          <div className="sticky left-0 z-20 w-11 shrink-0 bg-surface sm:w-14">
            <div className="sticky top-0 z-10 h-[96px] border-b border-line bg-surface" />
            <div className="relative" style={{ height }}>
              {Array.from({ length: (TO - FROM) / 60 + 1 }, (_, i) => (
                <span key={i} className="absolute right-1.5 -translate-y-1/2 text-xs font-semibold tabular-nums text-muted" style={{ top: i * pxh }}>
                  {6 + i}h
                </span>
              ))}
            </div>
          </div>

          {days.map((d) => {
            const isToday = d === todayKey
            const occ = occByDay.get(d) ?? []
            const timed = occ.filter((o) => o.task.time)
            const untimed = occ.filter((o) => !o.task.time)
            const together = lanes.length >= 3 ? togetherRanges(d, lanes, p.routines) : []
            return (
              <div key={d} className={`min-w-0 flex-1 border-l border-line ${isToday ? 'bg-raised/60' : ''}`} style={{ minWidth: wide ? 120 : undefined }}>
                {/* cabeçalho do dia + "dia todo" */}
                <div className="sticky top-0 z-10 h-[96px] border-b border-line bg-surface px-1 pt-1">
                  {wide && p.onDayTap && !p.focusDay ? (
                    <button
                      className={`block min-h-12 w-full rounded-lg text-center text-sm font-bold hover:bg-wait ${isToday ? 'text-gold-deep' : ''}`}
                      onClick={() => p.onDayTap!(d)}
                      aria-label={`Ver ${WEEKDAY_SHORT[isoWeekday(d)]} ${formatDayMonth(d)} em detalhe`}
                    >
                      {WEEKDAY_SHORT[isoWeekday(d)]} <span className="font-normal text-muted">{formatDayMonth(d)}</span>
                    </button>
                  ) : (
                    <div className={`text-center text-sm font-bold ${isToday ? 'text-gold-deep' : ''}`}>
                      {WEEKDAY_SHORT[isoWeekday(d)]} <span className="font-normal text-muted">{formatDayMonth(d)}</span>
                      {isToday && <span className="sr-only"> (hoje)</span>}
                    </div>
                  )}
                  {p.focusDay && (
                    <div className="mt-1 flex" aria-hidden="true">
                      {lanes.map((m) => (
                        <span key={m.id} className="flex min-w-0 flex-1 items-center justify-center gap-1.5 text-sm font-semibold">
                          <Avatar member={m} size={26} /> <span className="truncate">{m.name}</span>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className={`mt-1 ${p.focusDay ? "hidden" : "flex"} h-[44px] flex-wrap content-start gap-0.5 overflow-hidden`} aria-label="Tarefas sem horário">
                    {untimed.map((o) => (
                      <button
                        key={o.task.id + o.slot}
                        onClick={() => p.onTaskTap?.(o.task, d)}
                        className="h-6 rounded-md border bg-raised px-1 text-xs leading-none"
                        style={{ borderColor: o.forIds[0] ? heroColor(p.members.find((m) => m.id === o.forIds[0]) ?? { slot: 0 }).solid : 'var(--color-line)' }}
                        aria-label={`${o.task.title}, sem horário`}
                      >
                        <TaskArt emoji={o.task.emoji} size={18} />
                      </button>
                    ))}
                  </div>
                </div>

                <div data-date={d} className="relative" style={{ height }}>
                  {/* linhas das horas */}
                  {Array.from({ length: (TO - FROM) / 60 }, (_, i) => (
                    <div key={i} className="absolute inset-x-0 border-t border-line/50" style={{ top: i * pxh }} />
                  ))}
                  {/* faixas por pessoa */}
                  {lanes.map((m, i) => (
                    <div key={m.id} className="absolute inset-y-0 border-l border-line/40" style={{ left: `${i * laneWidth}%` }} />
                  ))}
                  {/* ✦ Juntos */}
                  {together.map((r) => (
                    <div
                      key={r.start}
                      className="pointer-events-none absolute inset-x-0 z-[1] border-y-2 border-gold-bright/70 bg-gold-bright/15"
                      style={{ top: yOf(r.start), height: yOf(r.end) - yOf(r.start) }}
                    >
                      <span className="absolute right-0.5 top-0.5 rounded bg-gold-bright px-1 text-[10px] font-bold text-[#1e1a2b]">✦ Juntos</span>
                    </div>
                  ))}
                  {/* rotina */}
                  {segmentsFor(d, p.routines).map((s, k) => {
                    const i = laneIndex.get(s.routine.memberId)
                    if (i === undefined) return null
                    const m = lanes[i]
                    const info = ROUTINE_INFO[s.routine.kind]
                    const label = s.routine.label || info.label
                    const dragging = drag?.item.routine?.id === s.routine.id && drag.fromDate === d
                    const top = dragging ? yOf(drag.min) : yOf(s.start)
                    return (
                      <button
                        key={`${s.routine.id}-${k}`}
                        onClick={() => !justDragged.current && p.onRoutineTap?.(s.routine)}
                        onPointerDown={(e) => s.routine.kind !== 'sleep' && startPress(e, { routine: s.routine }, d, s.start)}
                        onPointerLeave={cancelPress}
                        aria-label={`${m.name}: ${label}, ${formatTime(s.routine.start)} às ${formatTime(s.routine.end)}`}
                        className={`absolute z-[2] overflow-hidden rounded-lg text-left ${s.routine.kind === 'sleep' ? 'sleep-stripes' : ''} ${dragging ? 'z-30 shadow-xl ring-2 ring-ink' : ''}`}
                        style={{
                          top, height: Math.max(14, yOf(s.end) - yOf(s.start) - 1),
                          left: `calc(${i * laneWidth}% + 1.5px)`, width: `calc(${laneWidth}% - 3px)`,
                          background: s.routine.kind === 'sleep'
                            ? `linear-gradient(180deg, ${heroTint(m)}, color-mix(in srgb, ${heroTint(m)} 70%, #8E88A8))`
                            : `linear-gradient(180deg, color-mix(in srgb, ${heroColor(m).solid} 16%, var(--color-raised)), ${heroTint(m)})`,
                          boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${heroColor(m).solid} 22%, transparent)`,
                        }}
                      >
                        <span className="block px-0.5 text-[13px] leading-tight">
                          <span aria-hidden="true" className="inline-block align-middle"><RoutineIcon kind={s.routine.kind} size={showText ? 14 : 15} /></span>
                          {showText && <span className="ml-1 text-xs font-semibold">{label}</span>}
                        </span>
                      </button>
                    )
                  })}
                  {/* tarefas com horário */}
                  {timed.flatMap((o) => pillsFor(o, lanes, laneIndex)).map(({ o, lane, span }) => {
                    const start = minutes(o.task.time!)
                    if (start >= TO || start + 1 < FROM) return null
                    const dragging = drag?.item.task?.id === o.task.id && drag.fromDate === d
                    const top = dragging ? yOf(drag.min) : yOf(Math.max(FROM, start))
                    // Tarefas longas (ex.: expedição de trabalho) não cobrem o bloco de rotina: no máximo 1h de altura.
                    const h = Math.max(p.focusDay ? 46 : showText ? 30 : 26, (Math.min(o.task.duration, 60, TO - start) / 60) * pxh - 2)
                    const st = o.completion?.status
                    const owner = lanes[lane]
                    return (
                      <button
                        key={`${o.task.id}-${o.slot}-${lane}`}
                        onClick={() => !justDragged.current && p.onTaskTap?.(o.task, d)}
                        onPointerDown={(e) => startPress(e, { task: o.task }, d, start)}
                        onPointerLeave={cancelPress}
                        aria-label={`${o.task.title}, ${formatTime(o.task.time!)}${st === 'validated' ? ', validada' : st === 'done' ? ', feita, aguardando validação' : ''}`}
                        className={`absolute z-[3] flex items-center gap-1 overflow-hidden rounded-lg px-1 text-left ${dragging ? 'z-30 scale-[1.03] shadow-xl ring-2 ring-ink' : ''}`}
                        style={{
                          top, height: h,
                          left: `calc(${lane * laneWidth}% + 2px)`, width: `calc(${span * laneWidth}% - 4px)`,
                          background: o.task.kind === 'household' ? 'linear-gradient(180deg, var(--color-state-wait-a), var(--color-state-wait-b))' : 'var(--color-raised)',
                          boxShadow: `inset 3px 0 0 ${o.task.kind === 'household' ? 'var(--color-gold)' : heroColor(owner).solid}, 0 0 0 1px rgb(30 26 43 / .08), 0 2px 6px rgb(30 26 43 / .1)`,
                          opacity: st === 'validated' ? 0.92 : 1,
                        }}
                      >
                        <TaskArt emoji={o.task.emoji} size={showText ? 20 : 22} className="shrink-0" />
                        {showText && <span className="truncate text-xs font-semibold leading-tight">{o.task.title}</span>}
                        {st && (
                          <span aria-hidden="true" className={`absolute -bottom-px right-0.5 ${st === 'validated' ? 'text-gold-deep' : 'text-gold-deep'}`}>
                            <Icon name={st === 'validated' ? 'star' : 'hourglass'} size={11} strokeWidth={2.25} filled={st === 'validated'} />
                          </span>
                        )}
                      </button>
                    )
                  })}
                  {/* linha do agora */}
                  {isToday && nowMinutes() > FROM && nowMinutes() < TO && (
                    <div className="pointer-events-none absolute inset-x-0 z-[4] h-0.5 bg-gold" style={{ top: yOf(nowMinutes()) }}>
                      <span className="absolute -left-1 -top-[5px] h-3 w-3 rounded-full bg-gold" />
                    </div>
                  )}
                  {drag && drag.date === d && (
                    <div className="pointer-events-none absolute left-0 z-40 rounded bg-night px-1.5 text-xs font-bold text-ivory" style={{ top: yOf(drag.min) - 18 }}>
                      {hhmm(drag.min)}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/** Onde desenhar a pílula: na faixa de cada responsável; tarefas do lar ocupam a largura toda. */
function pillsFor(o: Occurrence, lanes: Member[], laneIndex: Map<string, number>) {
  if (o.task.kind === 'household' || !o.forIds.length) return lanes.length ? [{ o, lane: 0, span: lanes.length }] : []
  return o.forIds
    .map((id) => laneIndex.get(id))
    .filter((i): i is number => i !== undefined)
    .map((lane) => ({ o, lane, span: 1 }))
}

/** Legenda das faixas (ordem fixa da família). */
export function LaneLegend({ members }: { members: Member[] }) {
  return (
    <div className="flex flex-wrap gap-3 text-sm" aria-label="Faixas da grade, da esquerda para a direita">
      {members.map((m) => (
        <span key={m.id} className="inline-flex items-center gap-1.5">
          <span className="h-3 w-5 rounded-sm" style={{ background: heroTint(m), borderLeft: `3px solid ${heroColor(m).solid}` }} />
          {m.name}
        </span>
      ))}
      <span className="inline-flex items-center gap-1.5">
        <span className="h-3 w-5 rounded-sm border-y-2 border-gold-bright/70 bg-gold-bright/15" /> Juntos
      </span>
    </div>
  )
}
