// Penteados: camada de trás (atrás da cabeça e do corpo) e de frente (topo, franja, mechas laterais).
import type { HairStyleId } from './look'
import type { Geo } from './geometry'

export interface HairInk {
  base: string
  shine: string
  dark: string
}

/** Contorno externo do topo da cabeça + a borda da franja (da têmpora direita até a esquerda). */
function cap(g: Geo, edge: string): string {
  const { cx, cy, rx, ry, top } = g
  return [
    `M ${cx - rx - 1.4} ${cy + 2}`,
    `C ${cx - rx - 2.2} ${top + ry * 0.18} ${cx - rx * 0.72} ${top - 3.6} ${cx} ${top - 3.6}`,
    `C ${cx + rx * 0.72} ${top - 3.6} ${cx + rx + 2.2} ${top + ry * 0.18} ${cx + rx + 1.4} ${cy + 2}`,
    `L ${cx + rx - 0.4} ${cy + 2}`,
    edge,
    'Z',
  ].join(' ')
}

const edges = {
  /** Franja de lado. */
  side: (g: Geo) => {
    const { cx, cy, rx, F } = g
    return `C ${cx + rx - 0.6} ${F + 2} ${cx + rx * 0.72} ${F - 1} ${cx + rx * 0.38} ${F - 1.4} C ${cx + rx * 0.02} ${F + 1.2} ${cx - rx * 0.42} ${F + 4.6} ${cx - rx * 0.78} ${F + 4.4} C ${cx - rx + 0.8} ${F + 5} ${cx - rx + 0.4} ${cy - 3} ${cx - rx + 0.4} ${cy + 2}`
  },
  /** Repartido ao meio. */
  center: (g: Geo) => {
    const { cx, cy, rx, F } = g
    return `C ${cx + rx - 0.4} ${F + 5} ${cx + rx * 0.5} ${F + 0.2} ${cx + 0.9} ${F - 2.4} L ${cx - 0.9} ${F - 2.4} C ${cx - rx * 0.5} ${F + 0.2} ${cx - rx + 0.4} ${F + 5} ${cx - rx + 0.4} ${cy + 2}`
  },
  /** Penteado para trás (rabo, coque). */
  slick: (g: Geo) => {
    const { cx, cy, rx, F } = g
    return `C ${cx + rx - 0.8} ${F + 1.5} ${cx + rx * 0.55} ${F - 3} ${cx} ${F - 3.2} C ${cx - rx * 0.55} ${F - 3} ${cx - rx + 0.8} ${F + 1.5} ${cx - rx + 0.4} ${cy + 2}`
  },
  /** Franjinha ondulada. */
  wavy: (g: Geo) => {
    const { cx, cy, rx, F } = g
    const y = F + 2.6
    const xs = [0.86, 0.5, 0.14, -0.22, -0.58, -0.88].map((t) => cx + rx * t)
    let d = `C ${cx + rx - 0.4} ${cy - 3} ${cx + rx - 0.2} ${F + 4} ${xs[0]} ${y}`
    for (let i = 1; i < xs.length; i++) {
      const mid = (xs[i - 1] + xs[i]) / 2
      d += ` Q ${mid} ${y - 4.2} ${xs[i]} ${y + (i % 2 ? 0.6 : 0)}`
    }
    return d + ` C ${cx - rx + 0.2} ${F + 4} ${cx - rx + 0.4} ${cy - 3} ${cx - rx + 0.4} ${cy + 2}`
  },
}

function Shine({ g, ink, small }: { g: Geo; ink: HairInk; small: boolean }) {
  const { cx, rx, top } = g
  return (
    <path
      d={`M ${cx - rx * 0.62} ${top + 3} Q ${cx - rx * 0.15} ${top - 1.8} ${cx + rx * 0.32} ${top - 0.4}`}
      fill="none"
      stroke={ink.shine}
      strokeWidth={small ? 2.2 : 1.7}
      strokeLinecap="round"
      opacity=".75"
    />
  )
}

