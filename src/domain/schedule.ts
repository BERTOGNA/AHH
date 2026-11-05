// "Tarefas do dia" calculadas sob demanda a partir das recorrências + o que já foi registrado.
import type { Completion, ISODate, Member, RoutineBlock, RoutineKind, Task } from '../db/types'
import { addDays, isoWeekday, minutes } from '../lib/date'

export interface Occurrence {
  task: Task
  date: ISODate
  slot: string // individual: id do membro; shared/household: "all"
  forIds: string[] // de quem é a tarefa (household: [] = qualquer um)
  completion?: Completion
}

export const completionId = (taskId: string, date: ISODate, slot: string) => `${taskId}|${date}|${slot}`

export function occurrencesFor(date: ISODate, tasks: Task[], completions: Completion[]): Occurrence[] {
  const wd = isoWeekday(date)
  const byId = new Map(completions.filter((c) => c.date === date).map((c) => [c.id, c]))
  const out: Occurrence[] = []
  const push = (task: Task) => {
    if (task.kind === 'individual') {
      for (const m of task.assigneeIds) {
        out.push({ task, date, slot: m, forIds: [m], completion: byId.get(completionId(task.id, date, m)) })
      }
    } else {
      out.push({
        task, date, slot: 'all', forIds: task.kind === 'shared' ? task.assigneeIds : [],
        completion: byId.get(completionId(task.id, date, 'all')),
      })
    }
  }
  for (const task of tasks) {
    if (!task.active) continue
    const ex = task.exceptions ?? []
    // Ocorrência normal do dia (a menos que tenha sido dispensada ou movida só nesta semana)
    const own = ex.find((e) => e.date === date)
    if (task.weekdays.includes(wd) && !own?.skip && !own?.to) push(own?.time ? { ...task, time: own.time } : task)
    // Ocorrências trazidas de outro dia só nesta semana
    for (const e of ex) if (e.to === date && !e.skip) push(e.time ? { ...task, time: e.time } : task)
  }
  return out.sort(byTime)
}

export function byTime(a: Occurrence, b: Occurrence) {
  const ta = a.task.time ?? '99:99'
  const tb = b.task.time ?? '99:99'
  return ta.localeCompare(tb) || a.task.title.localeCompare(b.task.title)
}

/** Tarefas do membro no dia (individuais e em dupla). Tarefas do lar ficam em "Chamados do Lar". */
export function memberDay(memberId: string, occ: Occurrence[]): Occurrence[] {
  return occ.filter((o) => o.forIds.includes(memberId))
}

/** Chamados do Lar abertos ou feitos por este membro. */
export function householdDay(occ: Occurrence[]): Occurrence[] {
  return occ.filter((o) => o.task.kind === 'household')
}

/** XP planejado para uma semana (base da meta da missão). */
export function plannedWeekXp(tasks: Task[]): number {
  return tasks
    .filter((t) => t.active)
    .reduce((s, t) => s + t.xp * t.weekdays.length * (t.kind === 'household' ? 1 : t.assigneeIds.length), 0)
}

// ---------- Rotina ----------

/** O bloco de rotina ativo de um membro num momento (sono cruza a meia-noite). */
export function routineAt(memberId: string, date: ISODate, minute: number, routines: RoutineBlock[]): RoutineBlock | undefined {
  const wd = isoWeekday(date)
  const yesterday = isoWeekday(addDays(date, -1))
  const mine = routines.filter((r) => r.memberId === memberId)
  // Blocos mais específicos (curtos) ganham dos longos.
  const hits = mine.filter((r) => {
    const s = minutes(r.start)
    const e = minutes(r.end)
    if (e > s) return r.weekdays.includes(wd) && minute >= s && minute < e
    return (r.weekdays.includes(wd) && minute >= s) || (r.weekdays.includes(yesterday) && minute < e)
  })
  return hits.sort((a, b) => span(a) - span(b))[0]
}

const span = (r: RoutineBlock) => {
  const d = minutes(r.end) - minutes(r.start)
  return d > 0 ? d : d + 1440
}

export const ROUTINE_INFO: Record<RoutineKind, { emoji: string; label: string }> = {
  wake: { emoji: '⏰', label: 'Acordando' },
  school: { emoji: '🏫', label: 'Escola' },
  work: { emoji: '💼', label: 'Trabalho' },
  meal: { emoji: '🍽️', label: 'Refeição' },
  free: { emoji: '🎮', label: 'Tempo livre' },
  sleep: { emoji: '😴', label: 'Dormindo' },
  other: { emoji: '📌', label: 'Compromisso' },
}

export function statusAt(memberId: string, date: ISODate, minute: number, routines: RoutineBlock[]) {
  const r = routineAt(memberId, date, minute, routines)
  if (!r) return { emoji: '🏠', label: 'Em casa', kind: 'home' as const }
  const info = ROUTINE_INFO[r.kind]
  return { emoji: info.emoji, label: r.label || info.label, kind: r.kind }
}

/** Faixas "✦ Juntos": quando ≥3 pessoas estão em casa e acordadas (sem escola/trabalho/sono). */
export function togetherRanges(date: ISODate, members: Member[], routines: RoutineBlock[], from = 6 * 60, to = 22 * 60) {
  const need = Math.min(3, members.length)
  const ranges: { start: number; end: number }[] = []
  let open: number | null = null
  for (let m = from; m <= to; m += 15) {
    const free = members.filter((mem) => {
      const r = routineAt(mem.id, date, m, routines)
      return !r || r.kind === 'free' || r.kind === 'meal' || r.kind === 'other'
    }).length
    const ok = m < to && free >= need
    if (ok && open === null) open = m
    if (!ok && open !== null) {
      if (m - open >= 60) ranges.push({ start: open, end: m })
      open = null
    }
  }
  return ranges
}
