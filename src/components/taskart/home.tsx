// Casa e cuidado pessoal.
import { C, Face, Ground, Shine, Sparkle, type Art } from './kit'

export const Bed: Art = ({ s }) => (
  <g>
    <Ground w={38} />
    {/* cabeceira */}
    <rect x="12" y="30" width="14" height="54" rx="5" fill={C.wood} />
    <rect x="12" y="30" width="5" height="54" rx="2.5" fill={C.woodL} opacity=".6" />
    <rect x="80" y="52" width="9" height="32" rx="4" fill={C.wood} />
    {/* colchão */}
    <rect x="20" y="56" width="66" height="16" rx="6" fill={C.ivory} />
    {/* cobertor */}
    <path d="M40 52 h44 a6 6 0 0 1 6 6 v12 a4 4 0 0 1 -4 4 h-46 z" fill={C.blue} />
    <path d="M40 52 h44 a6 6 0 0 1 6 6 v3 h-50 z" fill={C.blueL} />
    {!s && <path d="M52 64 l4 4 M64 64 l4 4 M76 64 l4 4" stroke={C.blueS} strokeWidth="1.6" strokeLinecap="round" />}
    {/* travesseiro */}
    <rect x="22" y="46" width="20" height="12" rx="6" fill={C.white} />
    <ellipse cx="32" cy="50" rx="6" ry="1.6" fill={C.creamS} opacity=".7" />
    {/* pés */}
    <rect x="18" y="72" width="70" height="6" rx="3" fill={C.woodS} />
    {!s && <Sparkle x={66} y={36} r={5} />}
    {!s && <Sparkle x={78} y={42} r={3} c={C.goldL} />}
  </g>
)

export const Teddy: Art = ({ s }) => (
  <g>
    <Ground w={26} />
    <circle cx="33" cy="30" r="9" fill={C.brown} />
    <circle cx="67" cy="30" r="9" fill={C.brown} />
    <circle cx="33" cy="30" r="4.5" fill={C.woodL} />
    <circle cx="67" cy="30" r="4.5" fill={C.woodL} />
    {/* corpo */}
    <ellipse cx="50" cy="70" rx="20" ry="17" fill={C.brown} />
    <ellipse cx="50" cy="73" rx="11" ry="10" fill={C.woodL} />
    <ellipse cx="30" cy="66" rx="7" ry="9" fill={C.brownS} transform="rotate(25 30 66)" />
    <ellipse cx="70" cy="66" rx="7" ry="9" fill={C.brownS} transform="rotate(-25 70 66)" />
    <ellipse cx="38" cy="85" rx="8" ry="5" fill={C.brownS} />
    <ellipse cx="62" cy="85" rx="8" ry="5" fill={C.brownS} />
    {/* cabeça */}
    <circle cx="50" cy="42" r="18" fill={C.brown} />
    <ellipse cx="50" cy="48" rx="8.5" ry="6.5" fill={C.woodL} />
    <ellipse cx="50" cy="45.5" rx="3" ry="2.2" fill={C.ink} />
    <circle cx="43" cy="39" r={s ? 2.2 : 1.9} fill={C.ink} />
    <circle cx="57" cy="39" r={s ? 2.2 : 1.9} fill={C.ink} />
    {!s && <path d="M47.5 50 Q50 52.5 52.5 50" stroke={C.ink} strokeWidth="1.2" fill="none" strokeLinecap="round" />}
    {/* laço */}
    <path d="M50 60 l-9 -5 v10 z M50 60 l9 -5 v10 z" fill={C.coral} />
    <circle cx="50" cy="60" r="3" fill={C.coralS} />
    {!s && <Shine x={42} y={30} w={7} />}
  </g>
)

