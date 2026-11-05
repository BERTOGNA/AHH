// Marcos das missões. Cada estágio (0–4) só ADICIONA elementos: o que foi restaurado fica.
import type { ReactElement } from 'react'
import { FLOWERS, GOLD, GOLD_LIGHT, JEWELS, type ScenePalette } from './palette'

export interface LandmarkProps {
  s: number // estágio 0..4
  p: ScenePalette
  id: string // prefixo único para gradientes
  night: boolean
}

const Flower = ({ x, y, c, r = 6 }: { x: number; y: number; c: string; r?: number }) => (
  <g>
    <path d={`M${x} ${y + r * 0.6} q-1 ${r * 1.4} 0 ${r * 2.2}`} stroke="#2F6A47" strokeWidth={1.6} fill="none" />
    {[0, 72, 144, 216, 288].map((a) => (
      <ellipse key={a} cx={x} cy={y - r * 0.55} rx={r * 0.42} ry={r * 0.62} fill={c} transform={`rotate(${a} ${x} ${y})`} />
    ))}
    <circle cx={x} cy={y} r={r * 0.32} fill={GOLD_LIGHT} />
  </g>
)

const Sprout = ({ x, y, k = 1 }: { x: number; y: number; k?: number }) => (
  <g>
    <path d={`M${x} ${y} v${-8 * k}`} stroke="#3E8A5C" strokeWidth={1.8} />
    <path d={`M${x} ${y - 6 * k} q${-7 * k} ${-1 * k} ${-8 * k} ${-7 * k} q${6 * k} 0 ${8 * k} ${7 * k}Z`} fill="#5BA77A" />
    <path d={`M${x} ${y - 7 * k} q${7 * k} ${-1 * k} ${8 * k} ${-7 * k} q${-6 * k} 0 ${-8 * k} ${7 * k}Z`} fill="#4C9A6C" />
  </g>
)

const Butterfly = ({ x, y, c }: { x: number; y: number; c: string }) => (
  <g transform={`translate(${x} ${y})`}>
   <g className="ms-float">
    <ellipse cx={-4} cy={-2} rx={4.5} ry={3.5} fill={c} transform="rotate(-25)" />
    <ellipse cx={4} cy={-2} rx={4.5} ry={3.5} fill={c} transform="rotate(25)" />
    <ellipse cx={-3} cy={3} rx={3} ry={2.2} fill={c} opacity={0.85} />
    <ellipse cx={3} cy={3} rx={3} ry={2.2} fill={c} opacity={0.85} />
    <rect x={-0.6} y={-4} width={1.2} height={9} rx={0.6} fill="#3A2A2A" />
   </g>
  </g>
)

const Lantern = ({ x, y, lit }: { x: number; y: number; lit: boolean }) => (
  <g>
    {lit && <circle cx={x} cy={y} r={9} fill={GOLD_LIGHT} opacity={0.35} className="ms-twinkle" />}
    <rect x={x - 3} y={y - 4} width={6} height={8} rx={1.5} fill={lit ? GOLD_LIGHT : '#8C8FB5'} stroke={GOLD} strokeWidth={1} />
  </g>
)

