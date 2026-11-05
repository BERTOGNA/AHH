// Roupas por classe (só o que aparece no busto), na cor de joia do herói com detalhes dourados.
import type { Geo } from './geometry'
import { darken, lighten, torsoPath } from './geometry'

const GOLD = '#D4A23F'
const GOLD_L = '#F1D58A'
const GOLD_D = '#9C6B1C'

interface P {
  g: Geo
  c: string // joia
  skin: string
  skinShade: string
  small: boolean
  gid: string // prefixo de ids
}

function Torso({ g, fill }: { g: Geo; fill: string }) {
  return <path d={torsoPath(g)} fill={fill} />
}

/** Decote em V mostrando a pele. */
function VNeck({ g, skin, skinShade, depth = 6, w = 4.4 }: { g: Geo; skin: string; skinShade: string; depth?: number; w?: number }) {
  const { cx, sy } = g
  return (
    <g>
      <path d={`M ${cx - w} ${sy - 2.5} L ${cx} ${sy + depth} L ${cx + w} ${sy - 2.5} Z`} fill={skin} />
      <path d={`M ${cx - w} ${sy - 2.5} L ${cx} ${sy + depth * 0.45} L ${cx + w} ${sy - 2.5} Z`} fill={skinShade} opacity=".55" />
    </g>
  )
}

function Trim({ d, w = 0.9 }: { d: string; w?: number }) {
  return <path d={d} fill="none" stroke={GOLD} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
}

function Star({ x, y, r }: { x: number; y: number; r: number }) {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5
    const rr = i % 2 ? r * 0.45 : r
    return `${x + Math.cos(a) * rr},${y + Math.sin(a) * rr}`
  }).join(' ')
  return <polygon points={pts} fill={GOLD_L} stroke={GOLD_D} strokeWidth=".5" strokeLinejoin="round" />
}

