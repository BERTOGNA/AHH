// Todas as escritas no banco passam por aqui.
import { uid } from '../lib/uid'
import { db, DEFAULT_SETTINGS } from './db'
import type { Completion, Member, Mission, Reward, RoutineBlock, Settings, Task, TaskException } from './types'
import { completionId, plannedWeekXp } from '../domain/schedule'
import { coinBalance, ledger } from '../domain/economy'
import { newlyUnlocked } from '../domain/achievements'
import { MISSIONS, missionGoal } from '../data/missions'
import { today, weekKey } from '../lib/date'
import { hashPin, newSalt } from '../lib/pin'


export async function getSettings(): Promise<Settings> {
  return (await db.settings.get('app')) ?? DEFAULT_SETTINGS
}

export async function updateSettings(patch: Partial<Settings>) {
  const s = await getSettings()
  await db.settings.put({ ...s, ...patch, id: 'app' })
}

export async function setPin(pin: string) {
  const salt = newSalt()
  await updateSettings({ pinSalt: salt, pinHash: await hashPin(pin, salt) })
}

export async function checkPin(pin: string): Promise<boolean> {
  const s = await getSettings()
  if (!s.pinHash || !s.pinSalt) return true
  return (await hashPin(pin, s.pinSalt)) === s.pinHash
}

// ---------- Tarefas: marcar, validar ----------

/** Marca uma ocorrência como feita. Quando quem marca é adulto, ela já nasce validada (o adulto atesta na hora). */
export async function markDone(task: Task, date: string, slot: string, memberIds: string[], by: Member, helperId?: string) {
  const allAdults = by.role === 'adult'
  const c: Completion = {
    id: completionId(task.id, date, slot), taskId: task.id, date, memberIds, helperId,
    status: allAdults ? 'validated' : 'done', xp: task.xp, title: task.title, emoji: task.emoji,
    category: task.category, kind: task.kind, doneAt: Date.now(),
    ...(allAdults ? { validatedAt: Date.now(), validatedBy: by.id } : {}),
  }
  await db.completions.put(c)
  if (allAdults) await syncUnlocks()
  return c
}

/** Desfaz uma marcação que ainda não foi validada (toque por engano). */
export async function unmark(id: string) {
  const c = await db.completions.get(id)
  if (c && c.status === 'done') await db.completions.delete(id)
}

/** "Ainda não": devolve a tarefa para fazer, sem nenhum registro. */
export const notYet = unmark

export async function validate(ids: string[], byId: string) {
  const now = Date.now()
  await db.transaction('rw', db.completions, async () => {
    for (const id of ids) {
      await db.completions.update(id, { status: 'validated', validatedAt: now, validatedBy: byId })
    }
  })
  await syncUnlocks()
}

/** Desfazer de 5 s após validar (corrige clique errado). */
export async function unvalidate(ids: string[]) {
  await db.transaction('rw', db.completions, async () => {
    for (const id of ids) await db.completions.update(id, { status: 'done', validatedAt: undefined, validatedBy: undefined })
  })
}

/** Mentoria: o mais velho registra que ajudou numa tarefa já marcada. Uma por tarefa. */
export async function addHelper(id: string, helperId: string) {
  const c = await db.completions.get(id)
  if (!c || c.helperId || c.memberIds.includes(helperId)) return
  await db.completions.update(id, { helperId })
  if (c.status === 'validated') await syncUnlocks()
}

/** "Eu ajudo!" num chamado do lar já marcado: vira dupla. */
export async function joinHousehold(id: string, memberId: string) {
  const c = await db.completions.get(id)
  if (!c || c.memberIds.includes(memberId) || c.memberIds.length >= 2) return
  await db.completions.update(id, { memberIds: [...c.memberIds, memberId] })
}

/** Feito invisível de adulto: registrado e validado na hora, aparece no Mural. */
export async function registerDeed(by: Member, deed: { title: string; emoji: string; category: Completion['category']; xp: number }) {
  const now = Date.now()
  const date = today()
  await db.completions.put({
    id: completionId(`adhoc:${uid()}`, date, by.id), taskId: 'adhoc', date, memberIds: [by.id], status: 'validated',
    xp: deed.xp, title: deed.title, emoji: deed.emoji, category: deed.category, kind: 'individual',
    doneAt: now, validatedAt: now, validatedBy: by.id,
  })
  await syncUnlocks()
}

// ---------- Agradecimentos ----------

export async function sendThanks(fromId: string, toId: string, message: string, emoji: string, completionIdRef?: string) {
  if (fromId === toId) return
  await db.thanks.add({
    id: uid(), fromId, toId, message: message.slice(0, 140), emoji, completionId: completionIdRef,
    date: today(), createdAt: Date.now(), seen: false,
  })
  await syncUnlocks()
}

