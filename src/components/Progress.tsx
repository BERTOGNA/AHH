interface Props {
  value: number
  max: number
  label: string
  height?: number
  /** Cor do preenchimento (padrão: ouro metálico). */
  color?: string
  /** Trilho para fundo noturno. */
  night?: boolean
}

export function Progress({ value, max, label, height = 10, color, night }: Props) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.min(value, max)}
      className="relative w-full overflow-hidden rounded-full"
      style={{
        height,
        background: night ? 'rgb(255 255 255 / .08)' : '#EFE6D3',
        boxShadow: night ? 'inset 0 1px 2px rgb(0 0 0 / .4), 0 0 0 1px rgb(241 213 138 / .18)' : 'inset 0 1px 2px rgb(30 26 43 / .12)',
      }}
    >
      <div
        className="relative h-full rounded-full transition-[width] duration-700 ease-out"
        style={{
          width: `${pct}%`,
          minWidth: pct > 0 ? height : 0,
          background: color ?? 'linear-gradient(90deg, #C8902F, #E7BC5C 60%, #F6DD96)',
          boxShadow: night ? '0 0 12px rgb(241 213 138 / .55)' : 'inset 0 -1px 0 rgb(138 90 18 / .3)',
        }}
      >
        <span className="absolute inset-x-1 top-[18%] h-[28%] rounded-full bg-white/45" aria-hidden="true" />
      </div>
    </div>
  )
}
