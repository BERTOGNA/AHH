// Economia derivada: XP e moedas são somas de fatos registrados. Nada aqui subtrai XP.
import type { Completion, ISODate, Mission, Redemption, Thanks } from '../db/types'
import { weekDates, weekKey } from '../lib/date'

export const RULES = {
  mentorXp: 5,
  mentorCoins: 1,
  mentorPerDay: 3,
  thanksXp: 2,
  thanksPerDay: 5,
  litWeekFlames: 5,
  litWeekXp: 15,
} as const

export const coinsForXp = (xp: number) => Math.floor(xp / 5)

export type XpSource = 'task' | 'mentor' | 'thanks' | 'fogueira'
export interface XpEvent {
  memberId: string
  date: ISODate
  xp: number
  coins: number
  source: XpSource
}

export interface EconomyData {
  completions: Completion[]
  thanks: Thanks[]
}

/** Todos os ganhos da família, em ordem estável. Todo evento tem xp ≥ 0 e moedas ≥ 0. */
export function ledger({ completions, thanks }: EconomyData): XpEvent[] {
  const events: XpEvent[] = []
  const validated = completions.filter((c) => c.status === 'validated').sort((a, b) => a.id.localeCompare(b.id))

  for (const c of validated) {
    for (const m of c.memberIds) {
      events.push({ memberId: m, date: c.date, xp: c.xp, coins: coinsForXp(c.xp), source: 'task' })
    }
  }

  // Mentoria: +5 XP e +1 moeda, no máximo 3 por dia por mentor.
  const mentored = new Map<string, number>()
  for (const c of validated) {
    if (!c.helperId || c.memberIds.includes(c.helperId)) continue
    const key = `${c.helperId}|${c.date}`
    mentored.set(key, (mentored.get(key) ?? 0) + 1)
  }
  for (const [key, n] of mentored) {
    const [memberId, date] = key.split('|')
    const k = Math.min(n, RULES.mentorPerDay)
    events.push({ memberId, date, xp: RULES.mentorXp * k, coins: RULES.mentorCoins * k, source: 'mentor' })
  }

  // Agradecimento: +2 XP para quem envia (até 5 envios por dia) e +2 para quem recebe
  // (até 5 por dia vindos do mesmo remetente). Limites independentes = nunca diminui ao chegar um novo registro.
  const sent = new Map<string, number>()
  const received = new Map<string, number>()
  for (const t of thanks) {
    if (t.fromId === t.toId) continue
    const s = `${t.fromId}|${t.date}`
    const r = `${t.fromId}|${t.toId}|${t.date}`
    sent.set(s, (sent.get(s) ?? 0) + 1)
    received.set(r, (received.get(r) ?? 0) + 1)
  }
  for (const [key, n] of sent) {
    const [memberId, date] = key.split('|')
    events.push({ memberId, date, xp: RULES.thanksXp * Math.min(n, RULES.thanksPerDay), coins: 0, source: 'thanks' })
  }
  for (const [key, n] of received) {
    const [, memberId, date] = key.split('|')
    events.push({ memberId, date, xp: RULES.thanksXp * Math.min(n, RULES.thanksPerDay), coins: 0, source: 'thanks' })
  }

  // Semana Acesa: 5 dias com chama na semana = +15 XP, na data da 5ª chama.
  const flameDays = new Map<string, Set<ISODate>>()
  for (const c of validated) {
    for (const m of c.memberIds) {
      const key = `${m}|${weekKey(c.date)}`
      if (!flameDays.has(key)) flameDays.set(key, new Set())
      flameDays.get(key)!.add(c.date)
    }
  }
  for (const [key, days] of flameDays) {
    if (days.size >= RULES.litWeekFlames) {
      const memberId = key.split('|')[0]
      const fifth = [...days].sort()[RULES.litWeekFlames - 1]
      events.push({ memberId, date: fifth, xp: RULES.litWeekXp, coins: 0, source: 'fogueira' })
    }
  }
  return events
}

export function xpOf(memberId: string, events: XpEvent[]): number {
  return events.reduce((s, e) => (e.memberId === memberId ? s + e.xp : s), 0)
}

export function coinsEarned(memberId: string, events: XpEvent[]): number {
  return events.reduce((s, e) => (e.memberId === memberId ? s + e.coins : s), 0)
}

/** Moedas reservadas ou trocadas. Pedidos devolvidos ("Agora não") não contam. */
export function coinsSpent(memberId: string, redemptions: Redemption[]): number {
  return redemptions
    .filter((r) => r.memberId === memberId && r.status !== 'returned')
    .reduce((s, r) => s + r.cost, 0)
}

export function coinBalance(memberId: string, events: XpEvent[], redemptions: Redemption[]): number {
  return Math.max(0, coinsEarned(memberId, events) - coinsSpent(memberId, redemptions))
}

/** XP marcado mas ainda sem o selo dos pais ("brilho fantasma"). */
export function pendingXp(memberId: string, completions: Completion[]): number {
  return completions
    .filter((c) => c.status === 'done' && c.memberIds.includes(memberId))
    .reduce((s, c) => s + c.xp, 0)
}

/** Progresso da missão: toda XP da família com data na semana. */
export function weekXp(date: ISODate, events: XpEvent[]): number {
  const days = new Set(weekDates(date))
  return events.reduce((s, e) => (days.has(e.date) ? s + e.xp : s), 0)
}

export function memberWeekXp(memberId: string, date: ISODate, events: XpEvent[]): number {
  const days = new Set(weekDates(date))
  return events.reduce((s, e) => (e.memberId === memberId && days.has(e.date) ? s + e.xp : s), 0)
}

/** Chamas da Semana: um booleano por dia (seg→dom). Dia sem chama é neutro, nunca "apagado". */
export function flamesOf(memberId: string, date: ISODate, completions: Completion[]): boolean[] {
  const lit = new Set(
    completions.filter((c) => c.status === 'validated' && c.memberIds.includes(memberId)).map((c) => c.date),
  )
  return weekDates(date).map((d) => lit.has(d))
}

/** Missões concluídas (100%) com participação do membro (≥1 XP naquela semana). `null` = da família. */
export function missionsCompleted(memberId: string | null, missions: Mission[], events: XpEvent[]): Mission[] {
  const total = new Map<string, number>()
  const mine = new Map<string, number>()
  for (const e of events) {
    const wk = weekKey(e.date)
    total.set(wk, (total.get(wk) ?? 0) + e.xp)
    if (e.memberId === memberId) mine.set(wk, (mine.get(wk) ?? 0) + e.xp)
  }
  return missions.filter(
    (m) => (total.get(m.weekKey) ?? 0) >= m.goalXp && (memberId === null || (mine.get(m.weekKey) ?? 0) > 0),
  )
}
