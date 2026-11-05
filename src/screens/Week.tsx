// Semana do Reino: a rotina de todos numa visão única, para ver onde os horários se cruzam.
import { go } from '../router'
import { RoutineIcon } from '../components/RoutineIcon'
import { TaskArt } from '../components/taskart/TaskArt'
import { Icon } from '../components/Icon'
import { useState } from 'react'
import type { RoutineBlock, RoutineKind, Task, Weekday } from '../db/types'
import { useCurrent, useFamily, useSession } from '../state'
import { WeekGrid, LaneLegend, useWide } from '../components/WeekGrid'
import { Screen } from '../components/Screen'
import { Modal } from '../components/Modal'
import { TaskEditor } from '../components/TaskEditor'
import { Avatar } from '../components/Avatar'
import { heroColor, heroTint } from '../components/hero'
import { clearException, clearTimeOff, deleteRoutine, saveRoutine, saveTask, setException, setTimeOff as applyTimeOff } from '../db/actions'
import { occurrencesFor, ROUTINE_INFO, routineOn } from '../domain/schedule'
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
  const [focus, setFocus] = useState<string | null>(null)
  const [timeOff, setTimeOff] = useState(false)
  const [taskDetail, setTaskDetail] = useState<{ task: Task; date: string } | null>(null)
  const [editTask, setEditTask] = useState<{ task?: Task } | null>(null)
  const [routine, setRoutine] = useState<RoutineBlock | 'new' | 'compromisso' | null>(null)
  const [pendingMove, setPendingMove] = useState<{ task: Task; from: string; to: string; startMin: number | null } | null>(null)

  const lanes = f.members.filter((m) => !hidden.includes(m.id))
  const dates = weekDates(anchor)
  const teenId = me?.role === 'teen' ? me.id : undefined
  const canEdit = (item: { task?: Task; routine?: RoutineBlock }) =>
    Boolean(adultId) || Boolean(teenId && item.task?.assigneeIds.includes(teenId))

  function shiftWeek(n: number) {
    const a = n === 0 ? weekStart(today()) : addDays(weekStart(anchor), 7 * n)
    setAnchor(a)
    setDay(n === 0 ? today() : addDays(a, isoWeekday(day) - 1))
    if (focus) setFocus(n === 0 ? today() : addDays(a, isoWeekday(focus) - 1))
  }

  /** Tarefas perguntam o alcance (só nesta semana / todas); rotinas mudam sempre para todas as semanas. */
  async function move(item: { task?: Task; routine?: RoutineBlock }, from: string, to: string, startMin: number | null) {
    if (item.task) {
      setPendingMove({ task: f.tasks.find((t) => t.id === item.task!.id) ?? item.task, from, to, startMin })
      return
    }
    const fromWd = isoWeekday(from)
    const toWd = isoWeekday(to)
    const swapDay = (days: Weekday[]) => (fromWd === toWd || days.includes(toWd) ? days : [...days.filter((d) => d !== fromWd), toWd].sort())
    if (item.routine && startMin !== null) {
      const r = item.routine
      const delta = startMin - minutes(r.start)
      await saveRoutine({ ...r, ...(r.date ? { date: to, weekdays: [toWd] } : { weekdays: swapDay(r.weekdays) }), start: hhmm(minutes(r.start) + delta), end: hhmm(minutes(r.end) + delta) })
      toast(r.date ? `Compromisso movido: ${WEEKDAY_SHORT[toWd]} ${formatTime(hhmm(startMin))}` : `Rotina ajustada: ${formatTime(hhmm(startMin))} (todas as semanas)`)
    }
  }

  return (
    <Screen
      title="Semana do Reino"
      subtitle={`${formatDayMonth(dates[0])} a ${formatDayMonth(dates[6])}`}
      actions={
        <div className="flex gap-1">
          <button className="btn btn-ghost h-12 w-12 p-0" aria-label="Semana anterior" onClick={() => shiftWeek(-1)}><Icon name="chevron-left" size={22} /></button>
          <button className="btn btn-ghost h-12 px-3" onClick={() => shiftWeek(0)}>Hoje</button>
          <button className="btn btn-ghost h-12 w-12 p-0" aria-label="Próxima semana" onClick={() => shiftWeek(1)}><Icon name="chevron-right" size={22} /></button>
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
            style={!hidden.includes(m.id) ? { background: heroTint(m), color: 'var(--color-ink)', borderColor: heroColor(m).solid } : undefined}
          >
            <Avatar member={m} size={32} /> {m.name}
          </button>
        ))}
        {adultId && (
          <span className="flex w-full flex-wrap gap-2 sm:ml-auto sm:w-auto">
            <button className="btn btn-primary h-12 min-h-12" onClick={() => setEditTask({})}><Icon name="plus" size={18} strokeWidth={2.25} /> Tarefa</button>
            <button className="btn btn-ghost h-12 min-h-12" onClick={() => setRoutine('new')}><Icon name="plus" size={18} strokeWidth={2.25} /> Rotina</button>
            <button className="btn btn-ghost h-12 min-h-12" onClick={() => setRoutine('compromisso')}><Icon name="calendar" size={18} /> Compromisso</button>
            <button className="btn btn-ghost h-12 min-h-12" onClick={() => setTimeOff(true)}><Icon name="sun" size={18} /> Férias / folga</button>
            <button className="btn btn-ghost h-12 min-h-12" onClick={() => go('/quadro')}><Icon name="list" size={18} /> Imprimir quadro</button>
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
                className={`relative h-12 flex-1 rounded-xl text-sm font-bold ${d === day ? 'bg-night text-ivory ring-1 ring-gold-light/40' : 'bg-surface'}`}
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

      {wide && focus && (
        <div className="mb-3 flex items-center gap-3">
          <button className="btn btn-secondary h-12" onClick={() => setFocus(null)}>
            <Icon name="grid" size={18} /> Ver a semana
          </button>
          <span className="flex gap-1" role="group" aria-label="Outro dia">
            {dates.map((d) => (
              <button key={d} className="chip min-w-14 justify-center" aria-pressed={d === focus} onClick={() => setFocus(d)}>
                {WEEKDAY_SHORT[isoWeekday(d)]}
              </button>
            ))}
          </span>
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
          focusDay={focus ?? undefined}
          onDayTap={(d) => setFocus(d)}
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
          <p className="text-sm text-muted">Dica: toque no nome de um dia para vê-lo em detalhe; segure e arraste uma tarefa para mudar dia ou horário.</p>
        )}
      </div>

      {timeOff && <TimeOff onClose={() => setTimeOff(false)} />}
      {pendingMove && (
        <MoveScope
          move={pendingMove}
          onClose={() => setPendingMove(null)}
          onDone={(msg, undo) => {
            setPendingMove(null)
            toast(msg, undo ? { label: 'Desfazer', run: undo } : undefined)
          }}
        />
      )}
      {taskDetail && (
        <TaskDetail
          task={taskDetail.task}
          date={taskDetail.date}
          editable={canEdit({ task: taskDetail.task })}
          onEdit={() => {
            setEditTask({ task: taskDetail.task })
            setTaskDetail(null)
          }}
          onMove={(toWd, startMin) => {
            void move({ task: taskDetail.task }, taskDetail.date, addDays(weekStart(taskDetail.date), toWd - 1), startMin)
            setTaskDetail(null)
          }}
          onClose={() => setTaskDetail(null)}
        />
      )}
      {editTask && (
        <TaskEditor task={editTask.task} teenId={adultId ? undefined : teenId} presetAssignee={teenId} onClose={() => setEditTask(null)} />
      )}
      {routine && (
        <RoutineEditor
          routine={routine === 'new' || routine === 'compromisso' ? undefined : routine}
          oneOff={routine === 'compromisso' ? (wide ? anchor : day) : undefined}
          readOnly={!adultId}
          onClose={() => setRoutine(null)}
        />
      )}
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
  const shown = occ[0]?.task ?? t // pode ter horário só deste dia
  const start = shown.time ? minutes(shown.time) : null
  const ex = (t.exceptions ?? []).find((e) => e.date === date || e.to === date)
  const { toast } = useSession()
  const wd = isoWeekday(date)
  return (
    <Modal title={t.title} onClose={onClose}>
      <div className="mb-4 flex items-center gap-3">
        <TaskArt emoji={t.emoji} size={56} />
        <div>
          <p className="font-semibold">{who}</p>
          <p className="text-muted">
            {shown.time ? formatTime(shown.time) : 'Qualquer hora'} · {t.weekdays.map((d) => WEEKDAY_SHORT[d]).join(', ')} · {t.xp} XP
          </p>
          <p className="text-sm text-muted">
            {WEEKDAY_LONG[wd]}: {status === 'validated' ? 'validada' : status === 'done' ? 'feita, aguardando o selo' : 'ainda não marcada'}
          </p>
          {ex && <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-wait px-2 py-0.5 text-xs font-semibold text-gold-deep"><Icon name="pencil" size={12} /> Ajustada só nesta semana</p>}
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
                <button key={d} className="chip" onClick={() => { onMove(d, start); onClose() }}>
                  {WEEKDAY_SHORT[d]}
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-muted">Você escolhe se vale só nesta semana ou para todas.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {!status && !ex && (
              <button
                className="btn btn-ghost"
                onClick={async () => {
                  await setException(t.id, { date, skip: true })
                  toast(`${t.title}: ${WEEKDAY_LONG[wd].toLowerCase()} não precisa.`, { label: 'Desfazer', run: () => void clearException(t.id, date) })
                  onClose()
                }}
              >
                <Icon name="moon" size={18} /> Neste dia não precisa
              </button>
            )}
            {ex && (
              <button className="btn btn-ghost" onClick={async () => { await clearException(t.id, ex.date); toast('De volta ao combinado de sempre.'); onClose() }}>
                <Icon name="undo" size={18} /> Voltar ao normal
              </button>
            )}
            <button className="btn btn-primary flex-1" onClick={onEdit}>Editar tarefa</button>
          </div>
        </div>
      )}
    </Modal>
  )
}

