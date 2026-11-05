// Símbolos centrais das medalhas de conquista (área útil ≈ 24..76 no viewBox 100).
// `fg` = cor clara do desenho, `ac` = detalhe dourado, `dk` = traço escuro na cor da joia.
import type { ReactElement } from 'react'

export interface SymProps {
  fg: string
  ac: string
  dk: string
  s: boolean // pequeno: sem detalhes finos
}
export type Sym = (p: SymProps) => ReactElement

const heart = (x: number, y: number, k: number) =>
  `M${x} ${y + 14 * k}C${x - 13 * k} ${y + 6 * k} ${x - 14 * k} ${y - 6 * k} ${x - 7 * k} ${y - 8 * k}C${x - 3 * k} ${y - 9 * k} ${x} ${y - 6 * k} ${x} ${y - 3 * k}C${x} ${y - 6 * k} ${x + 3 * k} ${y - 9 * k} ${x + 7 * k} ${y - 8 * k}C${x + 14 * k} ${y - 6 * k} ${x + 13 * k} ${y + 6 * k} ${x} ${y + 14 * k}Z`

export const star = (cx: number, cy: number, R: number, r: number) => {
  const p: string[] = []
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5
    const rr = i % 2 ? r : R
    p.push(`${(cx + rr * Math.cos(a)).toFixed(2)},${(cy + rr * Math.sin(a)).toFixed(2)}`)
  }
  return `M${p.join('L')}Z`
}

const sparkle = (x: number, y: number, k: number, fill: string) => (
  <path d={`M${x} ${y - 4 * k}Q${x} ${y} ${x + 4 * k} ${y}Q${x} ${y} ${x} ${y + 4 * k}Q${x} ${y} ${x - 4 * k} ${y}Q${x} ${y} ${x} ${y - 4 * k}Z`} fill={fill} />
)

const Pegadas: Sym = ({ fg, ac, s }) => (
  <g>
    <g transform="rotate(-14 40 56)">
      <ellipse cx="40" cy="58" rx="7" ry="10" fill={fg} />
      {!s && [0, 1, 2, 3].map((i) => <circle key={i} cx={34 + i * 4} cy={45 - (i === 1 || i === 2 ? 2 : 0)} r={i === 0 ? 2.6 : 2} fill={fg} />)}
    </g>
    <g transform="rotate(12 60 44)">
      <ellipse cx="60" cy="46" rx="7" ry="10" fill={ac} />
      {!s && [0, 1, 2, 3].map((i) => <circle key={i} cx={54 + i * 4} cy={33 - (i === 1 || i === 2 ? 2 : 0)} r={i === 0 ? 2.6 : 2} fill={ac} />)}
    </g>
  </g>
)

const Mao: Sym = ({ fg, dk }) => (
  <g>
    {[0, 1, 2, 3].map((i) => (
      <rect key={i} x={37 + i * 7} y={i === 0 || i === 3 ? 33 : 28} width="6" height="22" rx="3" fill={fg} />
    ))}
    <rect x="35" y="45" width="30" height="22" rx="10" fill={fg} />
    <rect x="25" y="47" width="16" height="7" rx="3.5" transform="rotate(35 33 50)" fill={fg} />
    <path d="M44 56q6 4 12 0" stroke={dk} strokeWidth="1.6" fill="none" strokeLinecap="round" opacity=".5" />
  </g>
)

const Pilar: Sym = ({ fg, ac, dk, s }) => (
  <g>
    <rect x="33" y="28" width="34" height="6" rx="2" fill={ac} />
    <rect x="36" y="33" width="28" height="4" fill={fg} />
    <rect x="39" y="37" width="22" height="26" fill={fg} />
    {!s && [43, 50, 57].map((x) => <rect key={x} x={x - 0.8} y="38" width="1.6" height="24" fill={dk} opacity=".25" />)}
    <rect x="36" y="63" width="28" height="4" fill={fg} />
    <rect x="31" y="67" width="38" height="6" rx="2" fill={ac} />
  </g>
)

const CoracaoCoroa: Sym = ({ fg, ac, s }) => (
  <g>
    <path d={heart(50, 52, 1.6)} fill={fg} />
    <path d="M38 30l4 8 8-8 8 8 4-8 -2 12H40z" fill={ac} />
    {!s && <circle cx="50" cy="28.5" r="2.2" fill={ac} />}
  </g>
)

const Pocao: Sym = ({ fg, ac, dk, s }) => (
  <g>
    <rect x="45" y="26" width="10" height="7" rx="2" fill={ac} />
    <rect x="43.5" y="32" width="13" height="12" rx="2" fill={fg} />
    <circle cx="50" cy="57" r="16" fill={fg} />
    <path d="M35.5 58a14.5 14.5 0 0 0 29 0z" fill={ac} />
    {!s && <circle cx="45" cy="62" r="2.2" fill={fg} opacity=".8" />}
    {!s && <circle cx="54" cy="64" r="1.5" fill={fg} opacity=".8" />}
    <path d="M42 49a10 10 0 0 1 6-5" stroke={dk} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity=".3" />
  </g>
)

