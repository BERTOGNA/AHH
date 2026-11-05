import { describe, expect, it } from 'vitest'
import type { Completion, Thanks } from '../db/types'
import { levelOf, titleOf, xpForLevel } from './levels'
import { coinBalance, flamesOf, ledger, pendingXp, weekXp, xpOf } from './economy'
import { completionId, occurrencesFor, routineAt, togetherRanges } from './schedule'
import { newlyUnlocked } from './achievements'
import { missionGoal, stageOf } from '../data/missions'

const comp = (p: Partial<Completion> & { date: string; memberIds: string[] }): Completion => ({
  id: `${p.taskId ?? 't'}|${p.date}|${p.memberIds.join('+')}${Math.random()}`,
  taskId: 't', status: 'validated', xp: 10, title: 'x', emoji: '⭐', category: 'lar', kind: 'individual', doneAt: 0, ...p,
})

describe('níveis', () => {
  it('segue a curva do game design', () => {
    expect(xpForLevel(1)).toBe(0)
    expect(xpForLevel(2)).toBe(50)
    expect(xpForLevel(5)).toBe(350)
    expect(xpForLevel(10)).toBe(1350)
    expect(xpForLevel(50)).toBe(31850)
    expect(levelOf(0)).toMatchObject({ level: 1, into: 0, span: 50 })
    expect(levelOf(60)).toMatchObject({ level: 2, into: 10, span: 75 })
    expect(levelOf(31850 + 2500)).toMatchObject({ level: 50, legendStars: 2 })
    expect(titleOf(6, 'a')).toBe('Exploradora')
  })
})

describe('economia sem punição', () => {
  it('soma XP e moedas só de tarefas validadas', () => {
    const c = [comp({ date: '2026-11-02', memberIds: ['bia'], xp: 10 }), comp({ date: '2026-11-02', memberIds: ['bia'], xp: 5, status: 'done' })]
    const ev = ledger({ completions: c, thanks: [] })
    expect(xpOf('bia', ev)).toBe(10)
    expect(coinBalance('bia', ev, [])).toBe(2)
    expect(pendingXp('bia', c)).toBe(5)
  })
  it('tarefa em dupla dá XP integral aos dois', () => {
    const ev = ledger({ completions: [comp({ date: '2026-11-02', memberIds: ['a', 'b'], xp: 20, kind: 'shared' })], thanks: [] })
    expect(xpOf('a', ev)).toBe(20)
    expect(xpOf('b', ev)).toBe(20)
  })
  it('mentoria: +5 XP, no máximo 3 por dia', () => {
    const c = [1, 2, 3, 4].map((i) => comp({ id: `m${i}`, date: '2026-11-02', memberIds: ['bia'], helperId: 'leo' }))
    const ev = ledger({ completions: c, thanks: [] })
    expect(xpOf('leo', ev)).toBe(15)
    expect(xpOf('bia', ev)).toBe(40)
  })
  it('agradecimento: +2 para os dois nos 5 primeiros do dia', () => {
    const t: Thanks[] = Array.from({ length: 7 }, (_, i) => ({
      id: `t${i}`, fromId: 'ana', toId: 'bia', message: 'oi', emoji: '💖', date: '2026-11-02', createdAt: i, seen: false,
    }))
    const ev = ledger({ completions: [], thanks: t })
    expect(xpOf('ana', ev)).toBe(10)
    expect(xpOf('bia', ev)).toBe(10)
  })
  it('Semana Acesa com 5 chamas dá +15', () => {
    const c = ['02', '03', '04', '05', '06'].map((d) => comp({ date: `2026-11-${d}`, memberIds: ['leo'], xp: 10 }))
    const ev = ledger({ completions: c, thanks: [] })
    expect(xpOf('leo', ev)).toBe(65)
    expect(flamesOf('leo', '2026-11-04', c)).toEqual([true, true, true, true, true, false, false])
    expect(weekXp('2026-11-08', ev)).toBe(65)
  })
  it('monotonicidade: adicionar qualquer registro nunca diminui o XP de ninguém', () => {
    const ids = ['a', 'b', 'c']
    let completions: Completion[] = []
    let thanks: Thanks[] = []
    let prev = ids.map(() => 0)
    for (let i = 0; i < 300; i++) {
      const r = (n: number) => Math.floor(Math.random() * n)
      const date = `2026-11-0${1 + r(9)}`
      if (r(3) === 0) thanks = [...thanks, { id: `t${i}`, fromId: ids[r(3)], toId: ids[r(3)], message: '', emoji: '', date, createdAt: r(1000), seen: false }]
      else completions = [...completions, comp({ id: `c${i}`, date, memberIds: [ids[r(3)]], helperId: r(2) ? ids[r(3)] : undefined, xp: [5, 10, 20, 30][r(4)], status: r(4) ? 'validated' : 'done' })]
      const ev = ledger({ completions, thanks })
      expect(ev.every((e) => e.xp >= 0 && e.coins >= 0)).toBe(true)
      const now = ids.map((id) => xpOf(id, ev))
      now.forEach((x, k) => expect(x).toBeGreaterThanOrEqual(prev[k]))
      prev = now
    }
  })
  it('resgate devolvido não consome moedas', () => {
    const ev = ledger({ completions: [comp({ date: '2026-11-02', memberIds: ['bia'], xp: 30 })], thanks: [] })
    const base = { id: 'r', rewardId: 'x', memberId: 'bia', title: '', emoji: '', cost: 4, requestedAt: 0 }
    expect(coinBalance('bia', ev, [{ ...base, status: 'requested' }])).toBe(2)
    expect(coinBalance('bia', ev, [{ ...base, status: 'returned' }])).toBe(6)
  })
})