// ---------------- Jardim ----------------
function Jardim({ s, p, id }: LandmarkProps) {
  const beds = [
    { x: 215, y: 296 },
    { x: 425, y: 296 },
  ]
  return (
    <g>
      {/* canteiros */}
      {beds.map((b, i) => (
        <ellipse key={i} cx={b.x} cy={b.y} rx={70} ry={16} fill={s === 0 ? '#B79A72' : '#7A5A3A'} opacity={s === 0 ? 0.85 : 1} />
      ))}
      {/* caminho de pedras */}
      {s >= 2 &&
        [
          [320, 342, 20],
          [314, 322, 17],
          [322, 305, 14],
          [317, 292, 11],
        ].map(([x, y, r], i) => <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.42} fill={p.stone} stroke={p.stoneShade} strokeWidth={1.2} />)}
      {/* cerca: caída no começo, de pé depois */}
      {s < 2 ? (
        <g fill={p.wood} stroke={p.woodShade} strokeWidth={1}>
          <rect x={120} y={300} width={60} height={5} rx={2} transform="rotate(-12 150 302)" />
          <rect x={470} y={306} width={56} height={5} rx={2} transform="rotate(9 498 308)" />
          <rect x={135} y={282} width={5} height={22} rx={2} transform="rotate(-35 137 300)" />
        </g>
      ) : (
        <g fill={p.wood} stroke={p.woodShade} strokeWidth={1}>
          {[110, 134, 158, 482, 506, 530].map((x) => (
            <path key={x} d={`M${x} 302 v-24 l4 -5 l4 5 v24Z`} />
          ))}
          <rect x={106} y={284} width={64} height={4} rx={2} />
          <rect x={478} y={284} width={64} height={4} rx={2} />
        </g>
      )}
      {/* pedra solitária */}
      <path d="M268 300 q6 -16 22 -12 q12 4 10 12Z" fill={p.stoneShade} />
      {/* brotos */}
      {s >= 1 &&
        [175, 200, 228, 255, 390, 415, 440, 465].map((x, i) => <Sprout key={x} x={x} y={296 - (i % 2) * 3} k={s >= 2 ? 1.1 : 0.9} />)}
      {/* flores */}
      {s >= 2 &&
        [180, 212, 246, 398, 430, 462].map((x, i) => <Flower key={x} x={x} y={281 - (i % 2) * 5} c={FLOWERS[i % FLOWERS.length]} />)}
      {/* fonte */}
      {s >= 3 && (
        <g>
          <defs>
            <linearGradient id={`${id}-water`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#CFE6F7" />
              <stop offset="1" stopColor={p.water} />
            </linearGradient>
          </defs>
          <ellipse cx={320} cy={262} rx={46} ry={10} fill={p.stoneShade} />
          <path d="M276 262 h88 v-12 q-44 -10 -88 0Z" fill={p.stone} />
          <ellipse cx={320} cy={250} rx={44} ry={8} fill={`url(#${id}-water)`} />
          <rect x={314} y={214} width={12} height={36} rx={3} fill={p.stone} />
          <ellipse cx={320} cy={214} rx={20} ry={5} fill={p.stone} />
          <path className="ms-float" d="M320 210 q-4 -20 -22 -8 M320 210 q4 -20 22 -8 M320 210 v-16" stroke="#BFE0F5" strokeWidth={3} fill="none" strokeLinecap="round" />
        </g>
      )}
      {/* final: mais flores, borboletas e o banco da família */}
      {s >= 4 && (
        <g>
          {[150, 270, 372, 492].map((x, i) => <Flower key={x} x={x} y={274 + (i % 2) * 4} c={FLOWERS[(i + 2) % FLOWERS.length]} r={7} />)}
          <Butterfly x={250} y={200} c={JEWELS.ametista} />
          <Butterfly x={398} y={186} c="#E39A3B" />
          <g fill={p.wood} stroke={p.woodShade} strokeWidth={1}>
            <rect x={366} y={326} width={52} height={6} rx={2} />
            <rect x={366} y={312} width={52} height={5} rx={2} />
            <rect x={370} y={332} width={5} height={12} />
            <rect x={409} y={332} width={5} height={12} />
          </g>
        </g>
      )}
    </g>
  )
}

