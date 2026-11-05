// Cena ilustrada da missão da família: céu, colinas, castelo, o marco da missão e a Névoa do Sono.
// Cada estágio (0/25/50/75/100%) só acrescenta elementos e dissipa a névoa — nunca regride.
import { useId } from 'react'
import { missionById } from '../data/missions'
import { DAY, GOLD_LIGHT, NIGHT } from './scenes/palette'
import { LANDMARKS } from './scenes/landmarks'

interface Props {
  missionId: string
  stage: 0 | 1 | 2 | 3 | 4
  night?: boolean
  className?: string
}

const MIST = [0.85, 0.62, 0.4, 0.18, 0]

const STARS = [
  [40, 40, 1.4], [92, 78, 1], [150, 30, 1.6], [210, 64, 1], [268, 22, 1.2], [330, 56, 1.5], [388, 28, 1],
  [446, 70, 1.3], [560, 30, 1], [600, 84, 1.4], [120, 120, 0.9], [480, 120, 1], [20, 140, 1.1],
] as const

const SPARKLES = [
  [120, 120], [520, 104], [240, 70], [420, 60], [580, 190], [70, 210],
] as const

export function MissionScene({ missionId, stage, night = false, className }: Props) {
  const raw = useId()
  const id = `ms${raw.replace(/[^a-zA-Z0-9]/g, '')}`
  const p = night ? NIGHT : DAY
  const mission = missionById(missionId)
  const Landmark = LANDMARKS[mission.id] ?? LANDMARKS.jardim
  const mist = MIST[stage]

  return (
    <svg
      viewBox="0 0 640 360"
      width="100%"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={mission.stages[stage]?.text ?? mission.name}
      className={className}
      style={{ display: 'block' }}
    >
      <style>{`
        .ms-twinkle { animation: ms-tw 3.2s ease-in-out infinite; }
        .ms-float { animation: ms-fl 4.5s ease-in-out infinite; }
        .ms-flicker { animation: ms-fk 1.6s ease-in-out infinite; transform-origin: center bottom; transform-box: fill-box; }
        @keyframes ms-tw { 0%,100% { opacity: .55 } 50% { opacity: 1 } }
        @keyframes ms-fl { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-4px) } }
        @keyframes ms-fk { 0%,100% { transform: scaleY(1) } 50% { transform: scaleY(1.08) } }
        @media (prefers-reduced-motion: reduce) { .ms-twinkle, .ms-float, .ms-flicker { animation: none } }
      `}</style>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={p.skyTop} />
          <stop offset="1" stopColor={p.skyBottom} />
        </linearGradient>
        <radialGradient id={`${id}-sun`}>
          <stop offset="0" stopColor={night ? '#FFF6DA' : '#FFF4D6'} />
          <stop offset="0.45" stopColor={night ? '#F1E6C2' : '#F8DE9C'} stopOpacity={0.9} />
          <stop offset="1" stopColor={night ? '#F1E6C2' : '#F8DE9C'} stopOpacity={0} />
        </radialGradient>
        <linearGradient id={`${id}-ground`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={p.ground} />
          <stop offset="1" stopColor={p.groundShade} />
        </linearGradient>
        <filter id={`${id}-blur`} x="-10%" y="-50%" width="120%" height="200%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <linearGradient id={`${id}-mist`} x1="0" x2="1">
          <stop offset="0" stopColor={p.mist} stopOpacity={0} />
          <stop offset="0.2" stopColor={p.mist} stopOpacity={1} />
          <stop offset="0.8" stopColor={p.mist} stopOpacity={1} />
          <stop offset="1" stopColor={p.mist} stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* céu */}
      <rect width="640" height="360" fill={`url(#${id}-sky)`} />
      {night &&
        STARS.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill="#F8F1E1" className={i % 3 === 0 ? 'ms-twinkle' : undefined} />)}
      {/* sol ou lua */}
      <circle cx={night ? 548 : 530} cy={night ? 66 : 78} r={night ? 46 : 70} fill={`url(#${id}-sun)`} />
      {night ? (
        <g>
          <mask id={`${id}-moon`}>
            <rect width="640" height="360" fill="#000" />
            <circle cx={548} cy={66} r={19} fill="#fff" />
            <circle cx={559} cy={58} r={16} fill="#000" />
          </mask>
          <rect width="640" height="360" fill="#F6EED6" mask={`url(#${id}-moon)`} />
        </g>
      ) : (
        <circle cx={530} cy={78} r={22} fill="#FCE7AE" />
      )}
      {/* nuvens suaves (dia) */}
      {!night && (
        <g fill="#FFFFFF" opacity={0.7}>
          <ellipse cx={120} cy={70} rx={46} ry={10} />
          <ellipse cx={150} cy={62} rx={26} ry={10} />
          <ellipse cx={380} cy={46} rx={34} ry={7} />
        </g>
      )}

      {/* colinas distantes + castelo */}
      <path d="M0 210 Q80 168 170 190 T340 182 T500 176 T640 196 V360 H0Z" fill={p.hillFar} />
      <g fill={p.castle}>
        <rect x={78} y={150} width={56} height={44} />
        <rect x={70} y={134} width={18} height={60} />
        <rect x={124} y={134} width={18} height={60} />
        <rect x={98} y={124} width={16} height={34} />
        <path d="M70 134 l9 -14 l9 14Z M124 134 l9 -14 l9 14Z M98 124 l8 -16 l8 16Z" />
        <path d="M100 194 v-14 a6 6 0 0 1 12 0 v14Z" fill={p.hillFar} />
        {[74, 128].map((x) => <rect key={x} x={x + 6} y={146} width={4} height={6} fill={night ? GOLD_LIGHT : p.hillFar} opacity={night ? 0.8 : 1} />)}
      </g>
      <path d="M0 240 Q120 206 250 226 T480 218 T640 232 V360 H0Z" fill={p.hillMid} />
      {/* árvores ao longe */}
      {[34, 56, 590, 612].map((x, i) => (
        <g key={x}>
          <rect x={x - 1.5} y={226 - (i % 2) * 6} width={3} height={14} fill={p.woodShade} />
          <ellipse cx={x} cy={220 - (i % 2) * 6} rx={10} ry={16} fill={p.leaf} />
        </g>
      ))}
      {/* chão */}
      <path d="M0 276 Q160 258 320 270 T640 270 V360 H0Z" fill={`url(#${id}-ground)`} />

      {/* marco da missão (ampliado para ler bem em cartões pequenos) */}
      <g transform="translate(320 318) scale(1.32) translate(-320 -318)">
        <Landmark s={stage} p={p} id={id} night={night} />
      </g>

      {/* Névoa do Sono: dissipa a cada estágio */}
      {mist > 0 && (
        <g opacity={mist} pointerEvents="none" filter={`url(#${id}-blur)`}>
          <rect x={-40} y={212} width={720} height={34} rx={17} fill={`url(#${id}-mist)`} opacity={0.75} />
          <rect x={-80} y={256} width={520} height={26} rx={13} fill={`url(#${id}-mist)`} opacity={0.65} />
          <rect x={260} y={290} width={460} height={30} rx={15} fill={`url(#${id}-mist)`} opacity={0.6} />
          <rect x={-60} y={160} width={420} height={22} rx={11} fill={`url(#${id}-mist)`} opacity={0.45} />
        </g>
      )}

      {/* reino restaurado: brilhos dourados */}
      {stage === 4 &&
        SPARKLES.map(([x, y], i) => (
          <path
            key={i}
            d={`M${x} ${y - 8} q1.5 6.5 8 8 q-6.5 1.5 -8 8 q-1.5 -6.5 -8 -8 q6.5 -1.5 8 -8Z`}
            fill={GOLD_LIGHT}
            className="ms-twinkle"
            style={{ animationDelay: `${i * 0.5}s` }}
          />
        ))}
    </svg>
  )
}
