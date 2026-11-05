import type { Role } from '../db/types'

export interface HeroClass {
  id: string
  name: { o: string; a: string }
  emoji: string
  role: string // responsabilidades reais
  suggestedFor: Role[]
}

// Classes são identidade e nome. Não dão bônus mecânico: ninguém ganha mais XP por ser de certa classe.
export const CLASSES: HeroClass[] = [
  { id: 'alquimista', name: { o: 'Alquimista da Cozinha', a: 'Alquimista da Cozinha' }, emoji: '🧪', role: 'Cozinhar, cardápio e compras de comida', suggestedFor: ['adult'] },
  { id: 'tesoureiro', name: { o: 'Guardião do Tesouro', a: 'Guardiã do Tesouro' }, emoji: '🪙', role: 'Contas, orçamento e documentos', suggestedFor: ['adult'] },
  { id: 'curandeiro', name: { o: 'Curandeiro do Reino', a: 'Curandeira do Reino' }, emoji: '🌿', role: 'Saúde, remédios, cuidar de pessoas e bichos', suggestedFor: ['adult'] },
  { id: 'arquiteto', name: { o: 'Arquiteto do Lar', a: 'Arquiteta do Lar' }, emoji: '🔨', role: 'Limpeza, consertos, roupa e organização', suggestedFor: ['adult', 'teen'] },
  { id: 'cavaleiro', name: { o: 'Cavaleiro da Jornada', a: 'Cavaleira da Jornada' }, emoji: '⚔️', role: 'Trabalho, levar e buscar, compromissos fora', suggestedFor: ['adult'] },
  { id: 'mago', name: { o: 'Mago dos Pergaminhos', a: 'Maga dos Pergaminhos' }, emoji: '📜', role: 'Estudo, leitura e planejar a semana', suggestedFor: ['teen', 'adult'] },
  { id: 'bardo', name: { o: 'Bardo da Alegria', a: 'Barda da Alegria' }, emoji: '🎵', role: 'Tempo em família, lazer e o clima da casa', suggestedFor: ['adult', 'teen'] },
  { id: 'escudeiro', name: { o: 'Escudeiro', a: 'Escudeira' }, emoji: '🛡️', role: 'Aprende um pouco de tudo e ajuda os heróis', suggestedFor: ['child'] },
]

export const classById = (id: string) => CLASSES.find((c) => c.id === id) ?? CLASSES[0]

export const AVATAR_BASES = ['🧙‍♀️', '🧙‍♂️', '🧝‍♀️', '🧝‍♂️', '🦸‍♀️', '🦸‍♂️', '🧚', '🤴', '👸', '🦊', '🦁', '🐻', '🐼', '🦄', '🐸', '🐲']

/** Joias dos heróis por slot (texto branco sobre a joia ≥ 5,2:1; joia sobre o marfim ≥ 4,6:1). */
export const HERO_COLORS = [
  { solid: '#2550B8', tint: '#E3EAFA', name: 'safira' },
  { solid: '#7A3BA6', tint: '#F1E7F8', name: 'ametista' },
  { solid: '#1D7350', tint: '#DDF0E6', name: 'esmeralda' },
  { solid: '#B0501A', tint: '#FBE6D6', name: 'topázio' },
] as const
