// Cuidado, passeios, lazer e recompensas.
import { C, Face, Ground, Shine, Sparkle, type Art } from './kit'

export const Hands: Art = ({ s }) => (
  <g>
    <Ground w={30} />
    {/* punhos */}
    <rect x="6" y="46" width="20" height="22" rx="5" fill={C.blue} />
    <rect x="74" y="46" width="20" height="22" rx="5" fill={C.coral} />
    {/* mão esquerda (por baixo) */}
    <path d="M24 48 h20 l14 8 a5 5 0 0 1 -4 9 l-10 -3 l-8 6 h-12 z" fill={C.skin} />
    {/* mão direita (por cima) */}
    <path d="M76 48 h-16 l-18 10 a4.5 4.5 0 0 0 4 8 l6 -2 a4.5 4.5 0 0 0 6 4 a4.5 4.5 0 0 0 6 2 a4.5 4.5 0 0 0 6 0 h6 z" fill={C.skinS} />
    {!s && <path d="M52 64 l4 -4 M58 66 l4 -4 M64 66 l3 -3" stroke={C.skin} strokeWidth="1.4" strokeLinecap="round" opacity=".8" />}
    <path d="M50 30 c-4 -4 -10 0 -6 6 l6 5 l6 -5 c4 -6 -2 -10 -6 -6 z" fill={C.coral} />
    {!s && <Sparkle x={30} y={30} r={4} />}
    {!s && <Sparkle x={70} y={28} r={4} />}
  </g>
)

export const Car: Art = ({ s }) => (
  <g>
    <Ground w={40} y={84} />
    <path d="M14 64 v-8 a8 8 0 0 1 8 -8 h6 l10 -14 a6 6 0 0 1 5 -3 h18 a6 6 0 0 1 5 2.6 l10 14.4 h4 a8 8 0 0 1 8 8 v8 a4 4 0 0 1 -4 4 h-66 a4 4 0 0 1 -4 -4 z" fill={C.coral} />
    <path d="M32 47 l8 -11 h10 v11 z" fill={C.blueL} />
    <path d="M54 36 h8 l8 11 h-16 z" fill={C.blueL} />
    {!s && <Shine x={42} y={40} w={5} h={2} r={-55} o={0.8} />}
    <rect x="14" y="56" width="72" height="4" fill={C.coralS} opacity=".5" />
    <rect x="80" y="54" width="6" height="4" rx="2" fill={C.goldL} />
    <circle cx="30" cy="70" r="9" fill={C.ink} />
    <circle cx="70" cy="70" r="9" fill={C.ink} />
    <circle cx="30" cy="70" r="4" fill={C.metal} />
    <circle cx="70" cy="70" r="4" fill={C.metal} />
  </g>
)

export const Cart: Art = ({ s }) => (
  <g>
    <Ground w={34} />
    {/* compras */}
    <rect x="34" y="24" width="12" height="22" rx="3" fill={C.green} />
    <circle cx="56" cy="36" r="9" fill={C.coral} />
    <path d="M56 27 q2 -4 5 -4" stroke={C.greenS} strokeWidth="1.6" fill="none" />
    <path d="M64 30 q8 -2 10 8 l-12 6 z" fill={C.gold} />
    <path d="M10 22 h10 l8 40 h46 l8 -28 h-58" stroke={C.blueS} strokeWidth="4.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M24 34 h56 l-7 26 h-44 z" fill={C.blue} opacity=".85" />
    {!s && <path d="M38 36 v22 M50 36 v22 M62 36 v22" stroke={C.blueL} strokeWidth="1.6" />}
    <circle cx="34" cy="76" r="6" fill={C.ink} />
    <circle cx="68" cy="76" r="6" fill={C.ink} />
    <circle cx="34" cy="76" r="2.4" fill={C.metal} />
    <circle cx="68" cy="76" r="2.4" fill={C.metal} />
  </g>
)

export const Run: Art = ({ s }) => (
  <g>
    <Ground w={28} />
    {!s && <path d="M10 42 h14 M6 52 h14 M12 62 h12" stroke={C.blueL} strokeWidth="3" strokeLinecap="round" />}
    {/* tênis */}
    <path d="M22 60 c8 -2 14 -10 18 -16 l14 2 c4 6 10 10 20 12 c8 2 10 8 8 12 h-58 a6 6 0 0 1 -2 -10 z" fill={C.coral} />
    <path d="M20 70 h62 a4 4 0 0 1 -4 6 h-56 a4 4 0 0 1 -2 -6 z" fill={C.white} />
    <path d="M38 44 l14 2 l-2 6 l-14 -2 z" fill={C.coralS} />
    {!s && <path d="M46 54 l8 2 M50 60 l8 2 M54 66 l8 1" stroke={C.white} strokeWidth="2" strokeLinecap="round" />}
    <path d="M40 44 c2 -8 12 -10 14 2" fill={C.coralS} />
    {!s && <Shine x={68} y={62} w={8} h={2.4} r={10} />}
  </g>
)

