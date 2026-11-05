// Tipos do banco local. Datas "YYYY-MM-DD" (locais), horas "HH:MM", dias ISO 1=seg … 7=dom.

export type Role = 'adult' | 'teen' | 'child'
export type Weekday = 1 | 2 | 3 | 4 | 5 | 6 | 7
export type ISODate = string
export type HHMM = string
export type WeekKey = string
export type Treatment = 'o' | 'a'

import type { HeroLook } from '../components/portrait/look'

export type ItemSlot = 'chapeu' | 'ferramenta' | 'companheiro' | 'capa'

export interface Member {
  id: string
  name: string
  role: Role
  age: number
  treatment: Treatment // "o" ou "a": concorda títulos ("Explorador"/"Exploradora")
  classId: string
  kingdomRole: string // papel no reino, texto livre ("Guardiã do Tesouro")
  slot: 0 | 1 | 2 | 3 // define a cor do herói
  /** `look` = herói ilustrado em SVG. `base` (emoji) fica só por compatibilidade com backups antigos. */
  avatar: { base: string; look?: HeroLook; equipped: Partial<Record<ItemSlot, string>> }
  speech: boolean // leitura em voz alta
  order: number
  createdAt: number
}

export type RoutineKind = 'wake' | 'school' | 'work' | 'meal' | 'free' | 'sleep' | 'other'
export interface RoutineBlock {
  id: string
  memberId: string
  kind: RoutineKind
  label?: string
  weekdays: Weekday[]
  /** Compromisso pontual: vale só nesta data (os dias da semana são ignorados). */
  date?: ISODate
  /** Datas de folga (férias, feriado): o bloco não vale nesses dias. */
  skipDates?: ISODate[]
  start: HHMM
  end: HHMM // end <= start = cruza a meia-noite (sono)
}

export type Category = 'lar' | 'comida' | 'pessoal' | 'estudo' | 'trabalho' | 'cuidado' | 'financas' | 'planejamento'
export type TaskKind = 'individual' | 'shared' | 'household'

/** Mudança pontual numa data: não precisa (skip), mudou de dia (to) e/ou de horário (time). Nunca é falha. */
export interface TaskException {
  date: ISODate // a data original da ocorrência
  skip?: boolean
  to?: ISODate
  time?: HHMM
}

export interface Task {
  id: string
  title: string
  emoji: string
  speak?: string // como falar para quem não lê
  steps?: string[] // "Como fazer?": passo a passo curto
  category: Category
  kind: TaskKind
  assigneeIds: string[] // individual: 1; shared: 2; household: [] (qualquer um)
  weekdays: Weekday[]
  time?: HHMM
  duration: number // minutos, para a grade
  xp: number // 5 | 10 | 20 | 30
  active: boolean
  proposedBy?: string // id do membro de 12 anos que criou
  exceptions?: TaskException[]
  createdAt: number
}

export type CompletionStatus = 'done' | 'validated'
export interface Completion {
  id: string // `${taskId}|${date}|${slot}`
  taskId: string // ou "adhoc:<uuid>" para feito invisível registrado na hora
  date: ISODate
  memberIds: string[]
  helperId?: string // mentor que ajudou
  status: CompletionStatus
  xp: number // cópia no momento: editar a tarefa não reescreve o passado
  title: string
  emoji: string
  category: Category
  kind: TaskKind
  doneAt: number
  validatedAt?: number
  validatedBy?: string
}

export interface Reward {
  id: string
  title: string
  emoji: string
  cost: number
  active: boolean
  /** Para quem aparece no Baú (vazio/ausente = todos). */
  forIds?: string[]
  createdAt: number
}

export type RedemptionStatus = 'requested' | 'approved' | 'delivered' | 'returned'
export interface Redemption {
  id: string
  rewardId: string
  memberId: string
  title: string
  emoji: string
  cost: number
  status: RedemptionStatus
  requestedAt: number
  decidedAt?: number
}

export interface Thanks {
  id: string
  fromId: string
  toId: string
  message: string
  emoji: string
  completionId?: string
  date: ISODate
  createdAt: number
  seen: boolean
}

export interface AchievementUnlock {
  memberId: string
  achievementId: string
  unlockedAt: number
  seen: boolean
}

export interface Mission {
  weekKey: WeekKey
  templateId: string
  goalXp: number
  reward: string
  delivered: boolean
}

export type ParentTitle = 'rei' | 'pais' | 'guardioes'
export interface Settings {
  id: 'app'
  kingdomName: string
  pinHash?: string
  pinSalt?: string
  onboardingDone: boolean
  parentTitle: ParentTitle
  adultChest: boolean
  sounds: boolean
  vibration: boolean
  demo: boolean
  nextMissionIndex: number
  lastBackupAt?: number
  stepsBackfilled?: boolean
  tourDone?: boolean
  /** Aparência: claro, noite ou automático (noite das 19h às 6h). */
  theme?: 'claro' | 'noite' | 'auto'
  createdAt?: number
}
