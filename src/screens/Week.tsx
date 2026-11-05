// Semana do Reino: a rotina de todos numa visão única, para ver onde os horários se cruzam.
import { useState } from 'react'
import type { RoutineBlock, RoutineKind, Task, Weekday } from '../db/types'
import { useCurrent, useFamily, useSession } from '../state'
import { WeekGrid, LaneLegend, useWide } from '../components/WeekGrid'
import { Screen } from '../components/Screen'
import { Modal } from '../components/Modal'
import { TaskEditor } from '../components/TaskEditor'
import { Avatar } from '../components/Avatar'
import { heroColor } from '../components/hero'
import { deleteRoutine, saveRoutine, saveTask } from '../db/actions'
import { occurrencesFor, ROUTINE_INFO } from '../domain/schedule'
import {
  addDays, formatDayMonth, formatTime, hhmm, isoWeekday, minutes, today, weekDates, weekStart, WEEKDAYS, WEEKDAY_LONG, WEEKDAY_SHORT,
} from '../lib/date'

export function Week() {
  const f = useFamily()
  const me = useCurrent()
  const { adultId, toast } = useSession()
  const wide = useWide()
  const [anchor, setAnchor] = useState(today())
  const [day, setDay] = useState(today())
  const [hidden, setHidden] = useState<string[]>([])
  const [view, setView] = useState<'grade' | 'lista'>('grade')
  const [taskDetail, setTaskDetail] = useState<{ task: Task; date: string } | null>(null)
  const [editTask, setEditTask] = useState<{ task?: Task } | null>(null)
  const [routine, setRoutine] = useState<RoutineBlock | 'new' | null>(null)

  const lanes = f.members.filter((m) => !hidden.includes(m.id))
  const dates = weekDates(anchor)
  const teenId = me?.role === 'teen' ? me.id : undefined
  const canEdit = (item: { task?: Task; routine?: RoutineBlock }) =>
    Boolean(adultId) || Boolean(teenId && item.task?.assigneeIds.includes(teenId))

  function shiftWeek(n: number) {
    const a = addDays(weekStart(anchor), 7 * n)
    setAnchor(a)
    setDay(n === 0 ? today() : addDays(a, isoWeekday(day) - 1))
  }

  async function move(item: { task?: Task; routine?: RoutineBlock }, from: string, to: string, startMin: number | null) {
    const fromWd = isoWeekday(from)
    const toWd = isoWeekday(to)
    const swapDay = (days: Weekday[]) => (fromWd === toWd || days.includes(toWd) ? days : [...days.filter((d) => d !== fromWd), toWd].sort())
    if (item.task) {
      const time = startMin === null ? item.task.time : hhmm(startMin)
      await saveTask({ ...item.task, weekdays: swapDay(item.task.weekdays), time })
      toast(`${item.task.title}: ${WEEKDAY_SHORT[toWd]}${time ? ` ${formatTime(time)}` : ''} (todas as semanas)`)
    } else if (item.routine && startMin !== null) {
      const r = item.routine
      const delta = startMin - minutes(r.start)
      await saveRoutine({ ...r, weekdays: swapDay(r.weekdays), start: hhmm(minutes(r.start) + delta), end: hhmm(minutes(r.end) + delta) })
      toast(`Rotina ajustada: ${formatTime(hhmm(startMin))} (todas as semanas)`)
    }
  }

  return (
    <Screen
      title="Semana do Reino"
      subtitle={`${formatDayMonth(dates[0])} a ${formatDayMonth(dates[6])}`}
      actions={
        <div className="flex gap-1">
          <button className="btn btn-ghost h-12 w-12 p-0" aria-label="Semana anterior" onClick={() => shiftWeek(-1)}>‹</button>
          <button className="btn btn-ghost h-12 px-3" onClick={() => shiftWeek(0)}>Hoje</button>
          <button className="btn btn-ghost h-12 w-12 p-0" aria-label="Próxima semana" onClick={() => shiftWeek(1)}>›</button>
        </div>
      }
    >
      <div className="mb-3 flex flex-wrap items-center gap-2" role="group" aria-label="Mostrar pessoas">
        {f.members.map((m) => (
          <button
            key={m.id}
            className="chip pl-1"
            aria-pressed={!hidden.includes(m.id)}
            onClick={() => setHidden((h) => (h.includes(m.id) ? h.filter((x) => x !== m.id) : lanes.length > 1 ? [...h, m.id] : h))}
            style={!hidden.includes(m.id) ? { background: heroColor(m).tint, color: 'var(--color-ink)', borderColor: heroColor(m).solid } : undefined}
          >
            <Avatar member={m} size={32} /> {m.name}
          </button>
        ))}
        {adultId && (
          <span className="ml-auto flex gap-2">
            <button className="btn btn-gold h-12 min-h-12" onClick={() => setEditTask({})}>✚ Tarefa</button>
            <button className="btn btn-ghost h-12 min-h-12" onClick={() => setRoutine('new')}>✚ Rotina</button>
          </span>
        )}
      </div>

      {!wide && (
        <div className="mb-3 flex flex-col gap-2">
          <div className="flex justify-between gap-1" role="tablist" aria-label="Dia">
            {dates.map((d) => (
              <button
                key={d}
                role="tab"
                aria-selected={d === day}
                onClick={() => setDay(d)}
                className={`relative h-12 flex-1 rounded-xl text-sm font-bold ${d === day ? 'bg-night text-bg' : 'bg-surface'}`}
              >
                {WEEKDAY_SHORT[isoWeekday(d)]}
                {d === today() && <span className="absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-gold-bright" aria-label="hoje" />}
              </button>
            ))}
          </div>
          <div className="flex gap-2" role="group" aria-label="Modo de visualização">
            <button className="chip flex-1 justify-center" aria-pressed={view === 'grade'} onClick={() => setView('grade')}>Linha do tempo</button>
            <button className="chip flex-1 justify-center" aria-pressed={view === 'lista'} onClick={() => setView('lista')}>Lista</button>
          </div>
        </div>
      )}

      {!wide && view === 'lista' ? (
        <DayList date={day} memberIds={lanes.map((m) => m.id)} onTask={(t) => setTaskDetail({ task: t, date: day })} />
      ) : (
        <WeekGrid
          members={lanes}
          routines={f.routines}
          tasks={f.tasks}
          completions={f.completions}
          date={anchor}
          day={day}
          editable={Boolean(adultId || teenId)}
          canEdit={canEdit}
          onMove={move}
          onTaskTap={(task, date) => setTaskDetail({ task, date })}
          onRoutineTap={(r) => setRoutine(r)}
        />
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <LaneLegend members={lanes} />
        {(adultId || teenId) && (
          <p className="text-sm text-muted">Dica: segure uma tarefa e arraste para mudar dia ou horário — ou toque nela para editar.</p>
        )}
      </div>

      {taskDetail && (
        <TaskDetail
          task={taskDetail.task}
          date={taskDetail.date}
          editable={canEdit({ task: taskDetail.task })}
          onEdit={() => {
            setEditTask({ task: taskDetail.task })
            setTaskDetail(null)
          }}
          onMove={(toWd, startMin) => move({ task: taskDetail.task }, taskDetail.date, addDays(weekStart(taskDetail.date), toWd - 1), startMin)}
          onClose={() => setTaskDetail(null)}
        />
      )}
      {editTask && (
        <TaskEditor task={editTask.task} teenId={adultId ? undefined : teenId} presetAssignee={teenId} onClose={() => setEditTask(null)} />
      )}
      {routine && <RoutineEditor routine={routine === 'new' ? undefined : routine} readOnly={!adultId} onClose={() => setRoutine(null)} />}
    </Screen>
  )
}

/** Detalhe de uma tarefa na grade, com a alternativa a arrastar (±15 min, mover de dia). */
function TaskDetail({ task, date, editable, onEdit, onMove, onClose }: {
  task: Task; date: string; editable: boolean; onEdit: () => void; onMove: (toWd: Weekday, startMin: number | null) => void; onClose: () => void
}) {
  const f = useFamily()
  // A tarefa pode ter mudado (live query): usa a versão atual.
  const t = f.tasks.find((x) => x.id === task.id) ?? task
  const occ = occurrencesFor(date, [t], f.completions)
  const who = t.kind === 'household' ? 'Qualquer um da casa (do lar)' : t.assigneeIds.map((id) => f.byId.get(id)?.name).filter(Boolean).join(' e ')
  const status = occ[0]?.completion?.status
  const start = t.time ? minutes(t.time) : null
  const wd = isoWeekday(date)
  return (
    <Modal title={t.title} onClose={onClose}>
      <div className="mb-4 flex items-center gap-3">
        <span className="text-5xl" aria-hidden="true">{t.emoji}</span>
        <div>
          <p className="font-semibold">{who}</p>
          <p className="text-muted">
            {t.time ? formatTime(t.time) : 'Qualquer hora'} · {t.weekdays.map((d) => WEEKDAY_SHORT[d]).join(', ')} · {t.xp} XP
          </p>
          <p className="text-sm text-muted">
            {WEEKDAY_LONG[wd]}: {status === 'validated' ? '⭐ validada' : status === 'done' ? '⏳ feita, aguardando o selo' : 'ainda não marcada'}
          </p>
        </div>
      </div>
      {editable && (
        <div className="flex flex-col gap-3">
          {start !== null && (
            <div className="flex flex-wrap gap-2" role="group" aria-label="Ajustar horário">
              <button className="btn btn-ghost" onClick={() => onMove(wd, start - 15)}>−15 min</button>
              <button className="btn btn-ghost" onClick={() => onMove(wd, start + 15)}>+15 min</button>
            </div>
          )}
          <div>
            <p className="mb-1 text-sm font-semibold">Mover {WEEKDAY_LONG[wd].toLowerCase()} para…</p>
            <div className="flex flex-wrap gap-2">
              {WEEKDAYS.filter((d) => d !== wd).map((d) => (
                <button key={d} className="chip" disabled={t.weekdays.includes(d)} style={{ opacity: t.weekdays.includes(d) ? 0.45 : 1 }} onClick={() => { onMove(d, start); onClose() }}>
                  {WEEKDAY_SHORT[d]}
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-muted">As mudanças valem para todas as semanas.</p>
          </div>
          <button className="btn btn-gold" onClick={onEdit}>Editar tarefa</button>
        </div>
      )}
    </Modal>
  )
}

const KINDS: RoutineKind[] = ['wake', 'school', 'work', 'meal', 'free', 'other', 'sleep']

function RoutineEditor({ routine, readOnly, onClose }: { routine?: RoutineBlock; readOnly: boolean; onClose: () => void }) {
  const f = useFamily()
  const { toast } = useSession()
  const [memberId, setMember] = useState(routine?.memberId ?? f.members[0]?.id)
  const [kind, setKind] = useState<RoutineKind>(routine?.kind ?? 'free')
  const [label, setLabel] = useState(routine?.label ?? '')
  const [days, setDays] = useState<Weekday[]>(routine?.weekdays ?? [1, 2, 3, 4, 5])
  const [start, setStart] = useState(routine?.start ?? '14:00')
  const [end, setEnd] = useState(routine?.end ?? '15:00')
  const who = f.byId.get(memberId)
  if (readOnly && routine) {
    const info = ROUTINE_INFO[routine.kind]
    return (
      <Modal title={routine.label || info.label} onClose={onClose}>
        <p className="text-lg">
          <span aria-hidden="true">{info.emoji}</span> <b>{who?.name}</b> · {formatTime(routine.start)} às {formatTime(routine.end)}
        </p>
        <p className="text-muted">{routine.weekdays.map((d) => WEEKDAY_SHORT[d]).join(', ')}</p>
      </Modal>
    )
  }
  return (
    <Modal title={routine ? 'Editar rotina' : 'Nova rotina'} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <fieldset>
          <legend className="mb-1 text-sm font-semibold">De quem</legend>
          <div className="flex flex-wrap gap-2">
            {f.members.map((m) => (
              <button key={m.id} className="chip pl-1" aria-pressed={memberId === m.id} onClick={() => setMember(m.id)}>
                <Avatar member={m} size={32} /> {m.name}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="mb-1 text-sm font-semibold">O quê</legend>
          <div className="flex flex-wrap gap-2">
            {KINDS.map((k) => (
              <button key={k} className="chip" aria-pressed={kind === k} onClick={() => setKind(k)}>
                {ROUTINE_INFO[k].emoji} {ROUTINE_INFO[k].label}
              </button>
            ))}
          </div>
        </fieldset>
        <label>
          <span className="mb-1 block text-sm font-semibold">Nome (opcional)</span>
          <input className="field" value={label} maxLength={30} onChange={(e) => setLabel(e.target.value)} placeholder={`Ex.: ${kind === 'other' ? 'Natação' : ROUTINE_INFO[kind].label}`} />
        </label>
        <fieldset>
          <legend className="mb-1 text-sm font-semibold">Dias</legend>
          <div className="flex flex-wrap gap-2">
            {WEEKDAYS.map((d) => (
              <button key={d} className="chip min-w-14 justify-center" aria-pressed={days.includes(d)} onClick={() => setDays((x) => (x.includes(d) ? x.filter((y) => y !== d) : [...x, d]))}>
                {WEEKDAY_SHORT[d]}
              </button>
            ))}
          </div>
        </fieldset>
        <div className="flex flex-wrap gap-3">
          <label className="flex items-center gap-2">Início <input type="time" step={900} className="field w-32" value={start} onChange={(e) => setStart(e.target.value)} /></label>
          <label className="flex items-center gap-2">Fim <input type="time" step={900} className="field w-32" value={end} onChange={(e) => setEnd(e.target.value)} /></label>
        </div>
        {minutes(end) <= minutes(start) && <p className="text-sm text-muted">O fim é antes do início: o bloco atravessa a meia-noite (como o sono).</p>}
        <div className="flex gap-3">
          <button
            className="btn btn-gold flex-1"
            disabled={!days.length || !memberId}
            onClick={async () => {
              await saveRoutine({ ...routine, memberId, kind, label: label.trim() || undefined, weekdays: [...days].sort(), start, end })
              toast('Rotina salva.')
              onClose()
            }}
          >
            Salvar
          </button>
          {routine && (
            <button className="btn btn-ghost" onClick={async () => { await deleteRoutine(routine.id); toast('Rotina removida.'); onClose() }}>
              Remover
            </button>
          )}
        </div>
      </div>
    </Modal>
  )
}

/** Lista do dia agrupada por pessoa (celular). */
function DayList({ date, memberIds, onTask }: { date: string; memberIds: string[]; onTask: (t: Task) => void }) {
  const f = useFamily()
  const wd = isoWeekday(date)
  const occ = occurrencesFor(date, f.tasks, f.completions)
  return (
    <div className="flex flex-col gap-3">
      {memberIds.map((id) => {
        const m = f.byId.get(id)!
        const items = [
          ...f.routines
            .filter((r) => r.memberId === id && r.weekdays.includes(wd) && r.kind !== 'sleep')
            .map((r) => ({ key: r.id, time: r.start, emoji: ROUTINE_INFO[r.kind].emoji, title: `${r.label || ROUTINE_INFO[r.kind].label} até ${formatTime(r.end)}`, task: undefined as Task | undefined })),
          ...occ
            .filter((o) => o.forIds.includes(id))
            .map((o) => ({ key: o.task.id, time: o.task.time ?? '99:99', emoji: o.task.emoji, title: o.task.title, task: o.task, st: o.completion?.status })),
        ].sort((a, b) => a.time.localeCompare(b.time))
        return (
          <section key={id} className="plaque p-3" style={{ borderLeft: `6px solid ${heroColor(m).solid}` }}>
            <h3 className="mb-2 flex items-center gap-2 font-bold"><Avatar member={m} size={36} /> {m.name}</h3>
            <ul className="flex flex-col">
              {items.map((it) => (
                <li key={it.key}>
                  <button disabled={!it.task} onClick={() => it.task && onTask(it.task)} className="flex min-h-12 w-full items-center gap-3 rounded-xl px-2 text-left enabled:hover:bg-wait/60">
                    <span className="w-12 text-sm font-bold tabular-nums text-muted">{it.time === '99:99' ? '—' : formatTime(it.time)}</span>
                    <span aria-hidden="true" className="text-xl">{it.emoji}</span>
                    <span className={it.task ? 'font-semibold' : 'text-muted'}>{it.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