// ---------------- Farol ----------------
function Farol({ s, p, id, night }: LandmarkProps) {
  const lit = night ? GOLD_LIGHT : '#F5D778'
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-sea`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={p.waterLight} />
          <stop offset="1" stopColor={p.water} />
        </linearGradient>
        <linearGradient id={`${id}-beam`} x1="1" x2="0" y1="0" y2="0">
          <stop offset="0" stopColor={GOLD_LIGHT} stopOpacity={0.85} />
          <stop offset="1" stopColor={GOLD_LIGHT} stopOpacity={0} />
        </linearGradient>
      </defs>
      {/* mar */}
      <path d="M0 268 q80 -8 160 0 t160 0 t160 0 t160 0 V360 H0Z" fill={`url(#${id}-sea)`} />
      {[290, 312, 336].map((y, i) => (
        <path key={y} d={`M${40 + i * 30} ${y} q20 -5 40 0 M${420 - i * 20} ${y + 6} q20 -5 40 0`} stroke="#FFFFFF" strokeOpacity={0.45} strokeWidth={2} fill="none" strokeLinecap="round" />
      ))}
      {/* rocha */}
      <path d="M232 312 q20 -40 60 -44 q40 -6 66 10 q30 14 50 34 q-90 18 -176 0Z" fill={p.stoneShade} />
      <path d="M262 290 q30 -22 70 -18 q28 4 44 18 q-56 10 -114 0Z" fill={p.stone} />
      {/* feixe */}
      {s >= 4 && <path d="M320 128 L40 58 L40 150Z" fill={`url(#${id}-beam)`} className="ms-twinkle" />}
      {/* torre */}
      <path d="M300 286 L308 136 H332 L340 286Z" fill={p.ivory} />
      {[176, 222, 262].map((y) => {
        const l = (yy: number) => 308 - ((yy - 136) * 8) / 150
        const r = (yy: number) => 332 + ((yy - 136) * 8) / 150
        return <path key={y} d={`M${l(y)} ${y} H${r(y)} L${r(y + 14)} ${y + 14} H${l(y + 14)}Z`} fill={JEWELS.topazio} opacity={0.9} />
      })}
      {/* galeria e lanterna */}
      <rect x={298} y={130} width={44} height={7} rx={2} fill={p.woodShade} />
      <rect x={306} y={108} width={28} height={22} rx={3} fill={s >= 3 ? lit : '#7C8AA8'} stroke={p.woodShade} strokeWidth={2} />
      <path d="M302 108 L320 92 L338 108Z" fill={JEWELS.topazio} />
      {s >= 3 && <circle cx={320} cy={119} r={22} fill={GOLD_LIGHT} opacity={0.4} className="ms-twinkle" />}
      {/* janelas */}
      {[160, 200, 240].map((y) => (
        <rect key={y} x={316} y={y} width={8} height={11} rx={4} fill={s >= 1 ? lit : '#5A6485'} />
      ))}
      {/* porta e escada iluminada */}
      <path d="M313 286 v-16 a7 7 0 0 1 14 0 v16Z" fill={s >= 2 ? lit : '#5A6485'} />
      {s >= 2 &&
        [0, 1, 2, 3].map((i) => <rect key={i} x={300 + i * 7} y={286 + i * 4} width={14} height={4} rx={1} fill={p.stone} stroke={p.stoneShade} strokeWidth={0.8} />)}
      {/* barquinhos */}
      {s >= 4 &&
        [
          [110, 300],
          [500, 312],
        ].map(([x, y], i) => (
          <g key={i} className="ms-float">
            <path d={`M${x - 20} ${y} h40 l-8 9 h-24Z`} fill={p.wood} />
            <path d={`M${x} ${y - 2} v-30 l18 26Z`} fill={p.ivory} />
            <path d={`M${x - 2} ${y - 4} v-22 l-12 20Z`} fill={i ? JEWELS.safira : JEWELS.ametista} />
          </g>
        ))}
    </g>
  )
}