/** Alcance de uma mudança de dia/horário: só nesta semana (exceção) ou todas as semanas (recorrência). */
function MoveScope({ move, onClose, onDone }: {
  move: { task: Task; from: string; to: string; startMin: number | null }
  onClose: () => void
  onDone: (msg: string, undo?: () => void) => void
}) {
  const { task, from, to, startMin } = move
  const prev = task.exceptions ?? []
  // Se a ocorrência já tinha sido trazida de outro dia, a exceção é da data original.
  const origin = prev.find((e) => e.to === from)?.date ?? from
  const time = startMin === null ? undefined : hhmm(startMin)
  const label = `${WEEKDAY_SHORT[isoWeekday(to)]}${time ? ` ${formatTime(time)}` : ''}`

  const toWd = isoWeekday(to)
  const alreadyThere = to !== origin && task.weekdays.includes(toWd) && !prev.some((e) => e.date === to && (e.skip || e.to))

  async function once() {
    if (alreadyThere) {
      // O dia de destino já tem esta tarefa: mover só nesta semana = o dia de origem fica livre.
      await setException(task.id, { date: origin, skip: true })
      onDone(`${task.title}: ${WEEKDAY_SHORT[toWd]} já tinha; ${WEEKDAY_SHORT[isoWeekday(origin)]} fica livre nesta semana.`, () => void saveTask({ ...task, exceptions: prev }))
      return
    }
    await setException(task.id, { date: origin, to: to !== origin ? to : undefined, time })
    onDone(`${task.title}: ${label}, só nesta semana.`, () => void saveTask({ ...task, exceptions: prev }))
  }
  async function always() {
    const fromWd = isoWeekday(origin)
    const days = fromWd === toWd ? task.weekdays : [...new Set([...task.weekdays.filter((d) => d !== fromWd), toWd])].sort()
    await saveTask({ ...task, weekdays: days, time: time ?? task.time, exceptions: prev.filter((e) => e.date !== origin) })
    onDone(`${task.title}: ${label}, todas as semanas.`, () => void saveTask(task))
  }

  return (
    <Modal title="Mudar só nesta semana?" onClose={onClose}>
      <p className="mb-4 text-muted">
        <b className="text-ink">{task.title}</b> vai para <b className="text-ink">{label}</b>.
        {alreadyThere && <> Esse dia já tem esta tarefa: {WEEKDAY_SHORT[isoWeekday(origin)]} fica sem ela.</>}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <button className="btn btn-secondary h-16 flex-col gap-0" onClick={once}>
          <span>Só nesta semana</span>
          <span className="text-xs font-medium opacity-80">semana que vem volta ao normal</span>
        </button>
        <button className="btn btn-primary h-16 flex-col gap-0" onClick={always} autoFocus>
          <span>Todas as semanas</span>
          <span className="text-xs font-medium opacity-80">muda o combinado</span>
        </button>
      </div>
    </Modal>
  )
}