export const Basket: Art = ({ s }) => (
  <g>
    <Ground w={30} />
    {/* roupas saindo */}
    <path d="M28 42 q4 -14 16 -10 q-2 8 -4 12 z" fill={C.pink} />
    <path d="M44 36 q10 -12 22 -4 q-6 6 -10 12 z" fill={C.blue} />
    <path d="M58 40 q10 -8 16 2 l-6 6 z" fill={C.gold} />
    {/* cesto */}
    <path d="M20 44 h60 l-7 40 a5 5 0 0 1 -5 4 h-36 a5 5 0 0 1 -5 -4 z" fill={C.wood} />
    <rect x="17" y="40" width="66" height="9" rx="4.5" fill={C.woodL} />
    {!s && (
      <g stroke={C.woodS} strokeWidth="1.6" strokeLinecap="round" opacity=".8">
        <path d="M30 54 l2 28 M42 54 l1 30 M54 54 l-1 30 M66 54 l-2 28" />
        <path d="M24 62 h52 M25 72 h50" />
      </g>
    )}
  </g>
)

export const Broom: Art = ({ s }) => (
  <g>
    <Ground w={30} />
    <rect x="47" y="8" width="7" height="56" rx="3.5" fill={C.wood} transform="rotate(18 50 40)" />
    <g transform="rotate(18 50 70)">
      <rect x="38" y="56" width="26" height="7" rx="3" fill={C.coral} />
      <path d="M36 62 h30 l6 24 h-42 z" fill={C.gold} />
      {!s && <path d="M40 66 l-2 18 M46 66 l-1 18 M52 66 v18 M58 66 l1 18 M64 66 l2 18" stroke={C.goldS} strokeWidth="1.5" strokeLinecap="round" />}
    </g>
    {!s && <Sparkle x={24} y={74} r={5} />}
    {!s && <Sparkle x={80} y={30} r={3.5} c={C.goldL} />}
    {!s && <circle cx="22" cy="86" r="2" fill={C.metalS} opacity=".6" />}
  </g>
)

export const Trash: Art = ({ s }) => (
  <g>
    <Ground w={24} />
    <rect x="40" y="16" width="20" height="6" rx="3" fill={C.greenS} />
    <rect x="24" y="22" width="52" height="10" rx="5" fill={C.green} />
    <path d="M28 34 h44 l-4 48 a5 5 0 0 1 -5 4 h-26 a5 5 0 0 1 -5 -4 z" fill={C.green} />
    <path d="M28 34 h44 l-.6 7 h-42.8 z" fill={C.greenS} opacity=".6" />
    {!s && <path d="M40 46 l1.5 30 M50 46 v30 M60 46 l-1.5 30" stroke={C.greenS} strokeWidth="2.6" strokeLinecap="round" />}
    {/* símbolo de reciclagem */}
    {!s && <path d="M44 62 l6 -7 l6 7 M50 55 v0" stroke={C.ivory} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity=".8" />}
    <Shine x={33} y={50} w={10} h={3} r={-80} />
  </g>
)

export const Sponge: Art = ({ s }) => (
  <g>
    <Ground w={28} />
    <rect x="22" y="44" width="56" height="36" rx="9" fill={C.gold} />
    <rect x="22" y="44" width="56" height="13" rx="6" fill={C.green} />
    {!s && (
      <g fill={C.goldS}>
        <circle cx="34" cy="66" r="2.6" />
        <circle cx="48" cy="72" r="2" />
        <circle cx="62" cy="65" r="2.8" />
        <circle cx="70" cy="73" r="1.8" />
        <circle cx="40" cy="75" r="1.6" />
      </g>
    )}
    {/* bolhas */}
    <circle cx="30" cy="32" r="8" fill={C.blueL} opacity=".55" />
    <circle cx="48" cy="24" r="10" fill={C.blueL} opacity=".55" />
    <circle cx="68" cy="32" r="7" fill={C.blueL} opacity=".55" />
    <circle cx="27" cy="29" r="2.4" fill="#fff" opacity=".9" />
    <circle cx="44" cy="20" r="3" fill="#fff" opacity=".9" />
    <circle cx="65" cy="29" r="2" fill="#fff" opacity=".9" />
    {!s && <circle cx="80" cy="20" r="4" fill={C.blueL} opacity=".5" />}
  </g>
)

