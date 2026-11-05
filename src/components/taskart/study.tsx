// Estudo, trabalho e organização.
import { C, Ground, Shine, Sparkle, type Art } from './kit'

export const BookOpen: Art = ({ s }) => (
  <g>
    <Ground w={36} />
    <path d="M50 30 Q32 20 12 26 v50 q20 -6 38 4 z" fill={C.blue} />
    <path d="M50 30 Q68 20 88 26 v50 q-20 -6 -38 4 z" fill={C.blueS} />
    <path d="M50 28 Q34 18 16 23 v48 q18 -5 34 4 z" fill={C.ivory} />
    <path d="M50 28 Q66 18 84 23 v48 q-18 -5 -34 4 z" fill={C.white} />
    <path d="M50 28 v47" stroke={C.creamS} strokeWidth="1.6" />
    {!s && (
      <g stroke={C.blueL} strokeWidth="2" strokeLinecap="round">
        <path d="M22 34 q12 -3 22 2 M22 42 q12 -3 22 2 M22 50 q12 -3 22 2 M22 58 q8 -2 14 1" />
        <path d="M56 36 q10 -5 22 -2 M56 44 q10 -5 22 -2 M56 52 q10 -5 22 -2" />
      </g>
    )}
    {!s && <Sparkle x={74} y={14} r={5} />}
    {!s && <Sparkle x={30} y={12} r={3.4} c={C.goldL} />}
  </g>
)

export const Books: Art = ({ s }) => (
  <g>
    <Ground w={32} />
    <rect x="20" y="66" width="60" height="16" rx="3" fill={C.coral} />
    <rect x="24" y="68" width="52" height="3" rx="1.5" fill={C.ivory} opacity=".7" />
    <rect x="26" y="50" width="52" height="16" rx="3" fill={C.green} transform="rotate(-3 52 58)" />
    <rect x="30" y="53" width="44" height="3" rx="1.5" fill={C.ivory} opacity=".7" transform="rotate(-3 52 58)" />
    <rect x="22" y="34" width="54" height="16" rx="3" fill={C.purple} transform="rotate(4 49 42)" />
    <rect x="26" y="37" width="46" height="3" rx="1.5" fill={C.ivory} opacity=".7" transform="rotate(4 49 42)" />
    {/* maçã */}
    <circle cx="50" cy="26" r="8" fill={C.coral} />
    <path d="M50 18 q1 -6 6 -7" stroke={C.brown} strokeWidth="1.8" fill="none" strokeLinecap="round" />
    <path d="M52 16 q6 -4 8 2 q-6 2 -8 -2z" fill={C.green} />
    {!s && <Shine x={46} y={23} w={4} h={2} r={-40} o={0.7} />}
  </g>
)

export const Brain: Art = ({ s }) => (
  <g>
    <Ground w={28} />
    <path d="M50 22 c-6 -6 -18 -4 -20 4 c-8 0 -12 8 -9 14 c-6 4 -6 14 2 18 c0 8 8 12 15 9 c4 6 12 4 12 -2 z" fill={C.pink} />
    <path d="M50 22 c6 -6 18 -4 20 4 c8 0 12 8 9 14 c6 4 6 14 -2 18 c0 8 -8 12 -15 9 c-4 6 -12 4 -12 -2 z" fill={C.pinkS} />
    {!s && (
      <g stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity=".55">
        <path d="M34 34 q6 2 8 8 M28 48 q8 -2 12 4 M38 60 q4 -4 10 -2" />
        <path d="M66 34 q-6 2 -8 8 M72 48 q-8 -2 -12 4 M62 60 q-4 -4 -10 -2" />
      </g>
    )}
    <path d="M50 22 v50" stroke={C.pinkS} strokeWidth="1.6" opacity=".6" />
    <Sparkle x={80} y={18} r={6} />
    {!s && <Sparkle x={20} y={20} r={4} c={C.goldL} />}
    {!s && <Sparkle x={86} y={36} r={3} c={C.goldL} />}
  </g>
)

export const Backpack: Art = ({ s }) => (
  <g>
    <Ground w={26} />
    <path d="M38 22 a12 12 0 0 1 24 0" stroke={C.blueS} strokeWidth="5" fill="none" />
    <rect x="24" y="24" width="52" height="62" rx="16" fill={C.blue} />
    <path d="M24 46 a26 18 0 0 1 52 0 v4 h-52 z" fill={C.blueS} />
    <rect x="32" y="56" width="36" height="22" rx="7" fill={C.blueL} />
    <rect x="44" y="54" width="12" height="5" rx="2.5" fill={C.gold} />
    {!s && <path d="M36 66 h28" stroke={C.blue} strokeWidth="1.6" strokeDasharray="3 2.4" />}
    <Shine x={31} y={36} w={8} h={3} r={-70} />
    {!s && <circle cx="50" cy="40" r="4" fill={C.gold} />}
  </g>
)

export const Notepad: Art = ({ s }) => (
  <g>
    <Ground w={28} />
    <rect x="22" y="18" width="50" height="68" rx="6" fill={C.gold} />
    <rect x="22" y="18" width="50" height="12" rx="6" fill={C.goldS} />
    {[30, 40, 50, 60].map((x) => <rect key={x} x={x} y="13" width="4" height="10" rx="2" fill={C.metalS} />)}
    {!s && (
      <g stroke={C.goldS} strokeWidth="2" strokeLinecap="round">
        <path d="M30 42 h34 M30 52 h34 M30 62 h26 M30 72 h18" />
      </g>
    )}
    {/* lápis */}
    <g transform="rotate(35 74 58)">
      <rect x="70" y="30" width="9" height="40" rx="2" fill={C.coral} />
      <rect x="70" y="30" width="9" height="6" rx="2" fill={C.pink} />
      <path d="M70 70 h9 l-4.5 9 z" fill={C.woodL} />
      <path d="M73.5 76 h2 l-1 2 z" fill={C.ink} />
    </g>
  </g>
)