// ---------------- Ponte ----------------
function Ponte({ s, p, id }: LandmarkProps) {
  const deckY = 258
  const pillars = [230, 320, 410]
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-river`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={p.waterLight} />
          <stop offset="1" stopColor={p.water} />
        </linearGradient>
      </defs>
      {/* rio entre as margens */}
      <path d="M150 360 C200 320 190 290 230 262 L410 262 C450 290 440 320 490 360Z" fill={`url(#${id}-river)`} />
      <path d="M250 300 q20 -4 40 0 M350 322 q20 -4 40 0 M300 344 q20 -4 40 0" stroke="#FFFFFF" strokeOpacity={0.5} strokeWidth={2} fill="none" strokeLinecap="round" />
      {/* cabeceiras */}
      <path d="M60 300 Q120 262 214 262 L226 300Z" fill={p.groundShade} />
      <path d="M150 268 h64 l10 22 h-74Z" fill={p.stone} stroke={p.stoneShade} strokeWidth={1.5} />
      <path d="M580 300 Q520 262 426 262 L414 300Z" fill={p.groundShade} />
      <path d="M416 290 l10 -22 h64 v22Z" fill={p.stone} stroke={p.stoneShade} strokeWidth={1.5} />
      {/* ponte quebrada: tocos e tábuas boiando */}
      {s < 2 && (
        <g fill={p.wood} stroke={p.woodShade} strokeWidth={1}>
          <rect x={205} y={deckY} width={36} height={8} rx={2} transform={`rotate(14 205 ${deckY})`} />
          <rect x={400} y={deckY + 6} width={36} height={8} rx={2} transform={`rotate(-14 436 ${deckY})`} />
          <rect x={286} y={318} width={30} height={6} rx={2} transform="rotate(-8 300 320)" />
          <rect x={340} y={334} width={26} height={6} rx={2} transform="rotate(10 350 336)" />
        </g>
      )}
      {/* pilares */}
      {s >= 1 &&
        pillars.map((x) => (
          <g key={x}>
            <rect x={x - 11} y={deckY + 8} width={22} height={52} rx={3} fill={p.stone} stroke={p.stoneShade} strokeWidth={1.5} />
            <rect x={x - 14} y={deckY + 4} width={28} height={8} rx={2} fill={p.stoneShade} />
          </g>
        ))}
      {/* tábuas */}
      {s >= 2 && (
        <g>
          <path d={`M200 ${deckY + 6} Q320 ${deckY - 26} 440 ${deckY + 6} v10 Q320 ${deckY - 16} 200 ${deckY + 16}Z`} fill={p.wood} stroke={p.woodShade} strokeWidth={1.5} />
          {Array.from({ length: 11 }, (_, i) => 210 + i * 21).map((x) => {
            const t = (x - 320) / 120
            const y = deckY - 10 + 16 * t * t
            return <line key={x} x1={x} y1={y} x2={x} y2={y + 10} stroke={p.woodShade} strokeWidth={1} />
          })}
        </g>
      )}
      {/* corrimão e lanternas */}
      {s >= 3 && (
        <g>
          <path d={`M200 ${deckY - 12} Q320 ${deckY - 44} 440 ${deckY - 12}`} stroke={p.woodShade} strokeWidth={3} fill="none" />
          {[210, 260, 320, 380, 430].map((x) => {
            const t = (x - 320) / 120
            const y = deckY - 28 + 16 * t * t
            return (
              <g key={x}>
                <line x1={x} y1={y} x2={x} y2={y + 18} stroke={p.woodShade} strokeWidth={2.5} />
                {(x === 210 || x === 320 || x === 430) && <Lantern x={x} y={y - 8} lit />}
              </g>
            )
          })}
        </g>
      )}
      {/* carroça atravessando */}
      {s >= 4 && (
        <g transform={`translate(296 ${deckY - 46})`}>
          <rect x={0} y={8} width={46} height={18} rx={3} fill={JEWELS.topazio} />
          <path d="M-2 8 q25 -20 50 0Z" fill={p.ivory} />
          <circle cx={10} cy={28} r={7} fill={p.woodShade} />
          <circle cx={36} cy={28} r={7} fill={p.woodShade} />
          <circle cx={10} cy={28} r={2.5} fill={GOLD} />
          <circle cx={36} cy={28} r={2.5} fill={GOLD} />
          {/* bandeirinha */}
          <path d="M46 8 v-22 l14 6 l-14 6" fill={JEWELS.safira} stroke={p.woodShade} strokeWidth={1} />
        </g>
      )}
    </g>
  )
}