const Torre: Sym = ({ fg, ac, dk }) => (
  <g>
    <path d="M36 32h6v5h5v-5h6v5h5v-5h6v12H36z" fill={fg} />
    <rect x="38" y="43" width="24" height="29" fill={fg} />
    <path d="M45 72V61a5 5 0 0 1 10 0v11z" fill={dk} opacity=".55" />
    <rect x="47.5" y="48" width="5" height="7" rx="2.5" fill={ac} />
    <path d="M50 32V22l8 3-8 3" fill={ac} />
  </g>
)

const Pergaminho: Sym = ({ fg, ac, dk, s }) => (
  <g>
    <rect x="34" y="32" width="32" height="36" rx="2" fill={fg} />
    <rect x="30" y="27" width="40" height="8" rx="4" fill={ac} />
    <rect x="30" y="65" width="40" height="8" rx="4" fill={ac} />
    {!s && [42, 48, 54, 60].map((y) => <rect key={y} x="39" y={y} width={y === 60 ? 14 : 22} height="2" rx="1" fill={dk} opacity=".35" />)}
  </g>
)

const Coracoes: Sym = ({ fg, ac }) => (
  <g>
    <path d={heart(42, 50, 1.1)} fill={ac} />
    <path d={heart(57, 46, 1.25)} fill={fg} />
  </g>
)

const Moedas: Sym = ({ fg, ac, dk, s }) => (
  <g>
    {[0, 1, 2].map((i) => (
      <g key={i}>
        <ellipse cx="42" cy={66 - i * 7} rx="12" ry="4.5" fill={dk} opacity=".35" />
        <ellipse cx="42" cy={64 - i * 7} rx="12" ry="4.5" fill={ac} />
      </g>
    ))}
    <circle cx="58" cy="48" r="13" fill={ac} />
    <circle cx="58" cy="48" r="9.5" fill={fg} />
    {!s && <path d="M53 51l1.5-6 3.5 3 3.5-3 1.5 6z" fill={ac} />}
  </g>
)

const Mapa: Sym = ({ fg, ac, dk, s }) => (
  <g>
    <path d="M28 34l14-4 16 4 14-4v34l-14 4-16-4-14 4z" fill={fg} />
    <path d="M42 30v34M58 34v34" stroke={dk} strokeOpacity=".25" strokeWidth="1.4" />
    {!s && <path d="M33 54q8-10 14-4t14-6" stroke={dk} strokeWidth="1.6" fill="none" strokeDasharray="2.5 2.5" opacity=".5" />}
    <circle cx="62" cy="60" r="10" fill={ac} />
    <circle cx="62" cy="60" r="7" fill={fg} />
    <path d="M62 54l2 6-2 6-2-6z" fill={dk} />
  </g>
)

const Dupla: Sym = ({ fg, ac }) => (
  <g>
    <circle cx="40" cy="38" r="8" fill={ac} />
    <path d="M26 70a14 14 0 0 1 28 0z" fill={ac} />
    <circle cx="60" cy="38" r="8" fill={fg} />
    <path d="M46 70a14 14 0 0 1 28 0z" fill={fg} />
  </g>
)

const Sino: Sym = ({ fg, ac, dk }) => (
  <g>
    <circle cx="50" cy="28" r="3" fill={ac} />
    <path d="M50 30c-11 0-15 9-15 19v8l-5 6h40l-5-6v-8c0-10-4-19-15-19z" fill={fg} />
    <rect x="32" y="61" width="36" height="4" rx="2" fill={ac} />
    <circle cx="50" cy="69" r="4.5" fill={ac} />
    <path d="M41 42a10 10 0 0 1 5-6" stroke={dk} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity=".3" />
  </g>
)

const Carta: Sym = ({ fg, ac, dk }) => (
  <g>
    <rect x="28" y="34" width="44" height="32" rx="3" fill={fg} />
    <path d="M28 37l22 16 22-16" stroke={dk} strokeOpacity=".3" strokeWidth="1.8" fill="none" strokeLinejoin="round" />
    <path d={heart(50, 50, 0.85)} fill={ac} />
  </g>
)

const Estrela: Sym = ({ fg, ac, s }) => (
  <g>
    <path d={star(50, 50, 22, 9.5)} fill={ac} />
    <path d={star(50, 50, 13, 5.6)} fill={fg} opacity=".55" />
    {!s && sparkle(72, 30, 1.3, fg)}
    {!s && sparkle(28, 66, 1, fg)}
  </g>
)

