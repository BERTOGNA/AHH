// Rascunho do assistente: estado único, salvo em localStorage a cada passo (o PIN nunca é salvo).
import { defaultLook } from '../../components/portrait/look'
import type { Member, Weekday } from '../../db/types'
import { defaultChores, defaultMember, roleForAge, type WizardAnswers, type WizardChore, type WizardMember } from '../../domain/week'
import { DEFAULT_REWARDS } from '../../data/templates'
import { MISSIONS } from '../../data/missions'

export interface DraftReward {
  title: string
  emoji: string
  cost: number
  on: boolean
}

export interface Draft {
  step: number // 1..8
  kingdomName: string
  parentTitle: WizardAnswers['parentTitle']
  members: WizardMember[]
  weekendDiff: Record<string, boolean>
  chores: WizardChore[]
  choresFor: string // assinatura (keys + papéis) para a qual as tarefas foram calculadas
  rewards: DraftReward[]
  missionId: string
}

const KEY = 'reino:rascunho'

const uid = () => crypto.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`

export const signature = (members: WizardMember[]) => members.map((m) => `${m.key}:${m.role}`).join(',')

export function initialDraft(): Draft {
  const members = [
    defaultMember(uid(), 0, '', 38, 'a'),
    defaultMember(uid(), 1, '', 40, 'o'),
    defaultMember(uid(), 2, '', 12, 'o'),
    defaultMember(uid(), 3, '', 6, 'a'),
  ]
  return {
    step: 1,
    kingdomName: 'Reino de Aurora',
    parentTitle: 'rei',
    members,
    weekendDiff: {},
    chores: defaultChores(members),
    choresFor: signature(members),
    rewards: DEFAULT_REWARDS.map((r) => ({ ...r })),
    missionId: MISSIONS[0].id,
  }
}

export function loadDraft(): Draft | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const d = JSON.parse(raw) as Draft
    if (!Array.isArray(d.members) || d.members.length === 0 || typeof d.step !== 'number') return null
    return d
  } catch {
    return null
  }
}

export function saveDraft(d: Draft) {
  try {
    localStorage.setItem(KEY, JSON.stringify(d))
  } catch {
    /* armazenamento indisponível: o assistente segue sem rascunho */
  }
}

export function clearDraft() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* nada */
  }
}

export const PLACEHOLDERS = ['Ex.: Ana', 'Ex.: Bruno', 'Ex.: Léo', 'Ex.: Bia']

export const displayName = (m: WizardMember, i: number) => m.name.trim() || `Herói ${i + 1}`

export const ROLE_LABEL: Record<WizardMember['role'], string> = {
  adult: 'Adulto',
  teen: 'Aprendiz',
  child: 'Pequeno',
}

/** Membro provisório só para desenhar o Avatar. */
export function previewMember(m: WizardMember, i: number): Member {
  return {
    id: m.key, name: displayName(m, i), role: m.role, age: m.age, treatment: m.treatment, classId: m.classId,
    kingdomRole: '', slot: (i % 4) as Member['slot'],
    avatar: { base: m.base, look: m.look ?? defaultLook(m.role, m.treatment, i), equipped: { chapeu: 'gorro_aprendiz', capa: 'capa_viagem' } },
    speech: false, order: i, createdAt: 0,
  }
}

/** Ao mudar a idade, o papel pode mudar: refaz os padrões daquela pessoa, mantendo nome, idade e tratamento. */
export function withAge(m: WizardMember, i: number, age: number): WizardMember {
  const role = roleForAge(age)
  if (role === m.role) return { ...m, age }
  return { ...defaultMember(m.key, i, m.name, age, m.treatment) }
}

/** Fim de semana igual aos dias úteis quando o toggle está desligado. */
export function toAnswers(d: Draft): WizardAnswers {
  return {
    kingdomName: d.kingdomName.trim() || 'Reino de Aurora',
    parentTitle: d.parentTitle,
    members: d.members.map((m, i) => ({
      ...m,
      name: displayName(m, i),
      weekendWake: d.weekendDiff[m.key] ? m.weekendWake : m.wake,
      weekendSleep: d.weekendDiff[m.key] ? m.weekendSleep : m.sleep,
    })),
    chores: d.chores,
    rewards: d.rewards.filter((r) => r.on).map(({ title, emoji, cost }) => ({ title, emoji, cost })),
    missionId: d.missionId,
  }
}

export const toggleDay = (days: Weekday[], d: Weekday) =>
  (days.includes(d) ? days.filter((x) => x !== d) : [...days, d]).sort() as Weekday[]