// ---------------- Dragão ----------------
function Dragao({ s, p, id }: LandmarkProps) {
  return (
    <g>
      <defs>
        <radialGradient id={`${id}-egg`} cx="0.4" cy="0.35" r="0.75">
          <stop offset="0" stopColor={s >= 1 ? '#FFF1C9' : '#E8E4F2'} />
          <stop offset="0.6" stopColor={s >= 1 ? '#F1C66E' : '#C9C3DD'} />
          <stop offset="1" stopColor={s >= 1 ? JEWELS.topazio : '#9F98BD'} />
        </radialGradient>
        <radialGradient id={`${id}-glow`}>
          <stop offset="0" stopColor={GOLD_LIGHT} stopOpacity={0.8} />
          <stop offset="1" stopColor={GOLD_LIGHT} stopOpacity={0} />
        </radialGradient>
      </defs>
      {/* rocha do ninho */}
      <path d="M200 312 q30 -42 120 -46 q90 4 120 46Z" fill={p.stoneShade} />
      {/* brilho */}
      {s >= 1 && <circle cx={320} cy={238} r={s >= 3 ? 86 : 70} fill={`url(#${id}-glow)`} className="ms-twinkle" />}
      {/* ovo (inteiro até 3; cascas no 4) */}
      {s < 4 ? (
        <g>
          <ellipse cx={320} cy={240} rx={34} ry={44} fill={`url(#${id}-egg)`} />
          {/* pintinhas */}
          <circle cx={308} cy={226} r={4} fill="#FFFFFF" opacity={0.35} />
          <circle cx={334} cy={250} r={5} fill={JEWELS.esmeralda} opacity={s >= 1 ? 0.35 : 0.15} />
          <circle cx={312} cy={262} r={3.5} fill={JEWELS.esmeralda} opacity={s >= 1 ? 0.35 : 0.15} />
          {s >= 2 && <path d="M296 230 l9 7 l7 -9 l8 8 l9 -7 l8 8 l8 -6" stroke="#6A3A12" strokeWidth={2.2} fill="none" strokeLinejoin="round" />}
          {s >= 3 && (
            <g>
              <path d="M297 228 l9 7 l7 -9 l8 8 l9 -7 l8 8 l8 -6 Q344 206 320 196 Q296 206 297 228Z" fill="#2A1E14" opacity={0.85} />
              <circle cx={322} cy={218} r={8} fill={GOLD_LIGHT} />
              <circle cx={324} cy={218} r={4} fill="#1E1A2B" />
              <circle cx={326} cy={216} r={1.4} fill="#FFFFFF" />
            </g>
          )}
        </g>
      ) : (
        <g>
          <path d="M290 262 q-4 -26 12 -34 l8 8 l8 -8 l8 8 l8 -8 q16 10 10 34Z" fill={`url(#${id}-egg)`} />
          <path d="M346 250 q10 -16 24 -10 l-4 9 l8 3 q-6 14 -24 10Z" fill={`url(#${id}-egg)`} transform="rotate(18 356 252)" />
        </g>
      )}
      {/* ninho trançado */}
      <ellipse cx={320} cy={282} rx={74} ry={18} fill={p.woodShade} />
      <ellipse cx={320} cy={276} rx={68} ry={13} fill={p.wood} />
      {[-52, -30, -8, 14, 36, 58].map((dx) => (
        <path key={dx} d={`M${320 + dx - 12} ${276} q12 -8 24 0`} stroke={p.woodShade} strokeWidth={2} fill="none" />
      ))}
      <path d="M248 270 l-18 -10 M392 270 l18 -12 M262 286 l-24 4 M380 286 l24 4" stroke={p.woodShade} strokeWidth={2.5} strokeLinecap="round" />
      {/* dragãozinho voando */}
      {s >= 4 && (
        <g transform="translate(400 126)"><g className="ms-float">
          <path d="M0 20 q-40 -40 -10 -50 q8 22 26 30Z" fill={JEWELS.esmeralda} opacity={0.85} />
          <path d="M28 18 q30 -46 56 -30 q-26 6 -30 34Z" fill={JEWELS.esmeralda} opacity={0.85} />
          <path d="M-30 34 q30 -20 70 -16 q22 2 32 -12 q10 8 2 20 q-14 18 -44 18 q-30 0 -60 -10Z" fill="#2E8C64" />
          <path d="M-30 34 q-14 4 -22 -8 q12 2 22 8" fill="#2E8C64" />
          <circle cx={66} cy={12} r={3} fill={GOLD_LIGHT} />
          <path d="M60 2 l4 -10 l4 10" fill={GOLD} />
          <path d="M-6 38 q16 6 36 2" stroke={GOLD_LIGHT} strokeWidth={2} fill="none" opacity={0.7} />
        </g></g>
      )}
    </g>
  )
}

