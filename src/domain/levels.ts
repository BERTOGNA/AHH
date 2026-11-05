import type { Treatment } from '../db/types'

export const MAX_LEVEL = 50

/** XP total para chegar ao nível n (nível 1 = 0). Do nível n ao n+1 custa 50 + 25·(n−1). */
export const xpForLevel = (n: number) => 50 * (n - 1) + 12.5 * (n - 1) * (n - 2)

export interface LevelInfo {
  level: number
  into: number // XP já dentro do nível atual
  span: number // XP que o nível atual exige (0 no máximo)
  legendStars: number // depois do nível 50: uma estrela a cada 1000 XP
}

export function levelOf(xp: number): LevelInfo {
  let level = 1
  while (level < MAX_LEVEL && xpForLevel(level + 1) <= xp) level++
  if (level === MAX_LEVEL) {
    const extra = xp - xpForLevel(MAX_LEVEL)
    return { level, into: extra % 1000, span: 1000, legendStars: Math.floor(extra / 1000) }
  }
  return { level, into: xp - xpForLevel(level), span: xpForLevel(level + 1) - xpForLevel(level), legendStars: 0 }
}

const TITLES: { from: number; o: string; a: string }[] = [
  { from: 50, o: 'Pilar do Reino', a: 'Pilar do Reino' },
  { from: 40, o: 'Lenda do Reino', a: 'Lenda do Reino' },
  { from: 30, o: 'Mestre do Reino', a: 'Mestra do Reino' },
  { from: 20, o: 'Campeão do Lar', a: 'Campeã do Lar' },
  { from: 15, o: 'Herói', a: 'Heroína' },
  { from: 10, o: 'Protetor', a: 'Protetora' },
  { from: 5, o: 'Explorador', a: 'Exploradora' },
  { from: 1, o: 'Aprendiz do Reino', a: 'Aprendiz do Reino' },
]

export function titleOf(level: number, t: Treatment): string {
  return (TITLES.find((x) => level >= x.from) ?? TITLES[TITLES.length - 1])[t]
}