describe('agenda', () => {
  const task = { id: 'cama', title: 'Cama', emoji: '🛏️', category: 'lar' as const, kind: 'individual' as const, assigneeIds: ['bia'], weekdays: [1, 2] as (1 | 2)[], time: '07:00', duration: 15, xp: 5, active: true, createdAt: 0 }
  it('gera ocorrências pela recorrência e liga a marcação', () => {
    const done = comp({ id: completionId('cama', '2026-11-02', 'bia'), taskId: 'cama', date: '2026-11-02', memberIds: ['bia'], status: 'done' })
    const seg = occurrencesFor('2026-11-02', [task], [done])
    expect(seg).toHaveLength(1)
    expect(seg[0].completion?.status).toBe('done')
    expect(occurrencesFor('2026-11-04', [task], [])).toHaveLength(0) // quarta: não recorre
  })
  it('sono cruza a meia-noite e o bloco mais curto ganha', () => {
    const r = [
      { id: 's', memberId: 'bia', kind: 'sleep' as const, weekdays: [1, 2, 3, 4, 5, 6, 7] as (1 | 2 | 3 | 4 | 5 | 6 | 7)[], start: '20:30', end: '07:00' },
      { id: 'e', memberId: 'bia', kind: 'school' as const, weekdays: [1, 2, 3, 4, 5] as (1 | 2 | 3 | 4 | 5)[], start: '07:30', end: '12:30' },
    ]
    expect(routineAt('bia', '2026-11-03', 6 * 60, r)?.kind).toBe('sleep')
    expect(routineAt('bia', '2026-11-03', 21 * 60, r)?.kind).toBe('sleep')
    expect(routineAt('bia', '2026-11-03', 8 * 60, r)?.kind).toBe('school')
    expect(routineAt('bia', '2026-11-03', 15 * 60, r)).toBeUndefined()
  })
  it('marca faixas em que a família está junta', () => {
    const members = ['a', 'b', 'c', 'd'].map((id, i) => ({ id, order: i }) as never)
    const work = ['a', 'b', 'c', 'd'].map((m) => ({ id: m, memberId: m, kind: 'work' as const, weekdays: [1, 2, 3, 4, 5, 6, 7] as (1 | 2 | 3 | 4 | 5 | 6 | 7)[], start: '06:00', end: '18:00' }))
    expect(togetherRanges('2026-11-02', members, work)).toEqual([{ start: 18 * 60, end: 22 * 60 }])
  })
})

describe('missão e conquistas', () => {
  it('meta = 60% arredondada, entre 300 e 3000', () => {
    expect(missionGoal(1350)).toBe(800)
    expect(missionGoal(100)).toBe(300)
    expect(missionGoal(10000)).toBe(3000)
    expect(stageOf(0, 800)).toBe(0)
    expect(stageOf(400, 800)).toBe(2)
    expect(stageOf(900, 800)).toBe(4)
  })
  it('desbloqueia conquistas pelos próprios dados', () => {
    const c = [comp({ date: '2026-11-02', memberIds: ['bia'] })]
    expect(newlyUnlocked('bia', { completions: c, thanks: [], missions: [] }, [])).toEqual(['primeira_tarefa'])
    expect(newlyUnlocked('bia', { completions: c, thanks: [], missions: [] }, [{ memberId: 'bia', achievementId: 'primeira_tarefa', unlockedAt: 0, seen: true }])).toEqual([])
  })
  it('missão concluída conta para quem participou', () => {
    const c = Array.from({ length: 30 }, (_, i) => comp({ id: `c${i}`, date: '2026-11-03', memberIds: ['bia'], xp: 10 }))
    const d = { completions: c, thanks: [], missions: [{ weekKey: '2026-W45', templateId: 'jardim', goalXp: 300, reward: '', delivered: false }] }
    expect(newlyUnlocked('bia', d, [])).toContain('missao_1')
    expect(newlyUnlocked('leo', d, [])).not.toContain('missao_1')
  })
})

import { defaultChores, defaultMember, generateWeek } from './week'
import { plannedWeekXp } from './schedule'

