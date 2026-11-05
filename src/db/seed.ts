// Cria a família a partir do assistente, ou a família de exemplo para conhecer o app.
import { uid } from '../lib/uid'
import { db, DEFAULT_SETTINGS } from './db'
import type { Completion, Member, Settings, Task } from './types'
import { defaultChores, defaultMember, generateWeek, type WizardAnswers, type WizardMember } from '../domain/week'
import { completionId, occurrencesFor } from '../domain/schedule'
import { DEFAULT_REWARDS } from '../data/templates'
import { MISSIONS } from '../data/missions'
import { addDays, today } from '../lib/date'
import { hashPin, newSalt } from '../lib/pin'
import { ensureMission, syncUnlocks } from './actions'

export async function createFamily(a: WizardAnswers, pin: string, demo = false) {
  const w = generateWeek(a)
  const salt = newSalt()
  const settings: Settings = {
    ...DEFAULT_SETTINGS, kingdomName: a.kingdomName.trim() || DEFAULT_SETTINGS.kingdomName, parentTitle: a.parentTitle,
    onboardingDone: true, demo, pinSalt: salt, pinHash: await hashPin(pin, salt),
    nextMissionIndex: Math.max(0, MISSIONS.findIndex((m) => m.id === a.missionId)),
  }
  await db.transaction('rw', db.tables, async () => {
    for (const t of db.tables) await t.clear()
    await db.members.bulkAdd(w.members)
    await db.routines.bulkAdd(w.routines)
    await db.tasks.bulkAdd(w.tasks)
    await db.rewards.bulkAdd(w.rewards)
    await db.settings.put(settings)
  })
  await ensureMission()
  return w
}

export const DEMO_PIN = '1234'

/** Família de exemplo com histórico relativo a hoje (para o Mural, níveis e a fila de validação terem conteúdo). */
export async function seedDemo() {
  const members: WizardMember[] = [
    { ...defaultMember('ana', 0, 'Ana', 38, 'a'), classId: 'tesoureiro', base: '🧙‍♀️',
      look: { skin: 'mel', hair: 'coque', hairColor: 'escuro', eyes: 'amendoados', mouth: 'sorriso', extras: ['oculos'] } },
    { ...defaultMember('bruno', 1, 'Bruno', 40, 'o'), classId: 'alquimista', base: '🧔',
      look: { skin: 'canela', hair: 'curto', hairColor: 'preto', eyes: 'felizes', mouth: 'risada', extras: ['barba'] } },
    { ...defaultMember('leo', 2, 'Léo', 12, 'o'), classId: 'mago', base: '🧝‍♂️',
      look: { skin: 'mel', hair: 'cacheado', hairColor: 'castanho', eyes: 'redondos', mouth: 'sorriso', extras: ['orelhas-elficas'] } },
    { ...defaultMember('bia', 3, 'Bia', 6, 'a'), classId: 'escudeiro', base: '🦄',
      look: { skin: 'mel', hair: 'trancas', hairColor: 'ruivo', eyes: 'redondos', mouth: 'risada', extras: ['sardas'] } },
  ]
  members[1].occStart = '08:00'
  members[1].occEnd = '17:00'
  const answers: WizardAnswers = {
    kingdomName: 'Reino dos Oliveira', parentTitle: 'rei', members, chores: defaultChores(members),
    rewards: DEFAULT_REWARDS.filter((r) => r.on), missionId: 'jardim',
  }
  const w = await createFamily(answers, DEMO_PIN, true)

  // Histórico: os 3 dias anteriores com boa parte feita e validada; hoje, algumas tarefas esperando o selo.
  const now = Date.now()
  const day = today()
  const completions: Completion[] = []
  const byId = new Map(w.members.map((m) => [m.id, m]))
  const mk = (t: Task, date: string, slot: string, memberIds: string[], validated: boolean, helperId?: string): Completion => ({
    id: completionId(t.id, date, slot), taskId: t.id, date, memberIds, helperId, status: validated ? 'validated' : 'done',
    xp: t.xp, title: t.title, emoji: t.emoji, category: t.category, kind: t.kind, doneAt: now,
    ...(validated ? { validatedAt: now, validatedBy: 'ana' } : {}),
  })
  for (let back = 3; back >= 1; back--) {
    const date = addDays(day, -back)
    occurrencesFor(date, w.tasks, []).forEach((o, i) => {
      if ((i + back) % 4 === 0) return // nem tudo é feito — e tudo bem
      const who = o.task.kind === 'household' ? ['bruno'] : o.forIds
      const helper = who.includes('bia') && i % 3 === 0 ? 'leo' : undefined
      completions.push(mk(o.task, date, o.slot, who, true, helper))
    })
  }
  // Hoje: tarefas da manhã feitas; as das crianças aguardando validação.
  occurrencesFor(day, w.tasks, [])
    .filter((o) => (o.task.time ?? '23:59') < '09:00')
    .forEach((o) => {
      if (o.task.kind === 'household') return
      const adultOnly = o.forIds.every((id) => byId.get(id)?.role === 'adult')
      completions.push(mk(o.task, day, o.slot, o.forIds, adultOnly))
    })
  await db.completions.bulkPut(completions)

  await db.thanks.bulkAdd([
    { id: uid(), fromId: 'bia', toId: 'bruno', emoji: '🍲', message: 'A comida estava uma delícia!', date: addDays(day, -1), createdAt: now - 86400000, seen: true },
    { id: uid(), fromId: 'ana', toId: 'leo', emoji: '🤝', message: 'Obrigada por ajudar a Bia com a leitura!', date: addDays(day, -1), createdAt: now - 80000000, seen: false },
    { id: uid(), fromId: 'leo', toId: 'ana', emoji: '💼', message: 'Obrigado por trabalhar pela família!', date: day, createdAt: now - 3600000, seen: false },
  ])
  const rewards = await db.rewards.toArray()
  const cheap = rewards.sort((a, b) => a.cost - b.cost)[0]
  if (cheap) {
    await db.redemptions.add({
      id: uid(), rewardId: cheap.id, memberId: 'leo', title: cheap.title, emoji: cheap.emoji, cost: cheap.cost,
      status: 'requested', requestedAt: now,
    })
  }
  await syncUnlocks()
  return w.members as Member[]
}