/** Férias / folga: escolhe período, pessoas e o que pausa (escola, trabalho). Nada é apagado. */
function TimeOff({ onClose }: { onClose: () => void }) {
  const f = useFamily()
  const { toast } = useSession()
  const [from, setFrom] = useState(today())
  const [to, setTo] = useState(addDays(today(), 4))
  const [who, setWho] = useState<string[]>(f.members.filter((m) => m.role !== 'adult').map((m) => m.id))
  const [kinds, setKinds] = useState<('school' | 'work')[]>(['school'])
  const valid = who.length > 0 && kinds.length > 0 && from <= to
  const toggle = <T,>(xs: T[], x: T) => (xs.includes(x) ? xs.filter((y) => y !== x) : [...xs, x])
  return (
    <Modal title="Férias / folga" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <p className="text-muted">No período, a escola e/ou o trabalho saem da agenda, junto com as tarefas de dia de aula. O resto da rotina continua.</p>
        <div className="flex flex-wrap gap-3">
          <label className="flex items-center gap-2">De <input type="date" className="field w-44" value={from} onChange={(e) => e.target.value && setFrom(e.target.value)} /></label>
          <label className="flex items-center gap-2">Até <input type="date" className="field w-44" value={to} onChange={(e) => e.target.value && setTo(e.target.value)} /></label>
        </div>
        {from > to && <p className="text-sm font-semibold" role="status">A data “Até” precisa ser igual ou depois de “De”.</p>}
        <fieldset>
          <legend className="mb-1 text-sm font-semibold">Quem está de folga</legend>
          <div className="flex flex-wrap gap-2">
            {f.members.map((m) => (
              <button key={m.id} className="chip pl-1" aria-pressed={who.includes(m.id)} onClick={() => setWho((x) => toggle(x, m.id))}>
                <Avatar member={m} size={32} /> {m.name}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="mb-1 text-sm font-semibold">O que pausa</legend>
          <div className="flex flex-wrap gap-2">
            <button className="chip" aria-pressed={kinds.includes('school')} onClick={() => setKinds((x) => toggle(x, 'school'))}>Escola</button>
            <button className="chip" aria-pressed={kinds.includes('work')} onClick={() => setKinds((x) => toggle(x, 'work'))}>Trabalho</button>
          </div>
        </fieldset>
        <div className="flex flex-wrap gap-3">
          <button
            className="btn btn-primary flex-1"
            disabled={!valid}
            onClick={async () => {
              const n = await applyTimeOff(who, from, to, kinds)
              toast(`Folga marcada: ${n === 1 ? '1 dia' : `${n} dias`}. Boas férias!`)
              onClose()
            }}
          >
            Marcar folga
          </button>
          <button
            className="btn btn-ghost"
            disabled={!who.length || from > to}
            onClick={async () => {
              await clearTimeOff(who, from, to)
              toast('Folga desfeita: de volta ao combinado de sempre.')
              onClose()
            }}
          >
            Desfazer neste período
          </button>
        </div>
      </div>
    </Modal>
  )
}

const KINDS: RoutineKind[] = ['wake', 'school', 'work', 'meal', 'free', 'other', 'sleep']

function RoutineEditor({ routine, readOnly, onClose, oneOff }: { routine?: RoutineBlock; readOnly: boolean; onClose: () => void; oneOff?: string }) {
  const f = useFamily()
  const { toast } = useSession()
  const [memberId, setMember] = useState(routine?.memberId ?? f.members[0]?.id)
  const [kind, setKind] = useState<RoutineKind>(routine?.kind ?? (oneOff ? 'other' : 'free'))
  const [date, setDate] = useState<string | undefined>(routine?.date ?? oneOff)
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
          <span aria-hidden="true" className="inline-block align-middle"><RoutineIcon kind={routine.kind} size={22} /></span> <b>{who?.name}</b> · {formatTime(routine.start)} às {formatTime(routine.end)}
        </p>
        <p className="text-muted">{routine.date ? `Só em ${formatDayMonth(routine.date)}` : routine.weekdays.map((d) => WEEKDAY_SHORT[d]).join(', ')}</p>
      </Modal>
    )
  }
  return (
    <Modal title={routine ? (routine.date ? 'Editar compromisso' : 'Editar rotina') : oneOff ? 'Novo compromisso' : 'Nova rotina'} onClose={onClose}>
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
                <RoutineIcon kind={k} size={18} /> {ROUTINE_INFO[k].label}
              </button>
            ))}
          </div>
        </fieldset>
        <label>
          <span className="mb-1 block text-sm font-semibold">Nome (opcional)</span>
          <input className="field" value={label} maxLength={30} onChange={(e) => setLabel(e.target.value)} placeholder={`Ex.: ${kind === 'other' ? 'Natação' : ROUTINE_INFO[kind].label}`} />
        </label>
        <fieldset>
          <legend className="mb-1 text-sm font-semibold">Quando</legend>
          <div className="mb-2 flex flex-wrap gap-2">
            <button className="chip" aria-pressed={!date} onClick={() => setDate(undefined)}>Toda semana</button>
            <button className="chip" aria-pressed={Boolean(date)} onClick={() => setDate(date ?? today())}>Só em uma data</button>
            {date && <input type="date" className="field w-44" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} aria-label="Data do compromisso" />}
          </div>
          <div className={`flex flex-wrap gap-2 ${date ? 'hidden' : ''}`}>
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
            className="btn btn-primary flex-1"
            disabled={(!date && !days.length) || !memberId}
            onClick={async () => {
              await saveRoutine({ ...routine, memberId, kind, label: label.trim() || undefined, weekdays: date ? [isoWeekday(date)] : [...days].sort(), date, start, end })
              toast(date ? 'Compromisso salvo.' : 'Rotina salva.')
              onClose()
            }}
          >
            Salvar
          </button>
          {routine && (
            <button className="btn btn-ghost" onClick={async () => { await deleteRoutine(routine.id); toast(routine.date ? 'Compromisso removido.' : 'Rotina removida.'); onClose() }}>
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
  const occ = occurrencesFor(date, f.tasks, f.completions)
  return (
    <div className="flex flex-col gap-3">
      {memberIds.map((id) => {
        const m = f.byId.get(id)!
        const items = [
          ...f.routines
            .filter((r) => r.memberId === id && routineOn(r, date) && r.kind !== 'sleep')
            .map((r) => ({ key: r.id, time: r.start, emoji: '', kind: r.kind, title: `${r.label || ROUTINE_INFO[r.kind].label} até ${formatTime(r.end)}`, task: undefined as Task | undefined })),
          ...occ
            .filter((o) => o.forIds.includes(id))
            .map((o) => ({ key: o.task.id, time: o.task.time ?? '99:99', emoji: o.task.emoji, kind: undefined as RoutineKind | undefined, title: o.task.title, task: o.task })),
        ].sort((a, b) => a.time.localeCompare(b.time))
        return (
          <section key={id} className="card p-3" style={{ borderLeft: `6px solid ${heroColor(m).solid}` }}>
            <h3 className="mb-2 flex items-center gap-2 font-bold"><Avatar member={m} size={36} /> {m.name}</h3>
            <ul className="flex flex-col">
              {items.map((it) => (
                <li key={it.key}>
                  <button disabled={!it.task} onClick={() => it.task && onTask(it.task)} className="flex min-h-12 w-full items-center gap-3 rounded-xl px-2 text-left enabled:hover:bg-wait/60">
                    <span className="w-12 text-sm font-bold tabular-nums text-muted">{it.time === '99:99' ? '—' : formatTime(it.time)}</span>
                    <span aria-hidden="true" className="grid w-8 place-items-center">{it.kind ? <RoutineIcon kind={it.kind} size={22} /> : <TaskArt emoji={it.emoji} size={30} />}</span>
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