export const Stethoscope: Art = ({ s }) => (
  <g>
    <Ground w={24} />
    <path d="M30 14 v18 a16 16 0 0 0 32 0 v-18" stroke={C.purple} strokeWidth="5" fill="none" strokeLinecap="round" />
    <circle cx="30" cy="12" r="4" fill={C.metalS} />
    <circle cx="62" cy="12" r="4" fill={C.metalS} />
    <path d="M46 48 v14 a14 14 0 0 0 28 0 v-6" stroke={C.purple} strokeWidth="5" fill="none" strokeLinecap="round" />
    <circle cx="74" cy="50" r="10" fill={C.metal} />
    <circle cx="74" cy="50" r="6" fill={C.metalS} />
    {!s && <circle cx="72" cy="48" r="2" fill="#fff" opacity=".8" />}
    <path d="M30 72 c-5 -5 -12 0 -7 7 l7 6 l7 -6 c5 -7 -2 -12 -7 -7 z" fill={C.coral} />
    {!s && <path d="M20 66 h4 l2 -4 l3 8 l2 -4 h4" stroke={C.coralS} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
  </g>
)

export const Gift: Art = ({ s }) => (
  <g>
    <Ground w={30} />
    <path d="M50 32 c-8 -14 -24 -10 -18 0 z" fill={C.goldS} />
    <path d="M50 32 c8 -14 24 -10 18 0 z" fill={C.goldS} />
    <rect x="20" y="40" width="60" height="44" rx="6" fill={C.purple} />
    <rect x="16" y="30" width="68" height="14" rx="5" fill={C.purpleS} />
    <rect x="44" y="30" width="12" height="54" fill={C.gold} />
    <circle cx="50" cy="32" r="5" fill={C.gold} />
    {!s && <Shine x={28} y={54} w={10} h={3} r={-80} />}
    {!s && <Sparkle x={84} y={20} r={5} />}
    {!s && <Sparkle x={14} y={22} r={3.5} c={C.goldL} />}
  </g>
)

export const Tv: Art = ({ s }) => (
  <g>
    <Ground w={30} />
    <path d="M38 20 l12 10 l12 -12" stroke={C.metalS} strokeWidth="2.6" fill="none" strokeLinecap="round" />
    <rect x="14" y="30" width="72" height="48" rx="10" fill={C.purple} />
    <rect x="20" y="36" width="60" height="36" rx="6" fill={C.blue} />
    {/* paisagem na tela */}
    <path d="M20 62 q14 -10 26 0 q12 -10 34 -2 v6 a6 6 0 0 1 -6 6 h-48 a6 6 0 0 1 -6 -6 z" fill={C.green} />
    <circle cx="66" cy="46" r="5" fill={C.goldL} />
    {!s && <Shine x={30} y={42} w={10} h={2.6} r={-30} o={0.45} />}
    <rect x="26" y="78" width="8" height="6" rx="2" fill={C.purpleS} />
    <rect x="66" y="78" width="8" height="6" rx="2" fill={C.purpleS} />
  </g>
)

export const Clapper: Art = ({ s }) => (
  <g>
    <Ground w={30} />
    <rect x="18" y="40" width="64" height="44" rx="6" fill={C.ink} />
    <g transform="rotate(-14 20 38)">
      <rect x="18" y="28" width="64" height="12" rx="3" fill={C.ink} />
      {[0, 1, 2, 3].map((i) => <path key={i} d={`M${24 + i * 15} 28 h8 l-6 12 h-8 z`} fill={C.white} />)}
    </g>
    <rect x="18" y="40" width="64" height="6" fill="#4A4562" />
    {!s && <path d="M28 58 h26 M28 68 h18" stroke={C.metalS} strokeWidth="2.4" strokeLinecap="round" />}
    <circle cx="68" cy="64" r="8" fill={C.gold} />
    {!s && <path d="M65 60 l7 4 l-7 4 z" fill={C.ink} />}
  </g>
)

export const Tree: Art = ({ s }) => (
  <g>
    <Ground w={30} />
    <path d="M46 56 h8 l3 30 h-14 z" fill={C.brown} />
    <circle cx="50" cy="38" r="24" fill={C.green} />
    <circle cx="32" cy="48" r="14" fill={C.greenS} />
    <circle cx="68" cy="48" r="14" fill={C.greenS} />
    <circle cx="44" cy="30" r="12" fill={C.greenL} opacity=".6" />
    {!s && (
      <g fill={C.coral}>
        <circle cx="38" cy="40" r="3.4" />
        <circle cx="62" cy="34" r="3.4" />
        <circle cx="56" cy="52" r="3.4" />
        <circle cx="34" cy="56" r="3" />
      </g>
    )}
    {!s && <path d="M20 86 q4 -6 8 0 M72 86 q4 -6 8 0" stroke={C.greenS} strokeWidth="2.4" fill="none" strokeLinecap="round" />}
  </g>
)

export const Friends: Art = ({ s }) => (
  <g>
    <Ground w={36} />
    {/* amigo 1 */}
    <path d="M14 86 a16 16 0 0 1 32 0 z" fill={C.blue} />
    <circle cx="30" cy="48" r="13" fill={C.skin} />
    <path d="M17 46 a13 13 0 0 1 26 0 q-6 -6 -13 -6 q-7 0 -13 6 z" fill={C.brown} />
    <Face x={30} y={50} d={7} s={s} />
    {/* amigo 2 */}
    <path d="M54 86 a16 16 0 0 1 32 0 z" fill={C.coral} />
    <circle cx="70" cy="48" r="13" fill={C.wood} />
    <path d="M57 48 a13 13 0 0 1 26 0 c0 -10 -6 -14 -13 -14 c-7 0 -13 4 -13 14 z" fill={C.ink} />
    <circle cx="58" cy="44" r="5" fill={C.ink} />
    <circle cx="82" cy="44" r="5" fill={C.ink} />
    <Face x={70} y={51} d={7} s={s} />
    {/* braços dados */}
    <path d="M40 74 q10 -6 20 0" stroke={C.skinS} strokeWidth="5" fill="none" strokeLinecap="round" />
    {!s && <path d="M50 24 c-3 -3 -8 0 -5 5 l5 4 l5 -4 c3 -5 -2 -8 -5 -5 z" fill={C.pink} />}
  </g>
)

export const Star: Art = ({ s }) => (
  <g>
    <path d="M50 10 l11 24 l26 3 l-19.5 17.5 l5.5 25.5 l-23 -13 l-23 13 l5.5 -25.5 l-19.5 -17.5 l26 -3 z" fill={C.gold} />
    <path d="M50 10 l11 24 l26 3 l-19.5 17.5 l5.5 25.5 l-23 -13 z" fill={C.goldS} opacity=".45" />
    <Face x={50} y={46} d={10} s={s} />
    {!s && <Sparkle x={84} y={14} r={5} c={C.goldL} />}
    {!s && <Sparkle x={16} y={78} r={4} c={C.goldL} />}
  </g>
)

export const Piano: Art = ({ s }) => (
  <g>
    <Ground w={38} />
    <rect x="10" y="38" width="80" height="44" rx="7" fill={C.ink} />
    <rect x="14" y="48" width="72" height="30" rx="3" fill={C.white} />
    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <path key={i} d={`M${14 + i * 8} 48 v30`} stroke={C.metal} strokeWidth="1.2" />)}
    {[1, 2, 4, 5, 6, 8].map((i) => <rect key={i} x={14 + i * 8 - 2.6} y="48" width="5.2" height="17" rx="1.4" fill={C.ink} />)}
    {!s && <path d="M64 12 v18 a5 4 0 1 1 -3 -3.6 v-10 l12 -3 v12 a5 4 0 1 1 -3 -3.6 v-7" fill={C.purple} />}
    {!s && <Sparkle x={30} y={22} r={4} />}
  </g>
)