const Coruja: Sym = ({ fg, ac, dk, s }) => (
  <g>
    <path d="M33 30l7 10h-6zM67 30l-7 10h6z" fill={fg} />
    <ellipse cx="50" cy="55" rx="18" ry="20" fill={fg} />
    <path d="M32 52c-4 8-2 16 4 20 0-8 0-14 2-20zM68 52c4 8 2 16-4 20 0-8 0-14-2-20z" fill={ac} opacity=".8" />
    <circle cx="43" cy="48" r="7.5" fill={ac} />
    <circle cx="57" cy="48" r="7.5" fill={ac} />
    <circle cx="43" cy="48" r="5" fill="#FFFFFF" />
    <circle cx="57" cy="48" r="5" fill="#FFFFFF" />
    <circle cx="43.5" cy="48.5" r="2.6" fill={dk} />
    <circle cx="56.5" cy="48.5" r="2.6" fill={dk} />
    <path d="M47.5 55h5L50 60z" fill={ac} />
    {!s && <path d="M43 64l3 2 4-2 4 2 3-2M44 69l3 2 3-2 3 2 3-2" stroke={dk} strokeOpacity=".3" strokeWidth="1.3" fill="none" />}
  </g>
)

const Formatura: Sym = ({ fg, ac, dk, s }) => (
  <g>
    <path d="M38 48v10c0 5 24 5 24 0V48z" fill={fg} opacity=".85" />
    <path d="M50 30L22 42l28 12 28-12z" fill={fg} />
    <path d="M50 42l18 7v13" stroke={ac} strokeWidth="2.2" fill="none" strokeLinecap="round" />
    <circle cx="68" cy="64" r="3.4" fill={ac} />
    {!s && <path d="M50 30L22 42l28 12" stroke={dk} strokeOpacity=".2" strokeWidth="1.2" fill="none" />}
  </g>
)

const Flor: Sym = ({ fg, ac, dk }) => (
  <g>
    <path d="M50 54v18" stroke={dk} strokeWidth="3" strokeLinecap="round" opacity=".6" />
    <path d="M50 66c-6-1-9-5-9-9 5 0 8 3 9 6" fill={fg} opacity=".7" />
    {[0, 72, 144, 216, 288].map((a) => (
      <ellipse key={a} cx="50" cy="36" rx="7" ry="10" fill={fg} transform={`rotate(${a} 50 46)`} />
    ))}
    <circle cx="50" cy="46" r="7" fill={ac} />
  </g>
)

const Trofeu: Sym = ({ fg, ac, dk, s }) => (
  <g>
    <path d="M36 30h28v12a14 14 0 0 1-28 0z" fill={ac} />
    <path d="M36 34h-6a7 7 0 0 0 8 10M64 34h6a7 7 0 0 1-8 10" stroke={ac} strokeWidth="3.4" fill="none" />
    <rect x="46" y="55" width="8" height="8" fill={ac} />
    <rect x="38" y="62" width="24" height="7" rx="2" fill={fg} />
    {!s && <path d={star(50, 41, 6, 2.6)} fill={fg} />}
    <path d="M40 33v8" stroke={fg} strokeWidth="2" strokeLinecap="round" opacity=".6" />
    <rect x="38" y="62" width="24" height="2" fill={dk} opacity=".2" />
  </g>
)

const Fogueira: Sym = ({ fg, ac }) => (
  <g>
    <path d="M50 26c4 9 14 13 14 26a14 14 0 0 1-28 0c0-7 4-10 6-15 1 5 3 7 5 7-1-6 0-12 3-18z" fill={ac} />
    <path d="M50 46c3 5 7 7 7 12a7 7 0 0 1-14 0c0-4 3-6 4-9 1 2 2 3 3 3 0-2 0-4 0-6z" fill={fg} />
    <rect x="30" y="64" width="40" height="6" rx="3" transform="rotate(-10 50 67)" fill={fg} opacity=".85" />
    <rect x="30" y="64" width="40" height="6" rx="3" transform="rotate(10 50 67)" fill={fg} opacity=".7" />
  </g>
)

const Escudo: Sym = ({ fg, ac }) => (
  <g>
    <path d="M50 26l20 7v14c0 13-9 21-20 26-11-5-20-13-20-26V33z" fill={fg} />
    <path d="M50 31l15 5v11c0 10-7 16-15 20z" fill={ac} opacity=".55" />
    <path d={star(50, 48, 9, 3.8)} fill={ac} />
  </g>
)

export const SYMBOLS: Record<string, Sym> = {
  primeira_tarefa: Pegadas, tarefas_10: Mao, tarefas_50: Pilar, tarefas_100: CoracaoCoroa,
  cozinha_10: Pocao, lar_15: Torre, estudo_15: Pergaminho, cuidado_10: Coracoes, financas_5: Moedas, planejamento_5: Mapa,
  juntos_5: Dupla, chamado_5: Sino, gratidao_5: Carta, gratidao_rec_10: Estrela, mentor_1: Coruja, mentor_10: Formatura,
  missao_1: Flor, missao_3: Trofeu, semana_acesa: Fogueira, nivel_10: Escudo,
}
