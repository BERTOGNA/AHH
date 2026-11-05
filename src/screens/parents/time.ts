import type { ISODate } from '../../db/types'
import { addDays, formatDayMonth, today } from '../../lib/date'

/** "hoje", "ontem" ou "03/11" — nunca "atrasado". */
export function dayLabel(date: ISODate): string {
  const t = today()
  if (date === t) return 'hoje'
  if (date === addDays(t, -1)) return 'ontem'
  return formatDayMonth(date)
}

/** "há 20 min", "há 2 h" ou o horário. */
export function ago(ts: number, now = Date.now()): string {
  const min = Math.round((now - ts) / 60000)
  if (min < 1) return 'agora'
  if (min < 60) return `há ${min} min`
  if (min < 6 * 60) return `há ${Math.round(min / 60)} h`
  const d = new Date(ts)
  return `às ${d.getHours()}h${String(d.getMinutes()).padStart(2, '0')}`
}
