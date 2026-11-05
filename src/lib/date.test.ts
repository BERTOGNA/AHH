import { describe, expect, it } from 'vitest'
import { addDays, weekDates, weekKey, weekStart, weekdayOf, fromDateKey, hhmmOf, minutesOf } from './date'

describe('date', () => {
  it('semana começa na segunda', () => {
    expect(weekdayOf(fromDateKey('2026-11-02'))).toBe(0) // segunda
    expect(weekdayOf(fromDateKey('2026-11-08'))).toBe(6) // domingo
    expect(weekStart('2026-11-08')).toBe('2026-11-02')
    expect(weekDates('2026-11-05')[0]).toBe('2026-11-02')
    expect(weekDates('2026-11-05')[6]).toBe('2026-11-08')
  })
  it('vira mês e ano', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28')
  })
  it('semana ISO', () => {
    expect(weekKey('2026-11-05')).toBe('2026-W45')
    expect(weekKey('2027-01-01')).toBe('2026-W53')
    expect(weekKey('2026-01-01')).toBe('2026-W01')
  })
  it('horas', () => {
    expect(minutesOf('07:30')).toBe(450)
    expect(hhmmOf(450)).toBe('07:30')
  })
})
