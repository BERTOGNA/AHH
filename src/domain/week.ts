// Gera a primeira versão da semana a partir das respostas do assistente. Função pura.
import { uid } from '../lib/uid'
import type { HHMM, Member, Reward, Role, RoutineBlock, Task, Treatment, Weekday } from '../db/types'
import { TEMPLATES, WORK_TASK } from '../data/templates'
import { classById } from '../data/classes'
import { hhmm, minutes } from '../lib/date'

export interface WizardMember {
  key: string // id provisório (vira o id do membro)
  name: string
  age: number
  role: Role
  treatment: Treatment
  classId: string
  base: string
  wake: HHMM
  sleep: HHMM
  weekendWake: HHMM
  weekendSleep: HHMM
  occupation: 'school' | 'work' | 'home'
  occDays: Weekday[]
  occStart: HHMM
  occEnd: HHMM
}

/** Assinatura de uma tarefa escolhida: para criança/12 anos, `assignee` é o próprio membro. */
export interface WizardChore {
  templateId: string
  assignee: string // key do membro | 'both' (os dois adultos juntos) | 'lar' (qualquer um)
  weekdays: Weekday[]
}

export interface WizardAnswers {
  kingdomName: string
  parentTitle: 'rei' | 'pais' | 'guardioes'
  members: WizardMember[]
  chores: WizardChore[]
  rewards: { title: string; emoji: string; cost: number }[]
  missionId: string
}

export const roleForAge = (age: number): Role => (age >= 18 ? 'adult' : age >= 9 ? 'teen' : 'child')

export function defaultMember(key: string, i: number, name: string, age: number, treatment: Treatment): WizardMember {
  const role = roleForAge(age)
  const kid = role !== 'adult'
  return {
    key, name, age, role, treatment,
    classId: role === 'child' ? 'escudeiro' : role === 'teen' ? 'mago' : i === 0 ? 'tesoureiro' : 'alquimista',
    base: role === 'child' ? '🦄' : role === 'teen' ? '🧝‍♂️' : treatment === 'a' ? '🧙‍♀️' : '🧙‍♂️',
    wake: role === 'child' ? '07:00' : role === 'teen' ? '06:45' : '06:30',
    sleep: role === 'child' ? '20:30' : role === 'teen' ? '22:00' : '23:00',
    weekendWake: role === 'adult' ? '08:00' : '08:30',
    weekendSleep: role === 'child' ? '21:00' : role === 'teen' ? '23:00' : '23:30',
    occupation: kid ? 'school' : 'work',
    occDays: [1, 2, 3, 4, 5],
    occStart: kid ? '07:30' : '09:00',
    occEnd: kid ? '12:30' : '18:00',
  }
}

/** Escolhas padrão do passo "Quem cuida do quê": templates ✔, adultos alternados. */
export function defaultChores(members: WizardMember[]): WizardChore[] {
  const out: WizardChore[] = []
  const adults = members.filter((m) => m.role === 'adult')
  for (const m of members.filter((x) => x.role !== 'adult')) {
    for (const t of TEMPLATES[m.role].filter((t) => t.on)) out.push({ templateId: t.id, assignee: m.key, weekdays: t.weekdays })
  }
  TEMPLATES.adult.filter((t) => t.on).forEach((t, i) => {
    const assignee = t.household ? 'lar' : adults.length ? adults[i % adults.length].key : 'lar'
    out.push({ templateId: t.id, assignee, weekdays: t.weekdays })
  })
  return out
}

const id = uid
const ALL: Weekday[] = [1, 2, 3, 4, 5, 6, 7]

export function generateWeek(a: WizardAnswers, now = Date.now()) {
  const members: Member[] = a.members.map((m, i) => ({
    id: m.key, name: m.name.trim() || `Herói ${i + 1}`, role: m.role, age: m.age, treatment: m.treatment,
    classId: m.classId, kingdomRole: classById(m.classId).role, slot: (i % 4) as Member['slot'],
    avatar: { base: m.base, equipped: { chapeu: 'gorro_aprendiz', capa: 'capa_viagem' } },
    speech: m.role === 'child', order: i, createdAt: now,
  }))

  const routines: RoutineBlock[] = []
  for (const m of a.members) {
    const plus30 = (t: HHMM) => hhmm(minutes(t) + 30)
    routines.push({ id: id(), memberId: m.key, kind: 'wake', weekdays: [1, 2, 3, 4, 5], start: m.wake, end: plus30(m.wake) })
    routines.push({ id: id(), memberId: m.key, kind: 'wake', weekdays: [6, 7], start: m.weekendWake, end: plus30(m.weekendWake) })
    // Noites que antecedem dia útil (dom–qui) e noites de fim de semana (sex, sáb).
    routines.push({ id: id(), memberId: m.key, kind: 'sleep', weekdays: [7, 1, 2, 3, 4], start: m.sleep, end: m.wake })
    routines.push({ id: id(), memberId: m.key, kind: 'sleep', weekdays: [5, 6], start: m.weekendSleep, end: m.weekendWake })
    if (m.occupation !== 'home' && m.occDays.length) {
      routines.push({ id: id(), memberId: m.key, kind: m.occupation, weekdays: m.occDays, start: m.occStart, end: m.occEnd })
    }
    routines.push({ id: id(), memberId: m.key, kind: 'meal', label: 'Jantar em família', weekdays: ALL, start: '19:30', end: '20:00' })
  }

  const tasks: Task[] = []
  const adults = a.members.filter((m) => m.role === 'adult')
  const all = Object.values(TEMPLATES).flat()
  for (const c of a.chores) {
    const t = all.find((x) => x.id === c.templateId)
    if (!t || !c.weekdays.length) continue
    let kind: Task['kind'] = 'individual'
    let assigneeIds = [c.assignee]
    if (c.assignee === 'lar') {
      kind = 'household'
      assigneeIds = []
    } else if (c.assignee === 'both') {
      kind = 'shared'
      assigneeIds = adults.map((x) => x.key).slice(0, 2)
    } else if (t.sharedWithAdult && adults.length) {
      kind = 'shared'
      assigneeIds = [c.assignee, adults[adults.length - 1].key]
    }
    tasks.push({
      id: id(), title: t.title, emoji: t.emoji, speak: t.speak, category: t.category, kind, assigneeIds,
      weekdays: c.weekdays, time: t.time, duration: 30, xp: t.xp, active: true, createdAt: now,
    })
  }
  for (const m of adults) {
    if (m.occupation !== 'work' || !m.occDays.length) continue
    tasks.push({
      id: id(), ...WORK_TASK, kind: 'individual', assigneeIds: [m.key], weekdays: m.occDays, time: m.occStart,
      duration: Math.max(30, minutes(m.occEnd) - minutes(m.occStart)), active: true, createdAt: now,
    })
  }

  const rewards: Reward[] = a.rewards.map((r) => ({ id: id(), ...r, active: true, createdAt: now }))
  return { members, routines, tasks, rewards }
}