// ---------------- Biblioteca ----------------
function Biblioteca({ s, p, id, night }: LandmarkProps) {
  const shelfYs = [204, 232, 260]
  const bookColors = [JEWELS.safira, JEWELS.ametista, JEWELS.esmeralda, JEWELS.topazio, GOLD, '#C2577A']
  const filled = s >= 3 ? 3 : s >= 2 ? 2 : s >= 1 ? 1 : 0
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-inside`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={s >= 2 ? (night ? '#6B4E2E' : '#F3DDAA') : night ? '#2A2550' : '#C9BFAE'} />
          <stop offset="1" stopColor={s >= 2 ? (night ? '#4A3420' : '#E2C287') : night ? '#1E1A40' : '#B0A592'} />
        </linearGradient>
      </defs>
      {/* fachada */}
      <path d="M206 150 L320 102 L434 150Z" fill={p.stone} stroke={p.stoneShade} strokeWidth={1.5} />
      <circle cx={320} cy={134} r={9} fill={s >= 2 ? GOLD : p.stoneShade} />
      <rect x={212} y={150} width={216} height={10} fill={p.stoneShade} />
      <rect x={220} y={160} width={200} height={130} fill={p.stone} />
      {/* colunas */}
      {[224, 404].map((x) => (
        <rect key={x} x={x} y={160} width={12} height={130} fill={p.ivory} stroke={p.stoneShade} strokeWidth={1} />
      ))}
      {/* interior em arco */}
      <path d="M246 290 V196 a74 40 0 0 1 148 0 V290Z" fill={`url(#${id}-inside)`} />
      {/* lustre */}
      <line x1={320} y1={160} x2={320} y2={176} stroke={p.woodShade} strokeWidth={1.5} />
      <path d="M304 180 q16 10 32 0" stroke={s >= 2 ? GOLD : p.stoneShade} strokeWidth={3} fill="none" />
      {s >= 2 &&
        [304, 320, 336].map((x) => (
          <g key={x}>
            <circle cx={x} cy={176} r={6} fill={GOLD_LIGHT} opacity={0.45} className="ms-twinkle" />
            <circle cx={x} cy={176} r={2.4} fill={GOLD_LIGHT} />
          </g>
        ))}
      {/* prateleiras */}
      {shelfYs.map((y, row) => (
        <g key={y}>
          <rect x={252} y={y} width={136} height={4} fill={p.woodShade} />
          {row < filled &&
            Array.from({ length: 13 }, (_, i) => {
              const h = 14 + ((i * 7 + row * 3) % 8)
              return <rect key={i} x={256 + i * 10} y={y - h} width={8} height={h} rx={1} fill={bookColors[(i + row * 2) % bookColors.length]} />
            })}
        </g>
      ))}
      {/* teias no começo */}
      {s === 0 && (
        <g stroke="#FFFFFF" strokeOpacity={0.7} strokeWidth={1} fill="none">
          <path d="M248 198 l24 0 M248 198 l0 24 M248 198 l18 18 M256 198 q-2 8 -8 8 M264 198 q-4 14 -16 16" />
          <path d="M392 198 l-24 0 M392 198 l0 24 M392 198 l-18 18 M384 198 q2 8 8 8 M376 198 q4 14 16 16" />
        </g>
      )}
      {/* degraus */}
      <rect x={210} y={290} width={220} height={8} fill={p.stoneShade} />
      <rect x={200} y={298} width={240} height={8} fill={p.stone} />
      {/* livros voando */}
      {s >= 3 &&
        [
          [180, 170, -18, JEWELS.ametista],
          [460, 150, 14, JEWELS.safira],
          [500, 210, -10, JEWELS.esmeralda],
        ].map(([x, y, r, c], i) => (
          <g key={i} transform={`rotate(${r} ${x} ${y})`}><g className="ms-float">
            <path d={`M${x} ${y} q-14 -8 -26 -2 v18 q12 -6 26 2Z`} fill={c as string} />
            <path d={`M${x} ${y} q14 -8 26 -2 v18 q-12 -6 -26 2Z`} fill={c as string} opacity={0.8} />
            <path d={`M${x} ${y} v18`} stroke={p.ivory} strokeWidth={1.5} />
          </g></g>
        ))}
      {/* coruja na janela */}
      {s >= 4 && (
        <g transform="translate(410 128)">
          <ellipse cx={0} cy={14} rx={13} ry={16} fill="#8B6A4A" />
          <ellipse cx={0} cy={18} rx={8} ry={10} fill="#D9C2A0" />
          <circle cx={-5} cy={6} r={5} fill={p.ivory} />
          <circle cx={5} cy={6} r={5} fill={p.ivory} />
          <circle cx={-5} cy={6} r={2.4} fill="#1E1A2B" />
          <circle cx={5} cy={6} r={2.4} fill="#1E1A2B" />
          <path d="M-2 11 l2 4 l2 -4Z" fill={GOLD} />
          <path d="M-11 -4 l4 6 M11 -4 l-4 6" stroke="#8B6A4A" strokeWidth={3} strokeLinecap="round" />
        </g>
      )}
    </g>
  )
}

