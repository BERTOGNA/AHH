// Cozinha e comida.
import { C, Face, Ground, Shine, Sparkle, type Art } from './kit'

export const Plate: Art = ({ s }) => (
  <g>
    <Ground w={36} y={84} />
    {/* garfo */}
    <rect x="12" y="38" width="4" height="44" rx="2" fill={C.metalS} />
    <path d="M8 18 v18 a6 6 0 0 0 12 0 v-18" stroke={C.metalS} strokeWidth="2.6" fill="none" strokeLinecap="round" />
    {!s && <path d="M14 18 v14" stroke={C.metalS} strokeWidth="2.6" strokeLinecap="round" />}
    {/* faca */}
    <path d="M86 16 c-6 6 -8 18 -6 28 h4 z" fill={C.metal} />
    <rect x="82" y="42" width="4.5" height="40" rx="2.2" fill={C.metalS} />
    {/* prato */}
    <circle cx="49" cy="52" r="29" fill={C.white} />
    <circle cx="49" cy="52" r="29" fill="none" stroke={C.metal} strokeWidth="2" />
    <circle cx="49" cy="52" r="20" fill={C.ivory} />
    <circle cx="49" cy="52" r="20" fill="none" stroke={C.creamS} strokeWidth="1.6" />
    {!s && <Shine x={34} y={36} w={10} h={3} r={-40} />}
  </g>
)

export const Bowl: Art = ({ s }) => (
  <g>
    <Ground w={30} />
    {/* colher */}
    <rect x="58" y="14" width="5" height="34" rx="2.5" fill={C.metalS} transform="rotate(20 60 30)" />
    {/* comida */}
    <ellipse cx="50" cy="48" rx="30" ry="8" fill={C.cream} />
    {!s && (
      <g>
        <circle cx="38" cy="46" r="3.4" fill={C.gold} />
        <circle cx="48" cy="44" r="3" fill={C.goldS} />
        <circle cx="60" cy="47" r="3.4" fill={C.coral} />
        <circle cx="54" cy="49" r="2.4" fill={C.gold} />
      </g>
    )}
    <path d="M18 48 h64 a32 32 0 0 1 -64 0 z" fill={C.blue} />
    <path d="M18 48 h64 a32 32 0 0 1 -4 14 h-56 a32 32 0 0 1 -4 -14 z" fill={C.blueL} opacity=".35" />
    <rect x="38" y="78" width="24" height="6" rx="3" fill={C.blueS} />
    {!s && <path d="M30 60 q4 2 8 0 q4 -2 8 0 q4 2 8 0 q4 -2 8 0 q4 2 8 0" stroke={C.white} strokeWidth="1.6" fill="none" opacity=".6" />}
  </g>
)

export const Pan: Art = ({ s }) => (
  <g>
    <Ground w={34} />
    <rect x="68" y="56" width="28" height="8" rx="4" fill={C.wood} transform="rotate(-10 70 60)" />
    <ellipse cx="44" cy="60" rx="32" ry="14" fill={C.ink} opacity=".9" />
    <ellipse cx="44" cy="57" rx="28" ry="11" fill="#5A5470" />
    {/* ovo */}
    <path d="M30 56 c-2 -8 8 -12 14 -8 c6 -5 16 0 13 8 c2 6 -8 10 -14 7 c-6 4 -15 0 -13 -7 z" fill={C.white} />
    <circle cx="44" cy="55" r="6" fill={C.gold} />
    <circle cx="42" cy="53" r="1.8" fill="#fff" opacity=".8" />
    {!s && (
      <g stroke={C.metalS} strokeWidth="2" strokeLinecap="round" fill="none" opacity=".7">
        <path d="M34 36 q-3 -5 0 -10 q3 -5 0 -10" />
        <path d="M48 34 q-3 -5 0 -10 q3 -5 0 -10" />
      </g>
    )}
  </g>
)

export const Pot: Art = ({ s }) => (
  <g>
    <Ground w={32} />
    {!s && (
      <g stroke={C.metalS} strokeWidth="2.2" strokeLinecap="round" fill="none" opacity=".7">
        <path d="M38 24 q-3 -5 0 -10 q3 -5 0 -10" />
        <path d="M52 22 q-3 -5 0 -10 q3 -5 0 -10" />
        <path d="M64 24 q-3 -5 0 -10 q3 -5 0 -10" />
      </g>
    )}
    <rect x="14" y="44" width="12" height="6" rx="3" fill={C.coralS} />
    <rect x="74" y="44" width="12" height="6" rx="3" fill={C.coralS} />
    <path d="M22 40 h56 v34 a10 10 0 0 1 -10 10 h-36 a10 10 0 0 1 -10 -10 z" fill={C.coral} />
    <path d="M22 40 h56 v6 h-56 z" fill={C.coralS} />
    <ellipse cx="50" cy="39" rx="30" ry="6" fill={C.coralS} />
    <rect x="44" y="30" width="12" height="6" rx="3" fill={C.coralS} />
    <Shine x={30} y={60} w={12} h={3.4} r={-82} />
    {!s && <Face x={52} y={62} d={10} s={s} />}
  </g>
)

