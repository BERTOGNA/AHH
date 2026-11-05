import type { Category } from '../db/types'

/** Números que as regras de conquista podem consultar (todos do próprio membro). */
export interface AchievementStats {
  validated: number
  byCategory: Partial<Record<Category, number>>
  shared: number
  household: number
  thanksSent: number
  thanksReceived: number
  mentorships: number
  missionsCompleted: number
  litWeeks: number
  level: number
}

export interface Achievement {
  id: string
  name: string
  emoji: string
  hint: string // como conseguir (nunca "faltam X")
  test: (s: AchievementStats) => boolean
}

const cat = (s: AchievementStats, c: Category) => s.byCategory[c] ?? 0

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'primeira_tarefa', name: 'Primeiro Passo', emoji: '👣', hint: 'Ter a primeira tarefa validada', test: (s) => s.validated >= 1 },
  { id: 'tarefas_10', name: 'Mãos à Obra', emoji: '✋', hint: '10 tarefas validadas', test: (s) => s.validated >= 10 },
  { id: 'tarefas_50', name: 'Pilar da Casa', emoji: '🏛️', hint: '50 tarefas validadas', test: (s) => s.validated >= 50 },
  { id: 'tarefas_100', name: 'Coração do Reino', emoji: '❤️', hint: '100 tarefas validadas', test: (s) => s.validated >= 100 },
  { id: 'cozinha_10', name: 'Aprendiz de Alquimia', emoji: '🧪', hint: '10 tarefas de cozinha', test: (s) => cat(s, 'comida') >= 10 },
  { id: 'lar_15', name: 'Guardião das Muralhas', emoji: '🏰', hint: '15 tarefas da casa', test: (s) => cat(s, 'lar') >= 15 },
  { id: 'estudo_15', name: 'Leitor de Pergaminhos', emoji: '📜', hint: '15 tarefas de estudo', test: (s) => cat(s, 'estudo') >= 15 },
  { id: 'cuidado_10', name: 'Coração Cuidador', emoji: '💞', hint: '10 vezes cuidando de alguém', test: (s) => cat(s, 'cuidado') >= 10 },
  { id: 'financas_5', name: 'Tesouro em Dia', emoji: '🪙', hint: '5 tarefas de finanças', test: (s) => cat(s, 'financas') >= 5 },
  { id: 'planejamento_5', name: 'Cartógrafo', emoji: '🗺️', hint: '5 tarefas de planejar e organizar', test: (s) => cat(s, 'planejamento') >= 5 },
  { id: 'juntos_5', name: 'Dupla Lendária', emoji: '👫', hint: '5 tarefas feitas em dupla', test: (s) => s.shared >= 5 },
  { id: 'chamado_5', name: 'Voluntário do Lar', emoji: '🙋', hint: 'Atender 5 chamados do lar', test: (s) => s.household >= 5 },
  { id: 'gratidao_5', name: 'Voz da Gratidão', emoji: '💌', hint: 'Agradecer 5 vezes', test: (s) => s.thanksSent >= 5 },
  { id: 'gratidao_rec_10', name: 'Querido do Reino', emoji: '🌟', hint: 'Receber 10 agradecimentos', test: (s) => s.thanksReceived >= 10 },
  { id: 'mentor_1', name: 'Primeira Mentoria', emoji: '🦉', hint: 'Ajudar o irmão numa tarefa', test: (s) => s.mentorships >= 1 },
  { id: 'mentor_10', name: 'Mestre Mentor', emoji: '🎓', hint: 'Ajudar o irmão 10 vezes', test: (s) => s.mentorships >= 10 },
  { id: 'missao_1', name: 'Restaurador', emoji: '🌷', hint: 'Completar uma missão da família', test: (s) => s.missionsCompleted >= 1 },
  { id: 'missao_3', name: 'Herói das Missões', emoji: '🏆', hint: 'Completar 3 missões da família', test: (s) => s.missionsCompleted >= 3 },
  { id: 'semana_acesa', name: 'Fogueira Acesa', emoji: '🔥', hint: 'Acender 5 chamas numa semana', test: (s) => s.litWeeks >= 1 },
  { id: 'nivel_10', name: 'Protetor do Reino', emoji: '🛡️', hint: 'Chegar ao nível 10', test: (s) => s.level >= 10 },
]

export const achievementById = (id: string) => ACHIEVEMENTS.find((a) => a.id === id)