// ---------------- Banquete ----------------
function Banquete({ s, p, id }: LandmarkProps) {
  return (
    <g>
      <defs>
        <radialGradient id={`${id}-fire`} cx="0.5" cy="0.8" r="0.8">
          <stop offset="0" stopColor="#FFF1C9" />
          <stop offset="0.5" stopColor={GOLD_LIGHT} />
          <stop offset="1" stopColor={JEWELS.topazio} />
        </radialGradient>
      </defs>
      {/* bandeirolas */}
      {s >= 4 && (
        <g>
          <path d="M150 150 Q320 196 490 150" stroke={p.woodShade} strokeWidth={1.5} fill="none" />
          {Array.from({ length: 11 }, (_, i) => {
            const t = (i + 0.5) / 11
            const x = 150 + 340 * t
            const y = 150 + 46 * 4 * t * (1 - t) * 0.5 + 0
            const c = [JEWELS.safira, GOLD, JEWELS.ametista, JEWELS.esmeralda, JEWELS.topazio][i % 5]
            return <path key={i} d={`M${x - 9} ${y} h18 l-9 16Z`} fill={c} />
          })}
        </g>
      )}
      {/* lareira (fogueira de pedra) à esquerda */}
      <g>
        {[0, 1, 2, 3, 4].map((i) => (
          <ellipse key={i} cx={128 + i * 13} cy={300 - (i % 2) * 2} rx={9} ry={6} fill={i % 2 ? p.stone : p.stoneShade} />
        ))}
        <path d="M134 296 l40 -10 M136 286 l36 12" stroke={p.woodShade} strokeWidth={5} strokeLinecap="round" />
        {s >= 1 && (
          <g className="ms-flicker">
            <circle cx={154} cy={272} r={30} fill={GOLD_LIGHT} opacity={0.25} />
            <path d="M140 292 q-6 -22 10 -36 q-2 14 8 18 q2 -16 12 -24 q8 22 -2 42Z" fill={`url(#${id}-fire)`} />
          </g>
        )}
      </g>
      {/* mesa */}
      <rect x={214} y={262} width={232} height={10} rx={3} fill={p.wood} />
      <path d="M210 254 h240 v14 q-20 14 -40 0 q-20 14 -40 0 q-20 14 -40 0 q-20 14 -40 0 q-20 14 -40 0 q-20 14 -40 0Z" fill={p.ivory} />
      <rect x={210} y={250} width={240} height={6} rx={2} fill={JEWELS.safira} opacity={0.9} />
      {[226, 426].map((x) => (
        <rect key={x} x={x} y={272} width={8} height={30} fill={p.woodShade} />
      ))}
      {/* bancos */}
      <rect x={200} y={300} width={260} height={7} rx={3} fill={p.wood} />
      {/* pães e frutas */}
      {s >= 2 && (
        <g>
          <ellipse cx={252} cy={244} rx={16} ry={8} fill="#C98A46" />
          <path d="M242 242 l4 -4 M250 241 l4 -4 M258 242 l4 -4" stroke="#8E5A26" strokeWidth={1.5} />
          <ellipse cx={402} cy={246} rx={20} ry={6} fill={p.stoneShade} />
          <circle cx={394} cy={240} r={6} fill="#C2577A" />
          <circle cx={406} cy={238} r={6} fill="#E39A3B" />
          <circle cx={400} cy={232} r={5} fill={JEWELS.ametista} />
        </g>
      )}
      {/* bolo e assado */}
      {s >= 3 && (
        <g>
          <ellipse cx={296} cy={246} rx={18} ry={6} fill={p.stoneShade} />
          <path d="M282 244 q2 -16 16 -16 q12 0 14 16Z" fill="#B5652E" />
          <rect x={318} y={222} width={36} height={24} rx={4} fill="#F3D6E0" />
          <rect x={318} y={222} width={36} height={6} rx={3} fill="#FFFFFF" />
          <rect x={334} y={212} width={3} height={10} fill={GOLD} />
          <circle cx={335.5} cy={210} r={2.6} fill={GOLD_LIGHT} className="ms-flicker" />
        </g>
      )}
      {/* pratos e taças: festa */}
      {s >= 4 &&
        [236, 280, 372, 430].map((x) => (
          <g key={x}>
            <ellipse cx={x} cy={252} rx={8} ry={2.5} fill="#FFFFFF" stroke={p.stoneShade} strokeWidth={0.8} />
            <path d={`M${x + 10} 252 v-6 q-4 0 -4 -6 h8 q0 6 -4 6`} stroke={GOLD} strokeWidth={1.4} fill={GOLD_LIGHT} />
          </g>
        ))}
    </g>
  )
}

export const LANDMARKS: Record<string, (p: LandmarkProps) => ReactElement> = {
  jardim: Jardim,
  farol: Farol,
  ponte: Ponte,
  dragao: Dragao,
  biblioteca: Biblioteca,
  banquete: Banquete,
}