export const Cup: Art = ({ s }) => (
  <g>
    <ellipse cx="48" cy="82" rx="30" ry="6" fill={C.creamS} />
    <ellipse cx="48" cy="80" rx="26" ry="4.5" fill={C.ivory} />
    <path d="M72 46 a11 11 0 0 1 0 22" stroke={C.coralS} strokeWidth="6" fill="none" />
    <path d="M24 38 h48 v22 a20 20 0 0 1 -20 20 h-8 a20 20 0 0 1 -20 -20 z" fill={C.coral} />
    <ellipse cx="48" cy="38" rx="24" ry="5" fill={C.brown} />
    <ellipse cx="44" cy="37" rx="8" ry="1.6" fill={C.woodL} opacity=".7" />
    <Shine x={31} y={54} w={10} h={3} r={-80} />
    {!s && (
      <g stroke={C.metalS} strokeWidth="2.2" strokeLinecap="round" fill="none" opacity=".7">
        <path d="M40 28 q-3 -5 0 -10 q3 -5 0 -10" />
        <path d="M54 28 q-3 -5 0 -10 q3 -5 0 -10" />
      </g>
    )}
    {!s && <path d="M44 58 c-3 -3 -7 0 -4 4 l4 3 l4 -3 c3 -4 -1 -7 -4 -4 z" fill={C.pink} />}
  </g>
)

export const Pizza: Art = ({ s }) => (
  <g>
    <Ground w={28} />
    <path d="M50 88 L16 26 Q50 8 84 26 Z" fill={C.gold} />
    <path d="M16 26 Q50 8 84 26 L80 34 Q50 18 20 34 Z" fill={C.woodL} />
    <path d="M20 34 Q50 18 80 34 L76 40 Q50 26 24 40 Z" fill={C.goldS} opacity=".25" />
    <circle cx="40" cy="44" r="6" fill={C.coral} />
    <circle cx="60" cy="42" r="5.5" fill={C.coral} />
    <circle cx="50" cy="62" r="5" fill={C.coral} />
    {!s && <circle cx="38" cy="43" r="1.6" fill="#fff" opacity=".5" />}
    {!s && <path d="M58 54 q4 -3 6 1 M42 58 q3 -3 5 1" stroke={C.greenS} strokeWidth="2.4" fill="none" strokeLinecap="round" />}
  </g>
)

export const IceCream: Art = ({ s }) => (
  <g>
    <Ground w={18} />
    <path d="M34 50 L50 90 L66 50 Z" fill={C.woodL} />
    {!s && <path d="M38 56 l18 18 M44 52 l16 16 M62 56 l-18 18 M56 52 l-16 16" stroke={C.wood} strokeWidth="1.4" opacity=".7" />}
    <circle cx="40" cy="44" r="12" fill={C.pink} />
    <circle cx="60" cy="44" r="12" fill={C.cream} />
    <circle cx="50" cy="30" r="13" fill={C.brown} />
    <circle cx="50" cy="16" r="4.5" fill={C.coral} />
    <path d="M50 12 q4 -6 8 -4" stroke={C.greenS} strokeWidth="1.6" fill="none" strokeLinecap="round" />
    {!s && <Shine x={44} y={24} w={6} h={2.4} r={-30} />}
    {!s && (
      <g>
        <rect x="38" y="34" width="4" height="1.8" rx=".9" fill={C.gold} transform="rotate(30 40 35)" />
        <rect x="56" y="28" width="4" height="1.8" rx=".9" fill={C.blueL} transform="rotate(-20 58 29)" />
        <rect x="50" y="38" width="4" height="1.8" rx=".9" fill={C.green} />
      </g>
    )}
  </g>
)

export const Popcorn: Art = ({ s }) => (
  <g>
    <Ground w={24} />
    {[[34, 30], [46, 24], [58, 28], [68, 36], [28, 40], [40, 36], [54, 36]].map(([x, y]) => (
      <g key={`${x}${y}`}>
        <circle cx={x} cy={y} r="7" fill={C.ivory} />
        <circle cx={x + 3} cy={y + 2} r="4" fill={C.goldL} />
      </g>
    ))}
    <path d="M26 42 h48 l-6 44 h-36 z" fill={C.white} />
    <path d="M32 42 h7 l-1.8 44 h-6 z M48 42 h7 v44 h-7 z M62 42 h7 l-4.8 44 h-3 z" fill={C.coral} />
    {!s && <Sparkle x={80} y={22} r={4.5} />}
  </g>
)

export const Cutlery = Plate
export const Soup = Pot
export const Bread: Art = (p) => <Bowl {...p} />
export { Sparkle }