/** Cachos: um anel de círculos. */
function curls(points: [number, number, number][], fill: string, shine?: string) {
  return points.map(([x, y, r], i) => (
    <g key={i}>
      <circle cx={x} cy={y} r={r} fill={fill} />
      {shine && <path d={`M ${x - r * 0.5} ${y - r * 0.25} Q ${x - r * 0.1} ${y - r * 0.75} ${x + r * 0.4} ${y - r * 0.55}`} fill="none" stroke={shine} strokeWidth=".8" strokeLinecap="round" opacity=".7" />}
    </g>
  ))
}

export function HairBack({ g, style, ink }: { g: Geo; style: HairStyleId; ink: HairInk }) {
  const { cx, cy, rx, ry, top } = g
  switch (style) {
    case 'longo':
      return (
        <path
          d={`M ${cx - rx - 1} ${cy - ry * 0.45} C ${cx - rx - 6.5} ${cy + 4} ${cx - rx - 7} ${cy + 22} ${cx - rx - 4} 102 L ${cx + rx + 4} 102 C ${cx + rx + 7} ${cy + 22} ${cx + rx + 6.5} ${cy + 4} ${cx + rx + 1} ${cy - ry * 0.45} Z`}
          fill={ink.dark}
        />
      )
    case 'ondulado':
      return (
        <path
          d={`M ${cx - rx - 1.4} ${cy - 5} C ${cx - rx - 5} ${cy + 5} ${cx - rx - 3.5} ${cy + 15} ${cx - rx + 1.5} ${cy + 17} L ${cx + rx - 1.5} ${cy + 17} C ${cx + rx + 3.5} ${cy + 15} ${cx + rx + 5} ${cy + 5} ${cx + rx + 1.4} ${cy - 5} Z`}
          fill={ink.dark}
        />
      )
    case 'cacheado': {
      const pts: [number, number, number][] = []
      for (const s of [-1, 1]) {
        pts.push([cx + s * (rx + 2), cy - 2, 4.6], [cx + s * (rx + 2.6), cy + 5, 4.4], [cx + s * (rx + 1.6), cy + 11.5, 4.2], [cx + s * (rx - 2), cy + 16, 3.8])
      }
      return <g>{curls(pts, ink.dark)}</g>
    }
    case 'crespo': {
      const R = rx * 1.48
      const ccy = cy - ry * 0.3
      const bumps: [number, number, number][] = Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2
        return [cx + Math.cos(a) * R * 0.94, ccy + Math.sin(a) * R * 0.9, 4.2]
      })
      return (
        <g>
          <ellipse cx={cx} cy={ccy} rx={R} ry={R * 0.95} fill={ink.dark} />
          {curls(bumps, ink.dark)}
          <ellipse cx={cx} cy={ccy - 1} rx={R * 0.92} ry={R * 0.86} fill={ink.base} />
          <path d={`M ${cx - R * 0.6} ${ccy - R * 0.5} Q ${cx - R * 0.1} ${ccy - R * 0.92} ${cx + R * 0.45} ${ccy - R * 0.62}`} fill="none" stroke={ink.shine} strokeWidth="1.8" strokeLinecap="round" opacity=".55" />
        </g>
      )
    }
    case 'rabo':
      return (
        <g>
          <path
            d={`M ${cx + rx * 0.4} ${top + 2} C ${cx + rx + 13} ${top - 2} ${cx + rx + 13} ${cy + 14} ${cx + rx + 5} ${cy + 26} C ${cx + rx + 7.5} ${cy + 12} ${cx + rx + 3} ${top + 9} ${cx + rx * 0.6} ${top + 8} Z`}
            fill={ink.dark}
          />
          <path d={`M ${cx + rx + 9} ${cy - 6} Q ${cx + rx + 10} ${cy + 6} ${cx + rx + 6} ${cy + 16}`} fill="none" stroke={ink.base} strokeWidth="1.4" strokeLinecap="round" opacity=".8" />
        </g>
      )
    case 'coque':
      return (
        <g>
          <circle cx={cx} cy={top - 4.2} r={7} fill={ink.dark} />
          <circle cx={cx} cy={top - 4.8} r={6} fill={ink.base} />
          <path d={`M ${cx - 3.6} ${top - 7} Q ${cx} ${top - 9.8} ${cx + 3.4} ${top - 7.4}`} fill="none" stroke={ink.shine} strokeWidth="1.2" strokeLinecap="round" opacity=".7" />
        </g>
      )
    default:
      return null
  }
}