export const Shower: Art = ({ s }) => (
  <g>
    <path d="M20 8 v22 a7 7 0 0 0 7 7 h16" stroke={C.metalS} strokeWidth="6" fill="none" strokeLinecap="round" />
    <path d="M40 26 h28 a8 8 0 0 1 8 8 v3 h-44 v-3 a8 8 0 0 1 8 -8 z" fill={C.blue} />
    <rect x="30" y="36" width="48" height="6" rx="3" fill={C.blueS} />
    {!s && <Shine x={50} y={30} w={10} h={2.4} r={0} />}
    {[36, 45, 54, 63, 72].map((x, i) => (
      <g key={x} fill={C.blue}>
        <path d={`M${x} ${50 + (i % 2) * 7} q3.6 5.4 0 9 q-3.6 -3.6 0 -9z`} />
        {!s && <path d={`M${x - 2} ${70 + (i % 2) * 4} q3 4.4 0 7.4 q-3 -3 0 -7.4z`} fill={C.blueL} />}
      </g>
    ))}
    <ellipse cx="54" cy="88" rx="28" ry="4.6" fill={C.blueL} opacity=".8" />
    {!s && <circle cx="32" cy="84" r="3.4" fill="#fff" stroke={C.blueL} strokeWidth="1.4" />}
    {!s && <circle cx="78" cy="82" r="2.4" fill="#fff" stroke={C.blueL} strokeWidth="1.2" />}
  </g>
)

export const Plant: Art = ({ s }) => (
  <g>
    <Ground w={22} />
    <path d="M50 58 C 38 52 26 40 30 26 C 42 28 50 42 50 58 Z" fill={C.green} />
    <path d="M50 58 C 62 50 74 40 70 22 C 58 26 50 40 50 58 Z" fill={C.greenS} />
    <path d="M50 58 C 46 44 46 28 52 16 C 58 28 56 44 50 58 Z" fill={C.greenL} />
    {!s && <path d="M50 58 C 50 46 51 32 52 20" stroke={C.greenS} strokeWidth="1.2" fill="none" opacity=".6" />}
    <path d="M32 58 h36 l-5 26 a4 4 0 0 1 -4 3 h-18 a4 4 0 0 1 -4 -3 z" fill={C.coral} />
    <rect x="29" y="55" width="42" height="8" rx="4" fill={C.coralS} />
    {!s && <Face x={50} y={72} d={8} s={s} />}
  </g>
)

export const Bucket: Art = ({ s }) => (
  <g>
    <Ground w={26} />
    <path d="M28 40 Q50 6 72 40" stroke={C.metalS} strokeWidth="3" fill="none" />
    <path d="M24 40 h52 l-6 44 a4 4 0 0 1 -4 3.5 h-32 a4 4 0 0 1 -4 -3.5 z" fill={C.blue} />
    <ellipse cx="50" cy="40" rx="26" ry="6" fill={C.blueS} />
    <ellipse cx="50" cy="41" rx="22" ry="4" fill={C.blueL} />
    <Shine x={33} y={60} w={14} h={3.2} r={-82} />
    {!s && <path d="M58 30 q3 5 0 8 q-3 -3 0 -8z" fill={C.blueL} />}
  </g>
)

export const Wrench: Art = ({ s }) => (
  <g>
    <Ground w={26} />
    <g transform="rotate(-40 50 52)">
      <rect x="44.5" y="30" width="11" height="54" rx="5.5" fill={C.blue} />
      <rect x="44.5" y="30" width="4" height="54" rx="2" fill={C.blueL} opacity=".6" />
      <path d="M37 18 a15 15 0 1 0 26 0 l-6.5 9.5 h-13 z" fill={C.metalS} />
      <path d="M37 18 a15 15 0 0 0 4.5 23 l2 -8.5 z" fill={C.ink} opacity=".18" />
      <circle cx="50" cy="76" r="3" fill={C.blueS} />
      {!s && <Shine x={46} y={24} w={7} h={2.2} r={60} />}
    </g>
    {!s && <Sparkle x={76} y={26} r={5} />}
    {!s && <Sparkle x={24} y={72} r={3.4} c={C.goldL} />}
  </g>
)

