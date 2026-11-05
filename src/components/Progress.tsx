interface Props {
  value: number
  max: number
  label: string
  height?: number
  color?: string
}

export function Progress({ value, max, label, height = 10, color = 'var(--color-gold-bright)' }: Props) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.min(value, max)}
      className="w-full overflow-hidden rounded-full border border-line bg-[#efe2c2]"
      style={{ height }}
    >
      <div
        className="h-full rounded-full transition-[width] duration-700 ease-out"
        style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, #f7d77a)` }}
      />
    </div>
  )
}
