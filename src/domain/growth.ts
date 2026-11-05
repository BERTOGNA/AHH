// "Prontos para o próximo passo": quando uma criança já domina uma tarefa, sugerir um desafio novo.
import type { Completion, Member, Task } from '../db/types'
import { TEMPLATES, type TaskTemplate } from '../data/templates'
import { addDays } from '../lib/date'

export interface GrowthIdea {
  member: Member
  mastered: string // título da tarefa dominada
  times: number
  next: TaskTemplate
}

/** Validada ≥ `min` vezes nos últimos 14 dias → sugere a próxima sugestão da faixa etária que a criança ainda não faz. */
export function growthIdeas(members: Member[], tasks: Task[], completions: Completion[], todayKey: string, min = 8): GrowthIdea[] {
  const since = addDays(todayKey, -13)
  const out: GrowthIdea[] = []
  for (const m of members.filter((x) => x.role !== 'adult')) {
    const mine = completions.filter((c) => c.status === 'validated' && c.memberIds.includes(m.id) && c.date >= since && c.date <= todayKey)
    const counts = new Map<string, number>()
    for (const c of mine) counts.set(c.title, (counts.get(c.title) ?? 0) + 1)
    const best = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]
    if (!best || best[1] < min) continue
    const has = new Set(tasks.filter((t) => t.active && t.assigneeIds.includes(m.id)).map((t) => t.title))
    const next = TEMPLATES[m.role].find((t) => !has.has(t.title))
    if (next) out.push({ member: m, mastered: best[0], times: best[1], next })
  }
  return out
}