export const Bulb: Art = ({ s }) => (
  <g>
    {!s && (
      <g stroke={C.gold} strokeWidth="3" strokeLinecap="round">
        <path d="M50 6 v6 M22 18 l5 4 M78 18 l-5 4 M14 44 h6 M80 44 h6" />
      </g>
    )}
    <path d="M50 16 a24 24 0 0 1 14 43 c-3 2.5 -4 5 -4 9 h-20 c0 -4 -1 -6.5 -4 -9 A24 24 0 0 1 50 16 z" fill={C.gold} />
    <path d="M50 16 a24 24 0 0 1 14 43 c-3 2.5 -4 5 -4 9 h-6 c0-14 14 -16 14 -30 a22 22 0 0 0 -18 -22 z" fill={C.goldS} opacity=".5" />
    <ellipse cx="41" cy="32" rx="5" ry="8" fill="#fff" opacity=".6" transform="rotate(25 41 32)" />
    <rect x="39" y="68" width="22" height="6" rx="3" fill={C.metal} />
    <rect x="40" y="75" width="20" height="6" rx="3" fill={C.metalS} />
    <rect x="44" y="82" width="12" height="5" rx="2.5" fill={C.ink} opacity=".7" />
  </g>
)

export const Lotion: Art = ({ s }) => (
  <g>
    <Ground w={22} />
    <rect x="44" y="12" width="12" height="8" rx="2" fill={C.purpleS} />
    <path d="M56 14 h10 v4 h-10 z" fill={C.purpleS} />
    <rect x="40" y="20" width="20" height="10" rx="3" fill={C.purple} />
    <path d="M32 34 a6 6 0 0 1 6 -6 h24 a6 6 0 0 1 6 6 v46 a6 6 0 0 1 -6 6 h-24 a6 6 0 0 1 -6 -6 z" fill={C.pink} />
    <rect x="37" y="46" width="26" height="22" rx="4" fill={C.ivory} />
    {!s && <path d="M50 51 c-4 0 -6 4 -3 8 l3 3 l3 -3 c3 -4 1 -8 -3 -8 z" fill={C.pinkS} />}
    <Shine x={37} y={38} w={8} h={3} r={-80} />
  </g>
)

export const Toothbrush: Art = ({ s }) => (
  <g>
    <Ground w={30} />
    <g transform="rotate(-30 50 50)">
      <rect x="22" y="47" width="56" height="10" rx="5" fill={C.blue} />
      <rect x="22" y="47" width="56" height="4" rx="2" fill={C.blueL} opacity=".7" />
      <rect x="62" y="38" width="16" height="10" rx="2" fill={C.white} />
      {!s && <path d="M64 38 v10 M68 38 v10 M72 38 v10 M76 38 v10" stroke={C.blueL} strokeWidth="1.4" />}
      {/* pasta */}
      <path d="M60 38 q4 -8 10 -4 q6 -6 10 2 q-10 4 -20 2z" fill={C.greenL} />
      <path d="M62 37 q4 -4 8 -2" stroke={C.white} strokeWidth="1.6" fill="none" strokeLinecap="round" />
    </g>
    {!s && <circle cx="26" cy="30" r="5" fill={C.blueL} opacity=".5" />}
    {!s && <circle cx="34" cy="20" r="3" fill={C.blueL} opacity=".5" />}
    {!s && <Sparkle x={78} y={18} r={5} />}
  </g>
)

export const Shirt: Art = ({ s }) => (
  <g>
    <Ground w={28} />
    <path d="M36 16 l-22 12 l8 18 l8 -4 v40 a4 4 0 0 0 4 4 h32 a4 4 0 0 0 4 -4 v-40 l8 4 l8 -18 l-22 -12 q-6 8 -14 8 q-8 0 -14 -8 z" fill={C.coral} />
    <path d="M36 16 q6 8 14 8 q8 0 14 -8 l-3 -1.6 q-5 6 -11 6 q-6 0 -11 -6 z" fill={C.coralS} />
    <path d="M14 28 l8 18 l4 -2 l-8 -18 z" fill={C.coralS} opacity=".6" />
    <path d="M86 28 l-8 18 l-4 -2 l8 -18 z" fill={C.coralS} opacity=".6" />
    {!s && <path d="M50 50 l2.4 5 l5.4 .8 l-3.9 3.8 l.9 5.4 l-4.8 -2.6 l-4.8 2.6 l.9 -5.4 l-3.9 -3.8 l5.4 -.8 z" fill={C.goldL} />}
  </g>
)

