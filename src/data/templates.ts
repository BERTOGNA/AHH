import type { Category, HHMM, Role, Weekday } from '../db/types'

export interface TaskTemplate {
  id: string
  title: string
  emoji: string
  speak?: string
  category: Category
  xp: number
  time?: HHMM
  weekdays: Weekday[]
  on: boolean // vem marcada no onboarding
  household?: boolean // tarefa do lar (qualquer um pega)
  sharedWithAdult?: boolean
}

const ALL: Weekday[] = [1, 2, 3, 4, 5, 6, 7]
const WEEK: Weekday[] = [1, 2, 3, 4, 5]

export const TEMPLATES: Record<Role, TaskTemplate[]> = {
  child: [
    { id: 'c-cama', title: 'Arrumar a cama', emoji: '🛏️', speak: 'Hora de arrumar a sua cama!', category: 'lar', xp: 5, time: '07:00', weekdays: ALL, on: true },
    { id: 'c-dentes-m', title: 'Escovar os dentes', emoji: '🪥', speak: 'Vamos escovar os dentes!', category: 'pessoal', xp: 5, time: '07:15', weekdays: ALL, on: false },
    { id: 'c-vestir', title: 'Vestir-se sem ajuda', emoji: '👕', speak: 'Hora de vestir a sua roupa!', category: 'pessoal', xp: 5, time: '07:20', weekdays: WEEK, on: false },
    { id: 'c-pet', title: 'Dar comida ao bichinho', emoji: '🐶', speak: 'O bichinho está com fome!', category: 'cuidado', xp: 10, time: '08:00', weekdays: ALL, on: false },
    { id: 'c-mochila', title: 'Guardar a mochila e o tênis', emoji: '🎒', speak: 'Guarde a mochila e o tênis no lugar!', category: 'lar', xp: 5, time: '12:30', weekdays: WEEK, on: false },
    { id: 'c-leitura', title: 'Leitura com alguém', emoji: '📖', speak: 'Hora de ler uma história com alguém!', category: 'estudo', xp: 10, time: '16:00', weekdays: WEEK, on: true },
    { id: 'c-brinquedos', title: 'Guardar os brinquedos', emoji: '🧸', speak: 'Vamos guardar os brinquedos!', category: 'lar', xp: 10, time: '18:00', weekdays: ALL, on: true },
    { id: 'c-mesa', title: 'Ajudar a pôr a mesa', emoji: '🍽️', speak: 'Ajude a pôr a mesa do jantar!', category: 'comida', xp: 10, time: '19:00', weekdays: ALL, on: true },
    { id: 'c-prato', title: 'Levar o prato para a pia', emoji: '🥣', speak: 'Leve o seu prato para a pia!', category: 'comida', xp: 5, time: '19:40', weekdays: ALL, on: false },
    { id: 'c-dentes-n', title: 'Escovar os dentes à noite', emoji: '🌙', speak: 'Escove os dentes antes de dormir!', category: 'pessoal', xp: 5, time: '20:00', weekdays: ALL, on: true },
  ],
  teen: [
    { id: 't-quarto', title: 'Arrumar o quarto', emoji: '🛏️', category: 'lar', xp: 10, time: '07:00', weekdays: ALL, on: true },
    { id: 't-plantas', title: 'Cuidar das plantas', emoji: '🪴', category: 'lar', xp: 10, time: '09:00', weekdays: [3, 6], on: false },
    { id: 't-roupa', title: 'Estender e recolher a roupa', emoji: '🧺', category: 'lar', xp: 10, time: '10:00', weekdays: [6], on: true },
    { id: 't-licao', title: 'Lição de casa', emoji: '📚', category: 'estudo', xp: 20, time: '15:00', weekdays: WEEK, on: true },
    { id: 't-irmao', title: 'Brincar ou ler com o irmão', emoji: '🤝', category: 'cuidado', xp: 10, time: '17:00', weekdays: [2, 4], on: false },
    { id: 't-cozinhar', title: 'Ajudar a cozinhar', emoji: '🍳', category: 'comida', xp: 20, time: '18:30', weekdays: [6], on: true, sharedWithAdult: true },
    { id: 't-lixo', title: 'Levar o lixo para fora', emoji: '🗑️', category: 'lar', xp: 10, time: '19:30', weekdays: [1, 3, 5], on: true },
    { id: 't-louca', title: 'Lavar a louça do jantar', emoji: '🧽', category: 'comida', xp: 20, time: '20:00', weekdays: [2, 4], on: true },
    { id: 't-banho', title: 'Banho e higiene', emoji: '🚿', category: 'pessoal', xp: 5, time: '20:30', weekdays: ALL, on: false },
    { id: 't-mochila', title: 'Preparar a mochila', emoji: '🎒', category: 'estudo', xp: 5, time: '21:00', weekdays: [7, 1, 2, 3, 4], on: true },
    { id: 't-ler', title: 'Ler 20 minutos', emoji: '📖', category: 'estudo', xp: 10, time: '21:15', weekdays: ALL, on: false },
  ],
  adult: [
    { id: 'a-exercicio', title: 'Exercício / cuidar de si', emoji: '🏃', category: 'pessoal', xp: 10, time: '06:30', weekdays: [1, 3, 5], on: false },
    { id: 'a-cafe', title: 'Preparar o café da manhã', emoji: '☕', category: 'comida', xp: 10, time: '06:45', weekdays: WEEK, on: true },
    { id: 'a-escola', title: 'Levar e buscar na escola', emoji: '🚗', category: 'cuidado', xp: 10, time: '07:30', weekdays: WEEK, on: true },
    { id: 'a-roupa', title: 'Lavar roupa', emoji: '🧺', category: 'lar', xp: 20, time: '09:00', weekdays: [3, 6], on: true },
    { id: 'a-compras', title: 'Compras da semana', emoji: '🛒', category: 'comida', xp: 30, time: '10:00', weekdays: [6], on: true },
    { id: 'a-faxina', title: 'Faxina da casa', emoji: '🧹', category: 'lar', xp: 30, time: '14:00', weekdays: [6], on: true, household: true },
    { id: 'a-licao', title: 'Acompanhar a lição', emoji: '📚', category: 'cuidado', xp: 10, time: '17:00', weekdays: WEEK, on: false },
    { id: 'a-cardapio', title: 'Planejar o cardápio da semana', emoji: '🗒️', category: 'planejamento', xp: 20, time: '17:00', weekdays: [7], on: true },
    { id: 'a-jantar', title: 'Cozinhar o jantar', emoji: '🍲', category: 'comida', xp: 20, time: '18:30', weekdays: ALL, on: true },
    { id: 'a-louca', title: 'Lavar a louça', emoji: '🧽', category: 'comida', xp: 10, time: '20:00', weekdays: [1, 3, 5], on: true },
    { id: 'a-agenda', title: 'Organizar a agenda da família', emoji: '🗓️', category: 'planejamento', xp: 10, time: '20:00', weekdays: [7], on: true },
    { id: 'a-contas', title: 'Revisar e pagar contas', emoji: '🧾', category: 'financas', xp: 20, time: '20:30', weekdays: [5], on: true },
  ],
}

