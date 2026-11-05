import type { Category } from '../db/types'

export const CATEGORIES: Record<Category, { name: string; emoji: string; mural: string }> = {
  lar: { name: 'Casa & Lar', emoji: '🏠', mural: 'cuidou das muralhas do castelo' },
  comida: { name: 'Cozinha & Comida', emoji: '🍲', mural: 'preparou poções e banquetes' },
  pessoal: { name: 'Cuidado Pessoal', emoji: '🪥', mural: 'se preparou para a aventura' },
  estudo: { name: 'Estudo', emoji: '📚', mural: 'estudou os pergaminhos' },
  trabalho: { name: 'Trabalho', emoji: '💼', mural: 'partiu em expedição para sustentar o reino' },
  cuidado: { name: 'Cuidar de Alguém', emoji: '💞', mural: 'cuidou de quem precisa' },
  financas: { name: 'Finanças & Contas', emoji: '🪙', mural: 'manteve o Tesouro em ordem' },
  planejamento: { name: 'Planejar & Organizar', emoji: '🗺️', mural: 'traçou o mapa da semana' },
}

/** Categorias do "trabalho invisível" — aparecem em Bastidores do Reino no Mural. */
export const BACKSTAGE: Category[] = ['trabalho', 'financas', 'planejamento', 'cuidado']

export const XP_LEVELS = [
  { xp: 5, name: 'Rápida' },
  { xp: 10, name: 'Normal' },
  { xp: 20, name: 'Grande' },
  { xp: 30, name: 'Épica' },
] as const
