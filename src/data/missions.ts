export interface MissionTemplate {
  id: string
  name: string
  place: string // nome do lugar no Mapa do Reino
  emoji: string
  reward: string // recompensa coletiva sugerida
  /** Cena em cada estágio (0, 25, 50, 75, 100%): emojis + descrição. */
  stages: { scene: string; text: string }[]
}

export const MISSIONS: MissionTemplate[] = [
  {
    id: 'jardim', name: 'Restaurar o Jardim do Reino', place: 'Jardim do Reino', emoji: '🌷', reward: 'Piquenique em família',
    stages: [
      { scene: '🌫️🪨🌫️', text: 'Terra seca e névoa sobre a cerca caída.' },
      { scene: '🌱🌫️🌱', text: 'Brotos verdes surgem na terra.' },
      { scene: '🌱🌷🪨🌷', text: 'Flores e um caminho de pedras.' },
      { scene: '🌷⛲🌼🌷', text: 'A fonte voltou a jorrar!' },
      { scene: '🦋🌷⛲🌻🪑', text: 'Jardim florido, borboletas e o banco da família.' },
    ],
  },
  {
    id: 'farol', name: 'Reacender o Farol de Aurora', place: 'Farol de Aurora', emoji: '🗼', reward: 'Noite de cinema em casa com pipoca',
    stages: [
      { scene: '🌫️🗼🌫️', text: 'O farol está apagado no nevoeiro.' },
      { scene: '🌊🗼🪟', text: 'As janelas do farol acendem.' },
      { scene: '🌊🗼✨', text: 'A escada está iluminada.' },
      { scene: '🌊🗼🔥', text: 'A chama brilha no topo!' },
      { scene: '⛵🌊🗼🌟⛵', text: 'O feixe de luz cruza o céu e os barcos chegam.' },
    ],
  },
  {
    id: 'ponte', name: 'Reconstruir a Ponte do Rio Cristal', place: 'Ponte do Rio Cristal', emoji: '🌉', reward: 'Passeio de bicicleta ou no parque',
    stages: [
      { scene: '🌫️🪵🌊🪵', text: 'A ponte está quebrada.' },
      { scene: '🌊🏛️🌊', text: 'Os pilares estão de pé.' },
      { scene: '🌊🪵🪵🌊', text: 'As tábuas estão no lugar.' },
      { scene: '🏮🌉🏮', text: 'Corrimão e lanternas!' },
      { scene: '🐴🌉🏮✨', text: 'Ponte completa: a carroça atravessa.' },
    ],
  },
  {
    id: 'dragao', name: 'Chocar o Ovo do Dragão Guardião', place: 'Ninho do Dragão', emoji: '🥚', reward: 'Noite de jogos de tabuleiro com sobremesa',
    stages: [
      { scene: '🌫️🥚🌫️', text: 'Um ovo frio na névoa.' },
      { scene: '🔥🥚🔥', text: 'O ovo aquece e brilha.' },
      { scene: '✨🥚⚡', text: 'As primeiras rachaduras!' },
      { scene: '🐣👀', text: 'Um olhinho espia lá de dentro.' },
      { scene: '☁️🐉✨🏰', text: 'O dragãozinho nasceu e voa sobre o reino!' },
    ],
  },
  {
    id: 'biblioteca', name: 'Encher a Biblioteca Encantada', place: 'Biblioteca Encantada', emoji: '📚', reward: 'Ida à livraria: cada um escolhe um livro',
    stages: [
      { scene: '🕸️🗄️🕸️', text: 'Estantes vazias e teias.' },
      { scene: '📚🗄️🕸️', text: 'A primeira estante está cheia.' },
      { scene: '📚💡📚', text: 'O lustre acendeu.' },
      { scene: '📖✨📚📖', text: 'Os livros voam pela sala!' },
      { scene: '🦉📚✨📚📖', text: 'A biblioteca está viva, com uma coruja na janela.' },
    ],
  },
  {
    id: 'banquete', name: 'Preparar o Grande Banquete', place: 'Salão do Banquete', emoji: '🍰', reward: 'Cozinhar juntos a receita escolhida pelas crianças',
    stages: [
      { scene: '🌫️🪑🌫️', text: 'Mesa vazia e lareira fria.' },
      { scene: '🔥🪑', text: 'A lareira está acesa.' },
      { scene: '🍞🍎🍇', text: 'Pães e frutas na mesa.' },
      { scene: '🍞🍗🎂', text: 'O bolo está no forno.' },
      { scene: '🎉🍗🍰🍇🎊', text: 'O banquete está servido!' },
    ],
  },
]

export const missionById = (id: string) => MISSIONS.find((m) => m.id === id) ?? MISSIONS[0]

/** Meta = 60% do XP planejado, arredondada a 50, entre 300 e 3000. */
export function missionGoal(plannedXp: number): number {
  const goal = Math.round((0.6 * plannedXp) / 50) * 50
  return Math.min(3000, Math.max(300, goal))
}

/** Estágio 0..4 (0/25/50/75/100%). */
export const stageOf = (progress: number, goal: number) => Math.min(4, Math.floor((progress / goal) * 4))
