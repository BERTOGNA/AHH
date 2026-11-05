import type { ItemSlot } from '../db/types'

export interface Item {
  id: string
  name: string
  slot: ItemSlot
  emoji: string // para capa: cor da capa (anel do avatar)
  color?: string
  unlock: { level: number } | { achievement: string } | 'start'
}

export const SLOT_NAMES: Record<ItemSlot, string> = {
  chapeu: 'Chapéu', ferramenta: 'Ferramenta', companheiro: 'Companheiro', capa: 'Capa',
}

export const ITEMS: Item[] = [
  { id: 'gorro_aprendiz', name: 'Gorro de Aprendiz', slot: 'chapeu', emoji: '🧢', unlock: 'start' },
  { id: 'capa_viagem', name: 'Capa de Viagem', slot: 'capa', emoji: '🧥', color: '#8B6B4A', unlock: 'start' },
  { id: 'escudo_madeira', name: 'Escudo de Madeira', slot: 'ferramenta', emoji: '🛡️', unlock: { level: 3 } },
  { id: 'gatinho', name: 'Gatinho Companheiro', slot: 'companheiro', emoji: '🐱', unlock: { level: 5 } },
  { id: 'capa_rubi', name: 'Capa Rubi', slot: 'capa', emoji: '🧣', color: '#C0392B', unlock: { level: 8 } },
  { id: 'chapeu_mago', name: 'Chapéu Estrelado', slot: 'chapeu', emoji: '🎩', unlock: { level: 10 } },
  { id: 'raposa', name: 'Raposa Esperta', slot: 'companheiro', emoji: '🦊', unlock: { level: 15 } },
  { id: 'varinha', name: 'Varinha de Aurora', slot: 'ferramenta', emoji: '🪄', unlock: { level: 20 } },
  { id: 'coroa_ouro', name: 'Coroa Dourada', slot: 'chapeu', emoji: '👑', unlock: { level: 30 } },
  { id: 'capa_real', name: 'Manto Real', slot: 'capa', emoji: '🟣', color: '#5B2C83', unlock: { level: 40 } },
  { id: 'colher_pau', name: 'Colher Encantada', slot: 'ferramenta', emoji: '🥄', unlock: { achievement: 'cozinha_10' } },
  { id: 'vassoura', name: 'Vassoura Mágica', slot: 'ferramenta', emoji: '🧹', unlock: { achievement: 'lar_15' } },
  { id: 'coruja', name: 'Coruja Sábia', slot: 'companheiro', emoji: '🦉', unlock: { achievement: 'mentor_1' } },
  { id: 'coroa_flores', name: 'Coroa de Flores', slot: 'chapeu', emoji: '🌸', unlock: { achievement: 'missao_1' } },
  { id: 'capa_estrelas', name: 'Capa das Estrelas', slot: 'capa', emoji: '🌌', color: '#1F3A6B', unlock: { achievement: 'gratidao_5' } },
  { id: 'dragaozinho', name: 'Dragãozinho', slot: 'companheiro', emoji: '🐲', unlock: { achievement: 'missao_3' } },
]

export const itemById = (id?: string) => ITEMS.find((i) => i.id === id)

export function unlockedItems(level: number, achievementIds: Set<string>): Item[] {
  return ITEMS.filter((i) =>
    i.unlock === 'start' ? true : 'level' in i.unlock ? level >= i.unlock.level : achievementIds.has(i.unlock.achievement),
  )
}