export const Ball: Art = ({ s }) => (
  <g>
    <Ground w={26} />
    <circle cx="50" cy="50" r="32" fill={C.white} />
    <path d="M50 36 l13 9.5 l-5 15.5 h-16 l-5 -15.5 z" fill={C.ink} />
    {!s && (
      <g fill={C.ink}>
        <path d="M50 18 l9 6 l-9 6 l-9 -6 z" opacity=".9" />
        <path d="M79 42 l-2 11 l-9 -4 l2 -10 z" opacity=".9" />
        <path d="M21 42 l2 11 l9 -4 l-2 -10 z" opacity=".9" />
        <path d="M33 77 l4 -10 h8 l-2 12 z" opacity=".9" />
        <path d="M67 77 l-4 -10 h-8 l2 12 z" opacity=".9" />
      </g>
    )}
    <circle cx="50" cy="50" r="32" fill="none" stroke={C.metal} strokeWidth="2" />
    <Shine x={36} y={30} w={10} h={3} r={-40} o={0.7} />
  </g>
)

export const Palette: Art = ({ s }) => (
  <g>
    <Ground w={32} />
    <path d="M50 16 c22 0 38 14 38 32 c0 12 -10 14 -18 12 c-8 -2 -12 4 -8 10 c4 8 -2 14 -12 14 c-22 0 -38 -14 -38 -34 c0 -20 16 -34 38 -34 z" fill={C.woodL} />
    <circle cx="44" cy="66" r="6" fill={C.cream} />
    <circle cx="32" cy="38" r="6" fill={C.coral} />
    <circle cx="48" cy="28" r="6" fill={C.gold} />
    <circle cx="66" cy="32" r="6" fill={C.green} />
    <circle cx="74" cy="48" r="5.5" fill={C.blue} />
    <circle cx="28" cy="56" r="5.5" fill={C.purple} />
    {/* pincel */}
    <g transform="rotate(40 70 70)">
      <rect x="66" y="50" width="6" height="36" rx="3" fill={C.wood} />
      <rect x="65.5" y="44" width="7" height="8" rx="1.5" fill={C.metalS} />
      <path d="M66 44 q3 -10 6 0 z" fill={C.blue} />
    </g>
    {!s && <Shine x={36} y={24} w={8} h={2.4} r={-30} />}
  </g>
)
