import type { ReactNode } from 'react'
import type { Weekday } from '../../db/types'
import { WEEKDAYS, WEEKDAY_SHORT } from '../../lib/date'

export function Stepper({ value, onChange, min, max, step = 1, label, suffix }: {
  value: number; onChange: (v: number) => void; min: number; max: number; step?: number; label: string; suffix?: ReactNode
}) {
  return (
    <div className="flex items-center gap-2" role="group" aria-label={label}>
      <button type="button" className="btn btn-ghost h-12 w-12 p-0 text-xl" aria-label={`Diminuir ${label}`} disabled={value <= min} onClick={() => onChange(Math.max(min, value - step))}>
        −
      </button>
      <output className="min-w-12 text-center text-lg font-bold tabular-nums" aria-live="polite">
        {value}
        {suffix}
      </output>
      <button type="button" className="btn btn-ghost h-12 w-12 p-0 text-xl" aria-label={`Aumentar ${label}`} disabled={value >= max} onClick={() => onChange(Math.min(max, value + step))}>
        +
      </button>
    </div>
  )
}

export function DayChips({ days, onToggle, label, small }: { days: Weekday[]; onToggle: (d: Weekday) => void; label: string; small?: boolean }) {
  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label={label}>
      {WEEKDAYS.map((d) => (
        <button
          key={d}
          type="button"
          className={`chip justify-center px-0 ${small ? 'min-h-11 w-11 text-sm' : 'w-14'}`}
          aria-pressed={days.includes(d)}
          onClick={() => onToggle(d)}
        >
          {WEEKDAY_SHORT[d]}
        </button>
      ))}
    </div>
  )
}

export function TimeField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-semibold">{label}</span>
      <input type="time" step={900} className="field w-36 tabular-nums" value={value} onChange={(e) => e.target.value && onChange(e.target.value)} />
    </label>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`card p-4 sm:p-5 ${className}`}>{children}</div>
}
