// Datas sempre locais, no formato "YYYY-MM-DD". Semana começa na segunda (padrão BR).

/** 0 = segunda … 6 = domingo */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6

export const WEEKDAYS: Weekday[] = [0, 1, 2, 3, 4, 5, 6]
export const WEEKDAY_SHORT = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
export const WEEKDAY_LONG = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']

const pad = (n: number) => String(n).padStart(2, '0')

export function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function todayKey(now = new Date()): string {
  return toDateKey(now)
}

export function weekdayOf(d: Date): Weekday {
  return ((d.getDay() + 6) % 7) as Weekday
}

export function addDays(key: string, n: number): string {
  const d = fromDateKey(key)
  d.setDate(d.getDate() + n)
  return toDateKey(d)
}

/** Data (YYYY-MM-DD) da segunda-feira da semana que contém `key`. */
export function weekStart(key: string): string {
  return addDays(key, -weekdayOf(fromDateKey(key)))
}

/** As 7 datas da semana (seg → dom) que contém `key`. */
export function weekDates(key: string): string[] {
  const start = weekStart(key)
  return WEEKDAYS.map((i) => addDays(start, i))
}

/** Identificador ISO da semana, ex.: "2026-W45". */
export function weekKey(key: string): string {
  const d = fromDateKey(key)
  // Quinta-feira da mesma semana ISO decide o ano.
  const thursday = new Date(d)
  thursday.setDate(d.getDate() + 3 - weekdayOf(d))
  const year = thursday.getFullYear()
  const jan4 = new Date(year, 0, 4)
  const week = 1 + Math.round(((thursday.getTime() - jan4.getTime()) / 86400000 - 3 + weekdayOf(jan4)) / 7)
  return `${year}-W${pad(week)}`
}

export function minutesOf(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

export function hhmmOf(minutes: number): string {
  const m = Math.max(0, Math.min(24 * 60 - 1, Math.round(minutes)))
  return `${pad(Math.floor(m / 60))}:${pad(m % 60)}`
}

export function nowMinutes(now = new Date()): number {
  return now.getHours() * 60 + now.getMinutes()
}

export function formatDayMonth(key: string): string {
  const d = fromDateKey(key)
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`
}