export async function markThanksSeen(ids: string[]) {
  await db.transaction('rw', db.thanks, async () => {
    for (const id of ids) await db.thanks.update(id, { seen: true })
  })
}

// ---------- Conquistas ----------

/** Registra conquistas novas de todos (append-only: conquista nunca é apagada). */
export async function syncUnlocks() {
  const [members, completions, thanks, missions, unlocks] = await Promise.all([
    db.members.toArray(), db.completions.toArray(), db.thanks.toArray(), db.missions.toArray(), db.unlocks.toArray(),
  ])
  const now = Date.now()
  const fresh = members.flatMap((m) =>
    newlyUnlocked(m.id, { completions, thanks, missions }, unlocks).map((a) => ({
      memberId: m.id, achievementId: a, unlockedAt: now, seen: false,
    })),
  )
  if (fresh.length) await db.unlocks.bulkPut(fresh)
}

export async function markUnlocksSeen(memberId: string) {
  const list = await db.unlocks.where('memberId').equals(memberId).toArray()
  await db.unlocks.bulkPut(list.map((u) => ({ ...u, seen: true })))
}

// ---------- Baú ----------

export async function requestReward(memberId: string, reward: Reward): Promise<boolean> {
  return db.transaction('rw', [db.redemptions, db.completions, db.thanks], async () => {
    const [completions, thanks, redemptions] = await Promise.all([
      db.completions.toArray(), db.thanks.toArray(), db.redemptions.toArray(),
    ])
    const balance = coinBalance(memberId, ledger({ completions, thanks }), redemptions)
    if (balance < reward.cost) return false
    await db.redemptions.add({
      id: uid(), rewardId: reward.id, memberId, title: reward.title, emoji: reward.emoji, cost: reward.cost,
      status: 'requested', requestedAt: Date.now(),
    })
    return true
  })
}

export async function decideRedemption(id: string, status: 'approved' | 'delivered' | 'returned') {
  await db.redemptions.update(id, { status, decidedAt: Date.now() })
}

export async function saveReward(r: Partial<Reward> & { title: string; emoji: string; cost: number }) {
  await db.rewards.put({ active: true, createdAt: Date.now(), ...r, id: r.id ?? uid() } as Reward)
}

// ---------- Missão ----------

/** Garante a missão da semana (criada na primeira abertura da semana, meta fixa até domingo). */
export async function ensureMission(date = today()): Promise<Mission> {
  const wk = weekKey(date)
  const existing = await db.missions.get(wk)
  if (existing) return existing
  const s = await getSettings()
  const tasks = await db.tasks.toArray()
  const t = MISSIONS[s.nextMissionIndex % MISSIONS.length]
  const m: Mission = { weekKey: wk, templateId: t.id, goalXp: missionGoal(plannedWeekXp(tasks)), reward: t.reward, delivered: false }
  await db.missions.put(m)
  await updateSettings({ nextMissionIndex: s.nextMissionIndex + 1 })
  return m
}

export async function changeMission(wk: string, templateId: string) {
  const t = MISSIONS.find((x) => x.id === templateId)
  if (t) await db.missions.update(wk, { templateId, reward: t.reward })
}

export async function updateMission(wk: string, patch: Partial<Mission>) {
  await db.missions.update(wk, patch)
}

// ---------- Cadastros ----------

export async function saveTask(t: Partial<Task> & Pick<Task, 'title' | 'emoji' | 'category' | 'kind' | 'assigneeIds' | 'weekdays' | 'xp'>) {
  const task: Task = { duration: 30, active: true, createdAt: Date.now(), ...t, id: t.id ?? uid() } as Task
  await db.tasks.put(task)
  return task
}

/** Exceção pontual (só nesta semana). Substitui a exceção que houver para a mesma data original. */
export async function setException(taskId: string, ex: TaskException) {
  const t = await db.tasks.get(taskId)
  if (!t) return
  const rest = (t.exceptions ?? []).filter((e) => e.date !== ex.date)
  await db.tasks.update(taskId, { exceptions: [...rest, ex] })
}

export async function clearException(taskId: string, date: string) {
  const t = await db.tasks.get(taskId)
  if (!t) return
  await db.tasks.update(taskId, { exceptions: (t.exceptions ?? []).filter((e) => e.date !== date) })
}

export async function deleteTask(id: string) {
  // Histórico (completions) fica: o que foi feito continua feito.
  await db.tasks.delete(id)
}

export async function saveRoutine(r: Partial<RoutineBlock> & Omit<RoutineBlock, 'id'>) {
  await db.routines.put({ ...r, id: r.id ?? uid() } as RoutineBlock)
}

export async function deleteRoutine(id: string) {
  await db.routines.delete(id)
}

export async function updateMember(id: string, patch: Partial<Member>) {
  await db.members.update(id, patch)
}

export async function resetAll() {
  await db.transaction('rw', db.tables, async () => {
    for (const t of db.tables) await t.clear()
  })
}
