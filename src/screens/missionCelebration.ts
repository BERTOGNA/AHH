// Quando a barra coletiva cruza um estágio (25/50/75/100%), quem abrir o app em seguida vê a cena nova.
// "Visto" fica por aparelho e por quem viu (Salão = a família reunida; ou cada herói na sua aventura).
import type { Family, Celebration } from '../state'
import { missionById, stageOf } from '../data/missions'
import { weekXp } from '../domain/economy'
import { today, weekKey } from '../lib/date'

const read = (k: string) => {
  try {
    return localStorage.getItem(k)
  } catch {
    return null
  }
}
const write = (k: string, v: string) => {
  try {
    localStorage.setItem(k, v)
  } catch {
    /* sem armazenamento */
  }
}

/** Devolve a celebração do estágio novo (e marca como vista) ou null. `who` = 'salao' ou id do membro. */
export function takeMissionCelebration(f: Family, who: string, kid = false): Celebration | null {
  const wk = weekKey(today())
  const m = f.missions.find((x) => x.weekKey === wk)
  if (!m) return null
  const stage = stageOf(weekXp(today(), f.events), m.goalXp)
  const key = `reino:estagio:${wk}:${who}`
  const seen = read(key)
  write(key, String(stage))
  // Primeira vez nesta semana neste aparelho: só registra, sem celebrar o que já estava lá.
  if (seen === null || stage <= Number(seen)) return null
  const t = missionById(m.templateId)
  const done = stage === 4
  return {
    emoji: t.emoji,
    title: done ? 'Missão cumprida!' : `${stage * 25}% restaurado!`,
    text: done ? `${t.stages[4].text} Tesouro da Família: ${m.reward}.` : t.stages[stage].text,
    speak: kid ? (done ? 'Missão cumprida! Todos juntos conseguiram!' : 'O reino está mais bonito! Todos juntos!') : undefined,
    scene: { missionId: t.id, stage },
  }
}