export const Moon: Art = ({ s }) => (
  <g>
    <path d="M60 14 a34 34 0 1 0 22 52 a28 28 0 0 1 -22 -52 z" fill={C.gold} />
    <path d="M60 14 a34 34 0 0 0 -18 62 a30 30 0 0 1 18 -62 z" fill={C.goldL} opacity=".6" />
    {!s && <circle cx="40" cy="56" r="4" fill={C.goldS} opacity=".5" />}
    {!s && <circle cx="34" cy="40" r="2.6" fill={C.goldS} opacity=".5" />}
    {/* rostinho dormindo */}
    <path d="M38 48 q3 2.4 6 0 M50 50 q3 2.4 6 0" stroke={C.ink} strokeWidth="1.6" fill="none" strokeLinecap="round" />
    {!s && <ellipse cx="40" cy="58" rx="3" ry="1.6" fill={C.pink} opacity=".7" />}
    <Sparkle x={78} y={20} r={6} c={C.blueL} />
    {!s && <Sparkle x={86} y={40} r={4} c={C.blueL} />}
    {!s && <Sparkle x={70} y={86} r={3.5} c={C.blueL} />}
  </g>
)

export const Pet: Art = ({ s }) => (
  <g>
    <Ground w={36} />
    {/* tigela */}
    <path d="M58 72 h30 l-4 12 h-22 z" fill={C.coral} />
    <ellipse cx="73" cy="72" rx="15" ry="3.5" fill={C.coralS} />
    <circle cx="68" cy="70" r="2.6" fill={C.brown} />
    <circle cx="74" cy="69" r="2.6" fill={C.brown} />
    <circle cx="79" cy="70.5" r="2.4" fill={C.brown} />
    {/* cachorro */}
    <ellipse cx="34" cy="72" rx="20" ry="13" fill={C.woodL} />
    <rect x="18" y="76" width="7" height="11" rx="3.5" fill={C.wood} />
    <rect x="40" y="76" width="7" height="11" rx="3.5" fill={C.wood} />
    <path d="M14 66 q-8 -6 -4 -14" stroke={C.wood} strokeWidth="5" fill="none" strokeLinecap="round" />
    <circle cx="40" cy="46" r="16" fill={C.woodL} />
    <ellipse cx="26" cy="44" rx="6" ry="11" fill={C.brown} transform="rotate(15 26 44)" />
    <ellipse cx="54" cy="44" rx="6" ry="11" fill={C.brown} transform="rotate(-15 54 44)" />
    <ellipse cx="40" cy="53" rx="7.5" ry="5.5" fill={C.cream} />
    <ellipse cx="40" cy="50" rx="2.8" ry="2" fill={C.ink} />
    <circle cx="34" cy="43" r={s ? 2.2 : 1.9} fill={C.ink} />
    <circle cx="46" cy="43" r={s ? 2.2 : 1.9} fill={C.ink} />
    {!s && <path d="M38 56 q2 3 4 0" stroke={C.coralS} strokeWidth="2" fill="none" strokeLinecap="round" />}
    {!s && <rect x="30" y="60" width="20" height="4" rx="2" fill={C.blue} />}
  </g>
)

export const Cat: Art = ({ s }) => (
  <g>
    <Ground w={26} />
    <path d="M70 80 q16 -4 12 -22" stroke={C.gold} strokeWidth="6" fill="none" strokeLinecap="round" />
    <ellipse cx="50" cy="70" rx="22" ry="16" fill={C.gold} />
    <ellipse cx="50" cy="74" rx="11" ry="10" fill={C.cream} />
    <path d="M30 34 l4 -16 l12 10 z M70 34 l-4 -16 l-12 10 z" fill={C.goldS} />
    <path d="M33 30 l2 -7 l5 5 z M67 30 l-2 -7 l-5 5 z" fill={C.pink} />
    <circle cx="50" cy="42" r="19" fill={C.gold} />
    {!s && <path d="M44 26 q6 -3 12 0" stroke={C.goldS} strokeWidth="2.4" fill="none" strokeLinecap="round" />}
    <Face x={50} y={42} d={12} s={s} />
    {!s && <path d="M30 46 h-9 M30 50 h-8 M70 46 h9 M70 50 h8" stroke={C.goldS} strokeWidth="1.2" strokeLinecap="round" />}
  </g>
)
