import type { AchievementUnlock, Completion, Mission, Thanks } from '../db/types'
import { ACHIEVEMENTS, type AchievementStats } from '../data/achievements'
import { levelOf } from './levels'
import { ledger, missionsCompleted, RULES, xpOf } from './economy'
import { weekKey } from '../lib/date'

export interface FamilyData {
  completions: Completion[]
  thanks: Thanks[]
  missions: Mission[]
}

export function statsOf(memberId: string, d: FamilyData): AchievementStats {
  const events = ledger(d)
  const mine = d.completions.filter((c) => c.status === 'validated' && c.memberIds.includes(memberId))
  const byCategory: AchievementStats['byCategory'] = {}
  for (const c of mine) byCategory[c.category] = (byCategory[c.category] ?? 0) + 1

  const weeks = new Map<string, Set<string>>()
  for (const c of mine) {
    const wk = weekKey(c.date)
    if (!weeks.has(wk)) weeks.set(wk, new Set())
    weeks.get(wk)!.add(c.date)
  }

  return {
    validated: mine.length,
    byCategory,
    shared: mine.filter((c) => c.kind === 'shared').length,
    household: mine.filter((c) => c.kind === 'household').length,
    thanksSent: d.thanks.filter((t) => t.fromId === memberId).length,
    thanksReceived: d.thanks.filter((t) => t.toId === memberId).length,
    mentorships: d.completions.filter((c) => c.status === 'validated' && c.helperId === memberId).length,
    missionsCompleted: missionsCompleted(memberId, d.missions, events).length,
    litWeeks: [...weeks.values()].filter((s) => s.size >= RULES.litWeekFlames).length,
    level: levelOf(xpOf(memberId, events)).level,
  }
}

/** Conquistas que o membro acabou de merecer e ainda não estão registradas. */
export function newlyUnlocked(memberId: string, d: FamilyData, unlocks: AchievementUnlock[]): string[] {
  const have = new Set(unlocks.filter((u) => u.memberId === memberId).map((u) => u.achievementId))
  const s = statsOf(memberId, d)
  return ACHIEVEMENTS.filter((a) => !have.has(a.id) && a.test(s)).map((a) => a.id)
}
