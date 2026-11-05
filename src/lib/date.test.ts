import { describe, expect, it } from 'vitest'
import { addDays, formatLong, formatTime, hhmm, isoWeekday, minutes, weekDates, weekKey, weekStart } from './date'

describe('date', () => {
  it('semana começa na segunda (ISO 1..7)', () => {
    expect(isoWeekday('2026-11-02')).toBe(1)
    expect(isoWeekday('2026-11-08')).toBe(7)
    expect(weekStart('2026-11-08')).toBe('2026-11-02')
    expect(weekDates('2026-11-05')).toEqual([
      '2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06', '2026-11-07', '2026-11-08',
    ])
  })
  it('vira mês, ano e passa por horário de verão', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
    expect(addDays('2028-03-01', -1)).toBe('2028-02-29')
    expect(addDays('2026-10-17', 2)).toBe('2026-10-19')
  })
  it('semana ISO', () => {
    expect(weekKey('2026-11-05')).toBe('2026-W45')
    expect(weekKey('2026-12-31')).toBe('2026-W53')
    expect(weekKey('2027-01-03')).toBe('2026-W53')
    expect(weekKey('2027-01-04')).toBe('2027-W01')
    expect(weekKey('2026-01-01')).toBe('2026-W01')
  })
  it('horas', () => {
    expect(minutes('07:30')).toBe(450)
    expect(hhmm(450)).toBe('07:30')
    expect(hhmm(1440 + 30)).toBe('00:30')
    expect(formatTime('07:00')).toBe('7h')
    expect(formatTime('19:30')).toBe('19h30')
    expect(formatLong('2026-11-05')).toBe('quinta-feira, 5 de novembro')
  })
})