export const Calendar: Art = ({ s }) => (
  <g>
    <Ground w={30} />
    <rect x="18" y="22" width="64" height="62" rx="9" fill={C.white} />
    <path d="M18 31 a9 9 0 0 1 9 -9 h46 a9 9 0 0 1 9 9 v9 h-64 z" fill={C.coral} />
    <rect x="30" y="14" width="6" height="14" rx="3" fill={C.metalS} />
    <rect x="64" y="14" width="6" height="14" rx="3" fill={C.metalS} />
    <g fill={C.creamS}>
      {[0, 1, 2, 3].map((c) => [0, 1, 2].map((r) => <rect key={`${c}${r}`} x={26 + c * 13} y={46 + r * 11} width="9" height="7" rx="2" />))}
    </g>
    <rect x="39" y="57" width="9" height="7" rx="2" fill={C.gold} />
    {!s && <path d="M41 60.5 l2 2 l4 -4" stroke={C.white} strokeWidth="1.4" fill="none" strokeLinecap="round" />}
  </g>
)

export const Receipt: Art = ({ s }) => (
  <g>
    <Ground w={24} />
    <path d="M26 12 h48 v72 l-6 -4 l-6 4 l-6 -4 l-6 4 l-6 -4 l-6 4 l-6 -4 l-6 4 z" fill={C.white} />
    <path d="M26 12 h48 v12 h-48 z" fill={C.blue} />
    {!s && <rect x="34" y="16" width="20" height="4" rx="2" fill={C.blueL} />}
    <g stroke={C.metalS} strokeWidth={s ? 3 : 2.2} strokeLinecap="round">
      <path d="M34 34 h22 M34 43 h28" />
      {!s && <path d="M34 52 h16 M34 61 h20" />}
    </g>
    <circle cx="62" cy="66" r="12" fill={C.green} />
    <path d="M56 66 l4.4 4.4 l7.6 -8" stroke={C.white} strokeWidth="2.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </g>
)

export const Briefcase: Art = ({ s }) => (
  <g>
    <Ground w={34} />
    <path d="M38 32 v-6 a5 5 0 0 1 5 -5 h14 a5 5 0 0 1 5 5 v6" stroke={C.brownS} strokeWidth="5" fill="none" />
    <rect x="14" y="32" width="72" height="50" rx="9" fill={C.brown} />
    <path d="M14 41 a9 9 0 0 1 9 -9 h54 a9 9 0 0 1 9 9 v12 h-72 z" fill={C.wood} />
    <rect x="44" y="48" width="12" height="10" rx="2.5" fill={C.gold} />
    {!s && <rect x="47" y="51" width="6" height="3" rx="1.5" fill={C.goldS} />}
    <Shine x={24} y={40} w={10} h={3} r={0} o={0.4} />
  </g>
)

export const School: Art = ({ s }) => (
  <g>
    <Ground w={38} />
    <path d="M50 10 v14" stroke={C.metalS} strokeWidth="2" />
    <path d="M50 10 h14 l-3 4 l3 4 h-14 z" fill={C.coral} />
    <path d="M50 22 L84 44 h-68 z" fill={C.coral} />
    <rect x="20" y="44" width="60" height="40" rx="3" fill={C.cream} />
    <rect x="20" y="44" width="60" height="6" fill={C.creamS} />
    <circle cx="50" cy="36" r="5" fill={C.white} />
    {!s && <path d="M50 33 v3 l2 1.5" stroke={C.ink} strokeWidth="1.2" fill="none" strokeLinecap="round" />}
    <rect x="43" y="62" width="14" height="22" rx="7" fill={C.blue} />
    <rect x="26" y="56" width="11" height="11" rx="2" fill={C.blueL} />
    <rect x="63" y="56" width="11" height="11" rx="2" fill={C.blueL} />
    {!s && <Shine x={29} y={59} w={4} h={2} r={-40} o={0.8} />}
  </g>
)

export const Phone: Art = ({ s }) => (
  <g>
    <Ground w={22} />
    <rect x="30" y="12" width="40" height="74" rx="10" fill={C.ink} />
    <rect x="34" y="20" width="32" height="54" rx="4" fill={C.blueL} />
    <rect x="44" y="15" width="12" height="2.4" rx="1.2" fill={C.metalS} />
    <circle cx="50" cy="80" r="3" fill={C.metalS} />
    {/* coração/balão */}
    <path d="M40 34 h20 a4 4 0 0 1 4 4 v10 a4 4 0 0 1 -4 4 h-12 l-6 5 v-5 h-2 a4 4 0 0 1 -4 -4 v-10 a4 4 0 0 1 4 -4 z" fill={C.white} />
    {!s && <path d="M50 39 c-3 -3 -7 0 -4 4 l4 3.4 l4 -3.4 c3 -4 -1 -7 -4 -4 z" fill={C.coral} />}
    {!s && <Shine x={38} y={64} w={10} h={2.4} r={-60} />}
    {!s && <path d="M76 26 q6 6 0 12 M82 22 q10 10 0 20" stroke={C.gold} strokeWidth="2.4" fill="none" strokeLinecap="round" />}
  </g>
)