/** Atalhos do botão "Registrar feito invisível" (adultos). */
export const INVISIBLE_DEEDS: { title: string; emoji: string; category: Category; xp: number }[] = [
  { title: 'Paguei contas', emoji: '🧾', category: 'financas', xp: 20 },
  { title: 'Fiz compras', emoji: '🛒', category: 'comida', xp: 20 },
  { title: 'Levei ao médico', emoji: '🩺', category: 'cuidado', xp: 30 },
  { title: 'Lavei roupa', emoji: '🧺', category: 'lar', xp: 20 },
  { title: 'Cozinhei', emoji: '🍳', category: 'comida', xp: 20 },
  { title: 'Resolvi um problema da casa', emoji: '📞', category: 'planejamento', xp: 10 },
  { title: 'Respondi a escola', emoji: '🏫', category: 'planejamento', xp: 10 },
  { title: 'Marquei consulta', emoji: '📅', category: 'cuidado', xp: 10 },
  { title: 'Comprei presente de aniversário', emoji: '🎁', category: 'planejamento', xp: 10 },
]

/** Expedição de trabalho: criada a partir do horário de trabalho no onboarding. */
export const WORK_TASK = { title: 'Expedição de trabalho', emoji: '💼', category: 'trabalho' as Category, xp: 20 }

export const DEFAULT_REWARDS = [
  { title: 'Escolher a sobremesa', emoji: '🍨', cost: 15, on: true },
  { title: '20 min a mais de tela', emoji: '📺', cost: 15, on: true },
  { title: 'História extra antes de dormir', emoji: '📖', cost: 10, on: true },
  { title: 'Escolher o jantar de sábado', emoji: '🍕', cost: 40, on: true },
  { title: 'Escolher o filme da noite', emoji: '🎬', cost: 35, on: true },
  { title: 'Passeio no parque escolhido', emoji: '🌳', cost: 50, on: false },
  { title: 'Convidar um amigo para brincar', emoji: '🧑‍🤝‍🧑', cost: 60, on: false },
  { title: 'Cinema', emoji: '🍿', cost: 120, on: false },
]