export function HairFront({ g, style, ink, small }: { g: Geo; style: HairStyleId; ink: HairInk; small: boolean }) {
  const { cx, cy, rx, top, F } = g
  if (style === 'careca') return null

  if (style === 'cacheado') {
    // Topo de cachos, com uma franjinha de cachos pequenos.
    const ring: [number, number, number][] = []
    const n = 9
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1)
      const a = Math.PI * (1.08 + t * 0.84)
      ring.push([cx + Math.cos(a) * (rx + 0.6), cy - 3 + Math.sin(a) * (cy - top + 1.5), 4.4])
    }
    const fringe: [number, number, number][] = [-0.62, -0.3, 0.02, 0.34, 0.64].map((t, i) => [cx + rx * t, F + 1.6 + (i % 2) * 1.1, 3.3])
    return (
      <g>
        <path d={cap(g, edges.slick(g))} fill={ink.base} />
        {curls(ring, ink.base, small ? undefined : ink.shine)}
        {curls(fringe, ink.base, small ? undefined : ink.shine)}
      </g>
    )
  }

  const edge =
    style === 'curto' ? edges.side(g)
      : style === 'ondulado' ? edges.wavy(g)
        : style === 'longo' || style === 'trancas' ? edges.center(g)
          : edges.slick(g)

  return (
    <g>
      <path d={cap(g, edge)} fill={ink.base} />
      {/* leve sombra da franja sobre a testa */}
      <Shine g={g} ink={ink} small={small} />

      {style === 'longo' &&
        [-1, 1].map((s) => (
          <path
            key={s}
            d={`M ${cx + s * (rx + 1.4)} ${cy - 3} C ${cx + s * (rx + 3.4)} ${cy + 10} ${cx + s * (rx + 3)} ${cy + 22} ${cx + s * (rx + 4.6)} ${cy + 35} L ${cx + s * (rx - 2.4)} ${cy + 35} C ${cx + s * (rx - 1)} ${cy + 22} ${cx + s * (rx - 1.2)} ${cy + 9} ${cx + s * (rx - 0.4)} ${cy + 2} Z`}
            fill={ink.base}
          />
        ))}

      {style === 'ondulado' &&
        [-1, 1].map((s) => (
          <path
            key={s}
            d={`M ${cx + s * (rx + 1.4)} ${cy - 3} C ${cx + s * (rx + 4)} ${cy + 4} ${cx + s * (rx + 1)} ${cy + 8} ${cx + s * (rx + 3)} ${cy + 13} C ${cx + s * (rx + 3.6)} ${cy + 15.5} ${cx + s * (rx + 0.2)} ${cy + 16.5} ${cx + s * (rx - 1.2)} ${cy + 15} C ${cx + s * (rx - 0.8)} ${cy + 10} ${cx + s * (rx - 1.6)} ${cy + 6} ${cx + s * (rx - 0.4)} ${cy + 2} Z`}
            fill={ink.base}
          />
        ))}

      {style === 'trancas' &&
        [-1, 1].map((s) => {
          const x = cx + s * (rx + 0.8)
          const segs = [0, 1, 2, 3, 4, 5]
          return (
            <g key={s}>
              {segs.map((i) => (
                <ellipse key={i} cx={x + s * Math.min(i, 2) * 0.25} cy={cy + 4 + i * 4.6} rx={3} ry={3.1} fill={i % 2 ? ink.base : ink.dark} />
              ))}
              <rect x={x - 2.2} y={cy + 4 + 6 * 4.6 - 2.6} width={4.4} height={2.2} rx={1.1} fill="#D4A23F" />
              <path d={`M ${x - 1.6} ${cy + 4 + 6 * 4.6 - 0.4} L ${x} ${cy + 4 + 6 * 4.6 + 4.2} L ${x + 1.6} ${cy + 4 + 6 * 4.6 - 0.4} Z`} fill={ink.base} />
            </g>
          )
        })}

      {style === 'rabo' && <circle cx={cx + rx * 0.82} cy={top + 4.6} r={1.9} fill="#D4A23F" stroke="#F1D58A" strokeWidth=".5" />}
      {style === 'coque' && <rect x={cx - 4.6} y={top - 1.6} width={9.2} height={2.4} rx={1.2} fill="#D4A23F" />}
    </g>
  )
}
