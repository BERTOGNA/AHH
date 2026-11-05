// Ao abrir a própria aventura: celebra o que aconteceu desde a última visita (selo, nível, conquista).
import { useEffect, useRef } from 'react'
import type { Member } from '../../db/types'
import { useFamily, useSession, type Celebration } from '../../state'
import { levelOf, titleOf } from '../../domain/levels'
import { xpOf } from '../../domain/economy'
import { achievementById } from '../../data/achievements'
import { markUnlocksSeen } from '../../db/actions'
import { parentsLabel, capitalize } from '../../components/hero'
import { takeMissionCelebration } from '../missionCelebration'

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

export function useArrival(me: Member): boolean {
  const f = useFamily()
  const { celebration, celebrate } = useSession()
  const queue = useRef<Celebration[] | null>(null)

  if (queue.current === null) {
    const q: Celebration[] = []
    const kid = me.role === 'child'
    const seenAt = Number(read(`reino:visto:${me.id}`) ?? 0)
    const fresh = f.completions.filter((c) => c.status === 'validated' && c.memberIds.includes(me.id) && (c.validatedAt ?? 0) > seenAt && c.validatedBy !== me.id)
    if (seenAt && fresh.length) {
      const by = f.byId.get(fresh[fresh.length - 1].validatedBy ?? '')
      const who = capitalize(parentsLabel(f.settings, by))
      q.push(
        kid
          ? { emoji: '⭐', title: 'O Selo Real chegou!', text: `${who} viu as suas missões!`, speak: `${who} viu! Você ganhou ${fresh.length === 1 ? 'uma estrela' : `${fresh.length} estrelas`}!`, heroId: me.id }
          : { emoji: '🔏', title: 'Selo recebido', text: `${fresh.length === 1 ? '1 tarefa validada' : `${fresh.length} tarefas validadas`} desde a sua última visita.`, heroId: me.id },
      )
    }
    const level = levelOf(xpOf(me.id, f.events)).level
    const seenLevel = Number(read(`reino:nivel:${me.id}`) ?? 0)
    if (seenLevel && level > seenLevel) {
      q.push({ emoji: '🌟', title: 'Novo nível!', text: `${titleOf(level, me.treatment)} · nível ${level}`, speak: kid ? 'Você subiu de nível!' : undefined, heroId: me.id })
    }
    for (const u of f.unlocks.filter((u) => u.memberId === me.id && !u.seen)) {
      const a = achievementById(u.achievementId)
      if (a) q.push({ emoji: a.emoji, achievementId: a.id, title: `Conquista: ${a.name}`, text: a.hint, speak: kid ? `Conquista nova: ${a.name}!` : undefined })
    }
    const ms = takeMissionCelebration(f, me.id, kid)
    if (ms) q.unshift(ms)
    queue.current = q
    write(`reino:visto:${me.id}`, String(Date.now()))
    write(`reino:nivel:${me.id}`, String(level))
    void markUnlocksSeen(me.id)
  }

  useEffect(() => {
    if (!celebration && queue.current?.length) celebrate(queue.current.shift()!)
  }, [celebration, celebrate])

  return (queue.current?.length ?? 0) > 0
}

/** Depois de cada validação feita na hora (adulto), atualiza o nível visto e celebra se subiu. */
export function useLiveLevel(me: Member) {
  const f = useFamily()
  const { celebrate } = useSession()
  const level = levelOf(xpOf(me.id, f.events)).level
  useEffect(() => {
    const seen = Number(read(`reino:nivel:${me.id}`) ?? 0)
    if (seen && level > seen) {
      celebrate({ emoji: '🌟', title: 'Novo nível!', text: `${titleOf(level, me.treatment)} · nível ${level}`, speak: me.role === 'child' ? 'Você subiu de nível!' : undefined, heroId: me.id })
    }
    write(`reino:nivel:${me.id}`, String(level))
  }, [level, me.id, me.role, me.treatment, celebrate])
}
