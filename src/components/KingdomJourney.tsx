// Jornada do Reino: o XP da FAMÍLIA por semana (uma série só, cooperativa — nunca por pessoa).
// Barras em ouro escuro (#A8741E, 3:1 sobre o cartão, validado), estrela nas semanas de missão cumprida.
import { useMemo, useState } from 'react'
import { useFamily } from '../state'
import { weekXp } from '../domain/economy'
import { addDays, formatDayMonth, today, weekKey, weekStart } from '../lib/date'
import { GoldStar } from './Seal'
import { useWide } from './WeekGrid'

const BAR = '#A8741E'
const WEEKS = 8

export function KingdomJourney() {
  const f = useFamily()
  const [hover, setHover] = useState<number | null>(null)
  const [table, setTable] = useState(false)
  const wide = useWide('(min-width: 640px)')

  const data = useMemo(() => {
    const start = weekStart(today())
    return Array.from({ length: WEEKS }, (_, i) => {
      const monday = addDays(start, -7 * (WEEKS - 1 - i))
      const xp = weekXp(monday, f.events)
      const m = f.missions.find((x) => x.weekKey === weekKey(monday))
      return { monday, xp, done: Boolean(m && xp >= m.goalXp), current: i === WEEKS - 1 }
    })
  }, [f.events, f.missions])

  if (data.every((d) => d.xp === 0)) return null

  const max = Math.max(...data.map((d) => d.xp), 1)
  const step = niceStep(max)
  const top = Math.ceil(max / step) * step
  const ticks = Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step)

  // Geometria do SVG
  // No celular, uma geometria própria (o SVG não encolhe os textos).
  const W = wide ? 640 : 340
  const H = wide ? 220 : 200
  const padL = wide ? 44 : 36
  const padB = 30
  const padT = 26
  const plotW = W - padL - 8
  const plotH = H - padT - padB
  const band = plotW / WEEKS
  const barW = Math.min(24, band * 0.5)
  const y = (v: number) => padT + plotH - (v / top) * plotH

  return (
    <section className="card mb-6 p-5" aria-labelledby="jornada">
      <div className="mb-2 flex flex-wrap items-baseline gap-x-3">
        <h3 id="jornada" className="title-display flex-1 text-xl">Jornada do Reino</h3>
        <button className="min-h-12 px-2 text-sm font-semibold text-gold-deep underline-offset-4 hover:underline" onClick={() => setTable((t) => !t)} aria-expanded={table}>
          {table ? 'Ver gráfico' : 'Ver como tabela'}
        </button>
      </div>
      <p className="mb-3 text-sm text-muted">XP de toda a família por semana — todos juntos, numa barra só. <span className="inline-flex items-center gap-1 align-middle"><GoldStar size={16} glow={false} /> missão cumprida</span></p>

      {table ? (
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-muted"><th className="py-2 font-semibold">Semana</th><th className="py-2 text-right font-semibold">XP da família</th><th className="py-2 text-right font-semibold">Missão</th></tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.monday} className="border-b border-line/60">
                <td className="py-2">{formatDayMonth(d.monday)}{d.current ? ' (esta semana)' : ''}</td>
                <td className="py-2 text-right tabular-nums">{d.xp.toLocaleString('pt-BR')}</td>
                <td className="py-2 text-right">{d.done ? 'Cumprida' : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="relative">
          <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label={`XP da família nas últimas ${WEEKS} semanas. Esta semana: ${data[WEEKS - 1].xp} XP.`}>
            {/* grade e eixo Y, recessivos */}
            {ticks.map((t) => (
              <g key={t}>
                <line x1={padL} x2={W - 8} y1={y(t)} y2={y(t)} stroke="#EDE3CF" strokeWidth="1" />
                <text x={padL - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="#5B5468" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {t.toLocaleString('pt-BR')}
                </text>
              </g>
            ))}
            {data.map((d, i) => {
              const cx = padL + band * i + band / 2
              const h = Math.max(0, y(0) - y(d.xp))
              const x = cx - barW / 2
              const r = Math.min(4, h)
              return (
                <g key={d.monday}>
                  {h > 0 && (
                    <path
                      d={`M${x},${y(0)} V${y(d.xp) + r} Q${x},${y(d.xp)} ${x + r},${y(d.xp)} H${x + barW - r} Q${x + barW},${y(d.xp)} ${x + barW},${y(d.xp) + r} V${y(0)} Z`}
                      fill={BAR}
                      opacity={hover === null || hover === i ? 1 : 0.55}
                    />
                  )}
                  {d.done && <g transform={`translate(${cx - 9}, ${y(d.xp) - 22})`}><GoldStarSvg /></g>}
                  {d.current && (
                    <text x={cx} y={y(d.xp) - (d.done ? 26 : 8)} textAnchor="middle" fontSize="12" fontWeight="700" fill="#1E1A2B" style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {d.xp.toLocaleString('pt-BR')}
                    </text>
                  )}
                  <text x={cx} y={H - 10} textAnchor="middle" fontSize="11" fontWeight={d.current ? 700 : 400} fill={d.current ? '#1E1A2B' : '#5B5468'}>
                    {d.current ? 'agora' : wide || i % 2 === 0 ? formatDayMonth(d.monday) : ''}
                  </text>
                  {/* alvo de toque/hover maior que a barra */}
                  <rect
                    x={padL + band * i}
                    y={padT}
                    width={band}
                    height={plotH + padB}
                    fill="transparent"
                    onPointerEnter={() => setHover(i)}
                    onPointerLeave={() => setHover(null)}
                    onClick={() => setHover(hover === i ? null : i)}
                  />
                </g>
              )
            })}
            <line x1={padL} x2={W - 8} y1={y(0)} y2={y(0)} stroke="#CDBD9C" strokeWidth="1" />
          </svg>
          {hover !== null && (
            <div
              className="pointer-events-none absolute -top-2 z-10 w-44 -translate-x-1/2 rounded-xl bg-night-2 px-3 py-2 text-sm text-ivory shadow-lg"
              style={{ left: `clamp(5.5rem, ${((padL + band * hover + band / 2) / W) * 100}%, calc(100% - 5.5rem))` }}
              role="status"
            >
              <b>Semana de {formatDayMonth(data[hover].monday)}</b>
              <br />
              <span className="tabular-nums">{data[hover].xp.toLocaleString('pt-BR')} XP da família</span>
              {data[hover].done && <><br />Missão cumprida</>}
            </div>
          )}
        </div>
      )}
    </section>
  )
}

/** Passo "redondo" do eixo (10, 20, 50, 100, 200, 500…). */
function niceStep(max: number) {
  const raw = max / 4
  const p = 10 ** Math.floor(Math.log10(raw))
  return [1, 2, 5, 10].map((m) => m * p).find((s) => s >= raw) ?? p * 10
}

function GoldStarSvg() {
  return (
    <path
      d="M9 0 L11.6 6 L18 6.6 L13.1 10.8 L14.6 17 L9 13.7 L3.4 17 L4.9 10.8 L0 6.6 L6.4 6 Z"
      fill="#D4A23F"
      stroke="#8A5A12"
      strokeWidth="1"
      strokeLinejoin="round"
    />
  )
}
