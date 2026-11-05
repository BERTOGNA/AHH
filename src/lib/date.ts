// Datas sempre locais ("YYYY-MM-DD"); nunca toISOString(), que vira UTC e troca o dia à noite.
// Dias da semana ISO: 1 = segunda … 7 = domingo. A semana começa na segunda (padrão BR).
import type { HHMM, ISODate, WeekKey, Weekday } from '../db/types'

export const WEEKDAYS: Weekday[] = [1, 2, 3, 4, 5, 6, 7]
export const WEEKDAY_SHORT: Record<Weekday, string> = { 1: 'Seg', 2: 'Ter', 3: 'Qua', 4: 'Qui', 5: 'Sex', 6: 'Sáb', 7: 'Dom' }
export const WEEKDAY_LONG: Record<Weekday, string> = {
  1: 'Segunda', 2: 'Terça', 3: 'Quarta', 4: 'Quinta', 5: 'Sexta', 6: 'Sábado', 7: 'Domingo',
}
const MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']

const pad = (n: number) => String(n).padStart(2, '0')

export const toISODate = (d: Date): ISODate => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

/** Meio-dia local: imune a horário de verão. */
export function parseISODate(s: ISODate): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d, 12)
}

export const today = (now = new Date()): ISODate => toISODate(now)

export const isoWeekday = (s: ISODate): Weekday => (((parseISODate(s).getDay() + 6) % 7) + 1) as Weekday

export function addDays(s: ISODate, n: number): ISODate {
  const d = parseISODate(s)
  d.setDate(d.getDate() + n)
  return toISODate(d)
}

export const weekStart = (s: ISODate): ISODate => addDays(s, 1 - isoWeekday(s))
export const weekDates = (s: ISODate): ISODate[] => WEEKDAYS.map((i) => addDays(weekStart(s), i - 1))

/** Semana ISO-8601, ex.: "2026-W45" (o ano é o da quinta-feira da semana). */
export function weekKey(s: ISODate): WeekKey {
  const thursday = parseISODate(addDays(s, 4 - isoWeekday(s)))
  const jan1 = new Date(thursday.getFullYear(), 0, 1, 12)
  const dayOfYear = Math.round((thursday.getTime() - jan1.getTime()) / 86400000)
  return `${thursday.getFullYear()}-W${pad(Math.floor(dayOfYear / 7) + 1)}`
}

export const minutes = (t: HHMM): number => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5))

export function hhmm(mins: number): HHMM {
  const m = ((Math.round(mins) % 1440) + 1440) % 1440
  return `${pad(Math.floor(m / 60))}:${pad(m % 60)}`
}

export const nowMinutes = (now = new Date()) => now.getHours() * 60 + now.getMinutes()

export function formatDayMonth(s: ISODate): string {
  const d = parseISODate(s)
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`
}

/** "quinta-feira, 5 de novembro" */
export function formatLong(s: ISODate): string {
  const d = parseISODate(s)
  const wd = WEEKDAY_LONG[isoWeekday(s)].toLowerCase()
  const suffix = isoWeekday(s) <= 5 ? '-feira' : ''
  return `${wd}${suffix}, ${d.getDate()} de ${MONTHS[d.getMonth()]}`
}

/** "7h", "7h30" */
export function formatTime(t: HHMM): string {
  const [h, m] = t.split(':')
  return `${Number(h)}h${m === '00' ? '' : m}`
}
