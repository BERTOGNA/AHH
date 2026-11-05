// Medalhas das conquistas: moldura de ouro com fita, interior na cor de uma joia e um símbolo desenhado.
// Bloqueada = medalhão de pergaminho com o símbolo em silhueta suave e um cadeado pequeno (nada triste).
import { useId } from 'react'
import { SYMBOLS, star } from './symbols'

const JEWELS = {
  topazio: { base: '#B0501A', light: '#D9783E', dark: '#7E3410' },
  esmeralda: { base: '#1D7350', light: '#3FA374', dark: '#11513A' },
  ametista: { base: '#7A3BA6', light: '#A26BCB', dark: '#55257A' },
  safira: { base: '#2550B8', light: '#5B82E0', dark: '#173985' },
} as const

const FAMILY: Record<string, keyof typeof JEWELS> = {
  primeira_tarefa: 'topazio', tarefas_10: 'topazio', tarefas_50: 'topazio', tarefas_100: 'topazio',
  cozinha_10: 'esmeralda', lar_15: 'esmeralda', estudo_15: 'esmeralda', cuidado_10: 'esmeralda', financas_5: 'esmeralda', planejamento_5: 'esmeralda',
  juntos_5: 'ametista', chamado_5: 'ametista', gratidao_5: 'ametista', gratidao_rec_10: 'ametista', mentor_1: 'ametista', mentor_10: 'ametista',
  missao_1: 'safira', missao_3: 'safira', semana_acesa: 'safira', nivel_10: 'safira',
}

/** Conquistas de nível maior ganham louros, fita dupla e estrela no topo. */
const RICH = new Set(['tarefas_100', 'mentor_10', 'missao_3'])

const LOCKED = { base: '#E7DCC6', light: '#F3ECDD', dark: '#B9AC92' }

export function AchievementBadge({ id, size = 72, locked = false, className }: { id: string; size?: number; locked?: boolean; className?: string }) {
  const u = useId().replace(/:/g, '')
  const s = size < 40
  const rich = RICH.has(id)
  const j = locked ? LOCKED : JEWELS[FAMILY[id] ?? 'safira']
  const Sym = SYMBOLS[id] ?? SYMBOLS.nivel_10
  const gold = locked ? ['#E9DFCB', '#CBBFA6', '#F1E8D6', '#AFA286'] : ['#F8E3A3', '#D4A23F', '#F3DDA0', '#9C6B1C']
  const fg = locked ? '#CBBFA6' : '#FFF6DA'
  const ac = locked ? '#BFB295' : '#F1D58A'
  const dk = locked ? '#9E927A' : j.dark

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" focusable="false" className={className}>
      <defs>
        <linearGradient id={`${u}g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={gold[0]} />
          <stop offset=".38" stopColor={gold[1]} />
          <stop offset=".62" stopColor={gold[2]} />
          <stop offset="1" stopColor={gold[3]} />
        </linearGradient>
        <radialGradient id={`${u}j`} cx=".42" cy=".34" r=".75">
          <stop offset="0" stopColor={j.light} />
          <stop offset=".6" stopColor={j.base} />
          <stop offset="1" stopColor={j.dark} />
        </radialGradient>
        <linearGradient id={`${u}r`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={j.base} />
          <stop offset="1" stopColor={j.dark} />
        </linearGradient>
      </defs>

      {/* sombra */}
      {!s && <ellipse cx="50" cy="92" rx="26" ry="3.5" fill="#1E1A2B" opacity=".12" />}

      {/* fitas atrás da medalha */}
      {rich && !locked && <path d="M30 70l-10 22 9-3 5 8 9-22zM70 70l10 22-9-3-5 8-9-22z" fill={`url(#${u}g)`} />}
      <path d="M36 72l-7 20 8-3 5 7 7-19zM64 72l7 20-8-3-5 7-7-19z" fill={`url(#${u}r)`} />

      {/* louros: dois ramos subindo pelas laterais */}
      {rich && <Laurels color={locked ? '#D6CBB4' : '#D4A23F'} stem={locked ? '#C9BCA2' : '#B8862C'} s={s} />}

      {/* moldura e joia */}
      <circle cx="50" cy="48" r="37" fill={`url(#${u}g)`} />
      <circle cx="50" cy="48" r="33.5" fill={j.dark} opacity={locked ? 0.25 : 0.55} />
      <circle cx="50" cy="48" r="32" fill={`url(#${u}j)`} />
      {!s && <circle cx="50" cy="48" r="29" fill="none" stroke={locked ? '#FFFFFF' : '#F1D58A'} strokeOpacity={locked ? 0.6 : 0.55} strokeWidth="1" strokeDasharray={rich ? '0' : '1.5 2.5'} />}

      {/* símbolo (levemente encolhido para caber no disco) */}
      <g transform="translate(50 48) scale(.74) translate(-50 -48)" opacity={locked ? 0.9 : 1}>
        <Sym fg={fg} ac={ac} dk={dk} s={s} />
      </g>

      {/* estrela no topo das conquistas maiores */}
      {rich && <path d={star(50, 10.5, 7, 3)} fill={`url(#${u}g)`} stroke={locked ? '#AFA286' : '#9C6B1C'} strokeOpacity=".4" strokeWidth=".8" />}

      {/* brilho */}
      {!s && !locked && <path d="M27 33a27 27 0 0 1 16-13" stroke="#FFFFFF" strokeOpacity=".5" strokeWidth="2.6" fill="none" strokeLinecap="round" />}

      {/* cadeado discreto */}
      {locked && (
        <g transform="translate(70 66)">
          <circle r="10" fill="#FFFCF6" stroke="#CBBFA6" strokeWidth="1.5" />
          <path d="M-3.5-1.5v-2.5a3.5 3.5 0 0 1 7 0v2.5" stroke="#8C8170" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <rect x="-5" y="-1.8" width="10" height="7.5" rx="1.8" fill="#8C8170" />
        </g>
      )}
    </svg>
  )
}

function Laurels({ color, stem, s }: { color: string; stem: string; s: boolean }) {
  const r = 43
  const angles = s ? [212, 188, 164, 140] : [214, 198, 182, 166, 150, 134]
  const pos = (deg: number, rr = r) => {
    const t = (deg * Math.PI) / 180
    return [50 + rr * Math.cos(t), 48 - rr * Math.sin(t)] as const
  }
  const leaves = (mirror: boolean) =>
    angles.map((deg, i) => {
      const [x1, y1] = pos(deg)
      const [x2, y2] = pos(deg - 6)
      const out = i % 2 ? 3 : -3 // folhas alternadas para dentro e para fora do ramo
      const [lx, ly] = pos(deg - 3, r + out)
      const ang = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI + (i % 2 ? 25 : -25)
      const x = mirror ? 100 - lx : lx
      return <ellipse key={`${mirror}${deg}`} cx={x} cy={ly} rx="6" ry="2.9" fill={color} transform={`rotate(${mirror ? 180 - ang : ang} ${x} ${ly})`} />
    })
  const [sx, sy] = pos(216)
  const [ex, ey] = pos(128)
  return (
    <g>
      <path d={`M${sx} ${sy}A${r} ${r} 0 0 1 ${ex} ${ey}`} stroke={stem} strokeWidth="1.6" fill="none" />
      <path d={`M${100 - sx} ${sy}A${r} ${r} 0 0 0 ${100 - ex} ${ey}`} stroke={stem} strokeWidth="1.6" fill="none" />
      {leaves(false)}
      {leaves(true)}
    </g>
  )
}