describe('assistente → semana', () => {
  it('gera uma semana utilizável só com as sugestões', () => {
    const members = [
      defaultMember('ana', 0, 'Ana', 38, 'a'), defaultMember('bruno', 1, 'Bruno', 40, 'o'),
      defaultMember('leo', 2, 'Léo', 12, 'o'), defaultMember('bia', 3, 'Bia', 6, 'a'),
    ]
    const w = generateWeek({ kingdomName: 'R', parentTitle: 'rei', members, chores: defaultChores(members), rewards: [], missionId: 'jardim' })
    expect(w.members.map((m) => m.role)).toEqual(['adult', 'adult', 'teen', 'child'])
    // 6 anos: no máximo 5 tarefas por dia
    for (let d = 1; d <= 7; d++) {
      const n = w.tasks.filter((t) => t.assigneeIds.includes('bia') && t.weekdays.includes(d as 1)).length
      expect(n).toBeGreaterThanOrEqual(3)
      expect(n).toBeLessThanOrEqual(5)
    }
    expect(w.tasks.some((t) => t.kind === 'household')).toBe(true)
    expect(w.tasks.some((t) => t.kind === 'shared' && t.assigneeIds.includes('leo'))).toBe(true)
    expect(w.tasks.filter((t) => t.title === 'Expedição de trabalho')).toHaveLength(2)
    const xp = plannedWeekXp(w.tasks)
    expect(xp).toBeGreaterThan(900)
    expect(xp).toBeLessThan(2000)
  })
})

import { needsBackup } from '../components/BackupReminder'

describe('lembrete de backup', () => {
  const D = 86400000
  it('lembra só quando faz sentido', () => {
    const now = 100 * D
    expect(needsBackup({ demo: true, createdAt: 0 }, now)).toBe(false)
    expect(needsBackup({ demo: false, createdAt: now - 3 * D }, now)).toBe(false)
    expect(needsBackup({ demo: false, createdAt: now - 8 * D }, now)).toBe(true)
    expect(needsBackup({ demo: false, createdAt: 0, lastBackupAt: now - 10 * D }, now)).toBe(false)
    expect(needsBackup({ demo: false, createdAt: 0, lastBackupAt: now - 15 * D }, now)).toBe(true)
  })
})

describe('exceções só nesta semana', () => {
  const base = { id: 'mesa', title: 'Mesa', emoji: '🍽️', category: 'comida' as const, kind: 'individual' as const, assigneeIds: ['bia'], weekdays: [1, 2] as (1 | 2)[], time: '19:00', duration: 15, xp: 10, active: true, createdAt: 0 }
  it('"não precisa" tira só aquele dia, sem registro', () => {
    const t = { ...base, exceptions: [{ date: '2026-11-02', skip: true }] }
    expect(occurrencesFor('2026-11-02', [t], [])).toHaveLength(0)
    expect(occurrencesFor('2026-11-03', [t], [])).toHaveLength(1)
    expect(occurrencesFor('2026-11-09', [t], [])).toHaveLength(1) // semana seguinte volta ao normal
  })
  it('mover só nesta semana leva para outro dia e horário', () => {
    const t = { ...base, exceptions: [{ date: '2026-11-02', to: '2026-11-04', time: '18:00' }] }
    expect(occurrencesFor('2026-11-02', [t], [])).toHaveLength(0)
    const qua = occurrencesFor('2026-11-04', [t], [])
    expect(qua).toHaveLength(1)
    expect(qua[0].task.time).toBe('18:00')
    expect(occurrencesFor('2026-11-09', [t], [])[0].task.time).toBe('19:00')
  })
  it('só mudar o horário naquele dia', () => {
    const t = { ...base, exceptions: [{ date: '2026-11-03', time: '20:00' }] }
    expect(occurrencesFor('2026-11-03', [t], [])[0].task.time).toBe('20:00')
  })
})

describe('mover só nesta semana não duplica', () => {
  it('se o dia de destino já tem a tarefa, mostra uma só', () => {
    const t = { id: 'lic', title: 'Lição', emoji: '📚', category: 'estudo' as const, kind: 'individual' as const, assigneeIds: ['leo'], weekdays: [4, 5] as (4 | 5)[], time: '15:00', duration: 30, xp: 20, active: true, createdAt: 0,
      exceptions: [{ date: '2026-11-06', to: '2026-11-05' }] }
    expect(occurrencesFor('2026-11-05', [t], [])).toHaveLength(1)
    expect(occurrencesFor('2026-11-06', [t], [])).toHaveLength(0)
  })
})

import { growthIdeas } from './growth'

describe('prontos para o próximo passo', () => {
  it('sugere um desafio novo quando a criança domina uma tarefa', () => {
    const bia = { id: 'bia', role: 'child', name: 'Bia' } as never
    const cama = { id: 'cama', title: 'Arrumar a cama', assigneeIds: ['bia'], active: true } as never
    const many = Array.from({ length: 9 }, (_, i) => comp({ id: `x${i}`, date: `2026-11-0${1 + (i % 5)}`, memberIds: ['bia'], title: 'Arrumar a cama' }))
    const ideas = growthIdeas([bia], [cama], many, '2026-11-05')
    expect(ideas).toHaveLength(1)
    expect(ideas[0].next.title).not.toBe('Arrumar a cama')
    expect(growthIdeas([bia], [cama], many.slice(0, 5), '2026-11-05')).toHaveLength(0)
  })
})