export function Outfit({ classId, ...p }: P & { classId: string }) {
  const { g, c, small, gid } = p
  const { cx, sy, neckW, sw } = g
  const grad = `url(#${gid}-cloth)`
  const defs = (
    <defs>
      <linearGradient id={`${gid}-cloth`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={lighten(c, 0.14)} />
        <stop offset=".55" stopColor={c} />
        <stop offset="1" stopColor={darken(c, 0.18)} />
      </linearGradient>
      <linearGradient id={`${gid}-steel`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#F2F4F8" />
        <stop offset=".5" stopColor="#C3C9D6" />
        <stop offset="1" stopColor="#8C95A8" />
      </linearGradient>
    </defs>
  )
  const nb = neckW * 0.95 // meia-largura da base do pescoço
  const chestY = sy + 9.8

  switch (classId) {
    case 'mago':
      return (
        <g>
          {defs}
          <Torso g={g} fill={grad} />
          {/* gola alta do manto */}
          {[-1, 1].map((s) => (
            <path
              key={s}
              d={`M ${cx + s * (nb + 1.2)} ${sy - 2.6} L ${cx + s * (nb + 2.6)} ${sy - 10} L ${cx + s * 1.4} ${sy + 4.5} Z`}
              fill={lighten(c, 0.2)}
              stroke={GOLD}
              strokeWidth=".8"
              strokeLinejoin="round"
            />
          ))}
          <Trim d={`M ${cx} ${sy + 4.5} L ${cx} 100`} w={1.1} />
          <Star x={cx} y={chestY + 1} r={small ? 4.2 : 3.4} />
        </g>
      )

    case 'alquimista':
      return (
        <g>
          {defs}
          <Torso g={g} fill={grad} />
          <VNeck {...p} depth={5} />
          {/* avental */}
          <path d={`M ${cx - 9} ${sy + 4} L ${cx + 9} ${sy + 4} L ${cx + 12} 102 L ${cx - 12} 102 Z`} fill="#F4E9D2" />
          <path d={`M ${cx - 9} ${sy + 4} L ${cx + 9} ${sy + 4}`} stroke="#E2CFA8" strokeWidth="1.2" />
          {[-1, 1].map((s) => (
            <path key={s} d={`M ${cx + s * 8.6} ${sy + 4} L ${cx + s * (nb + 3.5)} ${sy - 2}`} stroke="#E8D9B8" strokeWidth="2.2" strokeLinecap="round" />
          ))}
          {/* frasco de poção */}
          {!small && (
            <g>
              <rect x={cx - 1.3} y={chestY - 6.4} width={2.6} height={2.8} rx={0.5} fill="#CDEFE6" stroke="#79BFAE" strokeWidth=".4" />
              <rect x={cx - 1.6} y={chestY - 7.6} width={3.2} height={1.5} rx={0.6} fill={GOLD} />
              <circle cx={cx} cy={chestY} r={3.9} fill="#CDEFE6" stroke="#79BFAE" strokeWidth=".5" />
              <path d={`M ${cx - 3.6} ${chestY + 0.6} A 3.6 3.6 0 0 0 ${cx + 3.6} ${chestY + 0.6} Z`} fill={lighten(c, 0.15)} />
              <circle cx={cx - 1.4} cy={chestY - 1.4} r={0.8} fill="#fff" opacity=".8" />
            </g>
          )}
        </g>
      )

    case 'tesoureiro':
      return (
        <g>
          {defs}
          <Torso g={g} fill="#F3ECDF" />
          {/* colete aberto em V */}
          {[-1, 1].map((s) => (
            <path
              key={s}
              d={`M ${cx + s * (sw / 2)} 104 L ${cx + s * (sw / 2)} ${sy + 10} C ${cx + s * (sw / 2)} ${sy + 2.5} ${cx + s * (sw / 2 - 5)} ${sy - 0.5} ${cx + s * (nb + 0.5)} ${sy - 2.4} L ${cx + s * 1.2} ${sy + 15} L ${cx + s * 1.2} 104 Z`}
              fill={grad}
            />
          ))}
          <Trim d={`M ${cx - nb - 0.5} ${sy - 2.4} L ${cx - 1.2} ${sy + 15} L ${cx - 1.2} 100 M ${cx + nb + 0.5} ${sy - 2.4} L ${cx + 1.2} ${sy + 15} L ${cx + 1.2} 100`} w={0.7} />
          {/* gola da camisa */}
          <path d={`M ${cx - nb} ${sy - 2.6} L ${cx - 1} ${sy + 3} L ${cx - 3.5} ${sy + 4.2} Z M ${cx + nb} ${sy - 2.6} L ${cx + 1} ${sy + 3} L ${cx + 3.5} ${sy + 4.2} Z`} fill="#FFFFFF" stroke="#E2D8C6" strokeWidth=".4" />
          {/* broche de moeda */}
          <circle cx={cx - 8.5} cy={chestY - 2} r={small ? 3.4 : 2.8} fill={GOLD} stroke={GOLD_D} strokeWidth=".5" />
          {!small && <circle cx={cx - 8.5} cy={chestY - 2} r={1.6} fill="none" stroke={GOLD_L} strokeWidth=".5" />}
          {!small && [0, 1].map((i) => <circle key={i} cx={cx + 3.4} cy={chestY + 1 + i * 4} r={0.75} fill={GOLD_L} />)}
        </g>
      )

    case 'curandeiro':
      return (
        <g>
          {defs}
          <Torso g={g} fill={grad} />
          {/* capuz dobrado em volta do pescoço */}
          <path
            d={`M ${cx - nb - 6} ${sy - 1.5} C ${cx - 10} ${sy + 8} ${cx + 10} ${sy + 8} ${cx + nb + 6} ${sy - 1.5} C ${cx + 9} ${sy + 3.4} ${cx - 9} ${sy + 3.4} ${cx - nb - 6} ${sy - 1.5} Z`}
            fill={lighten(c, 0.18)}
            stroke={GOLD}
            strokeWidth=".6"
          />
          <circle cx={cx} cy={sy + 5.6} r={1.6} fill={GOLD} stroke={GOLD_D} strokeWidth=".4" />
          {/* folha */}
          <g transform={`translate(${cx + 8.5} ${chestY + 0.5}) rotate(-28)`}>
            <path d="M 0 -5 C 3.6 -2.5 3.6 2.5 0 5 C -3.6 2.5 -3.6 -2.5 0 -5 Z" fill="#9AD89B" stroke="#4D8F5D" strokeWidth=".5" />
            {!small && <path d="M 0 -4 L 0 4.4" stroke="#4D8F5D" strokeWidth=".5" />}
          </g>
        </g>
      )

    case 'arquiteto':
      return (
        <g>
          {defs}
          <Torso g={g} fill="#EADFCB" />
          <VNeck {...p} depth={4} w={3.6} />
          {/* macacão: peitilho e alças */}
          <path d={`M ${cx - 8.5} ${sy + 5} Q ${cx - 8.5} ${sy + 3.5} ${cx - 7} ${sy + 3.5} L ${cx + 7} ${sy + 3.5} Q ${cx + 8.5} ${sy + 3.5} ${cx + 8.5} ${sy + 5} L ${cx + 9.5} 102 L ${cx - 9.5} 102 Z`} fill={grad} />
          {[-1, 1].map((s) => (
            <path key={s} d={`M ${cx + s * 7} ${sy + 4} L ${cx + s * (nb + 5)} ${sy - 1.8}`} stroke={c} strokeWidth="2.6" strokeLinecap="round" />
          ))}
          {[-1, 1].map((s) => <circle key={s} cx={cx + s * 6.2} cy={sy + 5.4} r={1} fill={GOLD} />)}
          {!small && (
            <g>
              <rect x={cx - 4.6} y={chestY - 3} width={9.2} height={6} rx={1} fill={lighten(c, 0.12)} stroke={GOLD} strokeWidth=".5" />
              {/* martelinho no bolso */}
              <rect x={cx + 1.2} y={chestY - 8.5} width={1.3} height={7} rx={0.5} fill="#9A6B3C" />
              <rect x={cx - 0.6} y={chestY - 9.6} width={5} height={2.2} rx={0.6} fill="#AEB5C2" stroke="#7E8696" strokeWidth=".3" />
            </g>
          )}
        </g>
      )

    case 'cavaleiro':
      return (
        <g>
          {defs}
          <Torso g={g} fill={grad} />
          {/* cota de malha no decote */}
          <path d={`M ${cx - nb} ${sy - 2.5} Q ${cx} ${sy + 5} ${cx + nb} ${sy - 2.5} Z`} fill="#B7BECC" />
          <Trim d={`M ${cx - nb - 0.5} ${sy - 2} Q ${cx} ${sy + 6} ${cx + nb + 0.5} ${sy - 2}`} w={1} />
          {/* ombreiras */}
          {[-1, 1].map((s) => (
            <g key={s}>
              <ellipse cx={cx + s * (sw / 2 - 7.5)} cy={sy + 5} rx={10.5} ry={6.8} fill={`url(#${gid}-steel)`} stroke="#7C8496" strokeWidth=".5" />
              <path d={`M ${cx + s * (sw / 2 - 16)} ${sy + 6.5} Q ${cx + s * (sw / 2 - 7.5)} ${sy + 9.5} ${cx + s * (sw / 2 + 1)} ${sy + 6.5}`} fill="none" stroke="#8C95A8" strokeWidth=".6" />
              <circle cx={cx + s * (sw / 2 - 9)} cy={sy + 3} r={0.9} fill={GOLD} />
            </g>
          ))}
          {/* emblema */}
          <path d={`M ${cx} ${chestY - 4} L ${cx + 3.4} ${chestY} L ${cx} ${chestY + 4} L ${cx - 3.4} ${chestY} Z`} fill={GOLD_L} stroke={GOLD_D} strokeWidth=".5" />
        </g>
      )

    case 'bardo':
      return (
        <g>
          {defs}
          <Torso g={g} fill={grad} />
          {/* gola de babados */}
          {Array.from({ length: 7 }, (_, i) => {
            const t = i / 6 - 0.5
            return <circle key={i} cx={cx + t * 19} cy={sy + 1.2 + Math.abs(t) * -3.4 + 1.6} r={2.7} fill={GOLD_L} stroke={GOLD} strokeWidth=".5" />
          })}
          {/* nota musical */}
          {!small ? (
            <g fill={GOLD_L} stroke={GOLD_D} strokeWidth=".4">
              <ellipse cx={cx + 6.4} cy={chestY + 2.4} rx={1.8} ry={1.3} transform={`rotate(-20 ${cx + 6.4} ${chestY + 2.4})`} />
              <path d={`M ${cx + 7.9} ${chestY + 2} L ${cx + 7.9} ${chestY - 4.6} L ${cx + 10.6} ${chestY - 3.2}`} fill="none" stroke={GOLD_L} strokeWidth="1" strokeLinecap="round" />
            </g>
          ) : (
            <circle cx={cx + 7} cy={chestY} r={2} fill={GOLD_L} />
          )}
        </g>
      )

    case 'escudeiro':
    default:
      return (
        <g>
          {defs}
          <Torso g={g} fill={grad} />
          {/* gola redonda dourada */}
          <path d={`M ${cx - nb} ${sy - 2.5} Q ${cx} ${sy + 4.5} ${cx + nb} ${sy - 2.5} Z`} fill={p.skin} />
          <Trim d={`M ${cx - nb - 0.4} ${sy - 2.2} Q ${cx} ${sy + 5.2} ${cx + nb + 0.4} ${sy - 2.2}`} w={1.2} />
          {/* escudinho */}
          <g transform={`translate(${cx} ${chestY})`}>
            <path d="M -4.2 -4.6 L 4.2 -4.6 L 4.2 -0.6 C 4.2 2.8 1.8 4.6 0 5.4 C -1.8 4.6 -4.2 2.8 -4.2 -0.6 Z" fill="#F8F1E1" stroke={GOLD} strokeWidth=".9" strokeLinejoin="round" />
            {!small && <path d="M -1.2 -4.2 L 1.2 -4.2 L 1.2 4.4 L 0 4.9 L -1.2 4.4 Z" fill={c} />}
          </g>
        </g>
      )
  }
}
