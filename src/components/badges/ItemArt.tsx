// Itens de personagem desenhados (para os pingentes do medalhão e a Ficha). Fundo transparente.
import { useId, type ReactElement } from 'react'
import { star } from './symbols'

interface P {
  u: string
  s: boolean
}
type Art = (p: P) => ReactElement

const shadow = (s: boolean) => (s ? null : <ellipse cx="50" cy="88" rx="24" ry="3.6" fill="#1E1A2B" opacity=".12" />)
const spark = (x: number, y: number, k: number, fill = '#F1D58A') => (
  <path key={`${x}${y}`} d={`M${x} ${y - 5 * k}Q${x} ${y} ${x + 5 * k} ${y}Q${x} ${y} ${x} ${y + 5 * k}Q${x} ${y} ${x - 5 * k} ${y}Q${x} ${y} ${x} ${y - 5 * k}Z`} fill={fill} />
)

const Pena: Art = ({ u, s }) => (
  <g>
    <defs>
      <linearGradient id={`${u}p`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#FFFFFF" />
        <stop offset="1" stopColor="#CFE0FA" />
      </linearGradient>
    </defs>
    {shadow(s)}
    <path d="M72 14C46 20 28 44 30 74l8-6c2-22 14-40 34-54z" fill={`url(#${u}p)`} />
    <path d="M72 14C64 34 52 54 38 68c-2-24 12-44 34-54z" fill="#9DBBEB" opacity=".55" />
    <path d="M70 16L28 84" stroke="#3F67C7" strokeWidth="2.4" strokeLinecap="round" />
    {!s && [0, 1, 2].map((i) => <path key={i} d={`M${58 - i * 8} ${32 + i * 12}l-8 2`} stroke="#3F67C7" strokeWidth="1.2" opacity=".5" />)}
  </g>
)

const capa = (color: string, dark: string, extra?: ReactElement, trim?: string): Art =>
  ({ s }) => (
    <g>
      {shadow(s)}
      <path d="M50 18c-10 0-16 4-20 8L18 78c10 8 54 8 64 0L70 26c-4-4-10-8-20-8z" fill={color} />
      <path d="M50 18c-6 0-10 2-13 4l-5 56c6 3 13 4 18 4z" fill={dark} opacity=".35" />
      {!s && <path d="M40 30l-6 46M60 30l6 46" stroke={dark} strokeWidth="1.6" opacity=".45" />}
      {trim && <path d="M18 78c10 8 54 8 64 0" stroke={trim} strokeWidth="4" fill="none" strokeLinecap="round" />}
      <path d="M34 22c8 6 24 6 32 0" stroke={dark} strokeWidth="5" fill="none" strokeLinecap="round" />
      <circle cx="50" cy="27" r="6" fill="#D4A23F" stroke="#F1D58A" strokeWidth="1.6" />
      {extra}
    </g>
  )

const Escudo: Art = ({ s }) => (
  <g>
    {shadow(s)}
    <path d="M50 14l30 10v22c0 20-14 32-30 40-16-8-30-20-30-40V24z" fill="#A9B0C0" />
    <path d="M50 20l24 8v18c0 16-11 26-24 33-13-7-24-17-24-33V28z" fill="#C98B55" />
    {!s && <path d="M38 24v52M50 20v60M62 24v52" stroke="#A66C3B" strokeWidth="1.6" opacity=".6" />}
    <circle cx="50" cy="48" r="8" fill="#D3D8E2" stroke="#A9B0C0" strokeWidth="2" />
    {!s && <path d="M30 32a30 30 0 0 1 14-9" stroke="#FFFFFF" strokeOpacity=".5" strokeWidth="2.4" fill="none" strokeLinecap="round" />}
  </g>
)

const Gatinho: Art = ({ s }) => (
  <g>
    {shadow(s)}
    <path d="M26 40L28 16l16 14zM74 40L72 16 56 30z" fill="#F4C55B" />
    {!s && <path d="M30 34l1-12 8 8zM70 34l-1-12-8 8z" fill="#F29BB5" />}
    <ellipse cx="50" cy="52" rx="28" ry="25" fill="#F4C55B" />
    <ellipse cx="50" cy="62" rx="14" ry="10" fill="#FFF1D6" />
    <circle cx="40" cy="50" r="4" fill="#3A3550" />
    <circle cx="60" cy="50" r="4" fill="#3A3550" />
    {!s && <circle cx="41.3" cy="48.6" r="1.3" fill="#fff" />}
    {!s && <circle cx="61.3" cy="48.6" r="1.3" fill="#fff" />}
    <path d="M47 58h6l-3 3z" fill="#EE7B62" />
    <path d="M50 61q-3 4-6 2M50 61q3 4 6 2" stroke="#3A3550" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    {!s && <path d="M22 56h12M22 62l12-2M78 56H66M78 62l-12-2" stroke="#D9A23E" strokeWidth="1.4" strokeLinecap="round" />}
  </g>
)

const ChapeuMago: Art = ({ s }) => (
  <g>
    {shadow(s)}
    <ellipse cx="50" cy="76" rx="36" ry="9" fill="#3F67C7" />
    <path d="M30 74C40 52 44 32 60 12c-2 18 4 40 12 62z" fill="#5B86E5" />
    <path d="M30 74C40 52 44 32 60 12c-6 22-8 42-10 64z" fill="#3F67C7" opacity=".45" />
    <path d="M31 70c12 5 28 5 40 0l1 5c-12 5-30 5-42 0z" fill="#F4C55B" />
    <path d={star(54, 46, 6, 2.6)} fill="#FBE3A0" />
    {!s && <path d={star(46, 60, 3.6, 1.6)} fill="#FBE3A0" />}
    {!s && <path d={star(62, 30, 3, 1.3)} fill="#FBE3A0" />}
  </g>
)

const Raposa: Art = ({ s }) => (
  <g>
    {shadow(s)}
    <path d="M22 34L26 12l18 16zM78 34L74 12 56 28z" fill="#EE7B62" />
    {!s && <path d="M27 28l1-10 9 8zM73 28l-1-10-9 8z" fill="#3A3550" opacity=".7" />}
    <path d="M50 82C30 82 20 60 22 38c8-8 20-12 28-12s20 4 28 12c2 22-8 44-28 44z" fill="#EE7B62" />
    <path d="M50 82c-10 0-20-10-24-22 8 2 16 0 24-6 8 6 16 8 24 6-4 12-14 22-24 22z" fill="#FFFCF6" />
    <circle cx="40" cy="50" r="3.6" fill="#3A3550" />
    <circle cx="60" cy="50" r="3.6" fill="#3A3550" />
    <ellipse cx="50" cy="66" rx="4.5" ry="3.4" fill="#3A3550" />
  </g>
)

const Varinha: Art = ({ s }) => (
  <g>
    {shadow(s)}
    <path d="M28 84L62 38" stroke="#6E4329" strokeWidth="7" strokeLinecap="round" />
    <path d="M28 84L40 68" stroke="#D4A23F" strokeWidth="7" strokeLinecap="round" />
    <path d={star(66, 30, 16, 7)} fill="#F4C55B" stroke="#D9A23E" strokeWidth="1.4" strokeLinejoin="round" />
    {!s && spark(84, 16, 1)}
    {!s && spark(46, 18, 0.7)}
    {!s && spark(86, 46, 0.6)}
  </g>
)

const CoroaOuro: Art = ({ s }) => (
  <g>
    {shadow(s)}
    <path d="M18 34l14 14 18-24 18 24 14-14-6 40H24z" fill="#F4C55B" />
    <path d="M50 24l18 24 14-14-6 40H50z" fill="#D9A23E" opacity=".45" />
    <rect x="22" y="70" width="56" height="10" rx="3" fill="#D9A23E" />
    <circle cx="50" cy="58" r="5" fill="#EE7B62" />
    <circle cx="34" cy="60" r="3.6" fill="#5B86E5" />
    <circle cx="66" cy="60" r="3.6" fill="#5DB37E" />
    {[18, 50, 82].map((x, i) => <circle key={x} cx={x} cy={i === 1 ? 22 : 32} r="4" fill="#FBE3A0" />)}
    {!s && <path d="M28 44l6 6" stroke="#FFFFFF" strokeOpacity=".6" strokeWidth="2.4" strokeLinecap="round" />}
  </g>
)

const Colher: Art = ({ s }) => (
  <g>
    {shadow(s)}
    <path d="M58 50L30 84" stroke="#A66C3B" strokeWidth="8" strokeLinecap="round" />
    <path d="M58 50L30 84" stroke="#C98B55" strokeWidth="5" strokeLinecap="round" />
    <ellipse cx="66" cy="34" rx="15" ry="20" transform="rotate(38 66 34)" fill="#C98B55" />
    <ellipse cx="66" cy="34" rx="10" ry="14" transform="rotate(38 66 34)" fill="#A66C3B" opacity=".45" />
    {!s && spark(30, 26, 1)}
    {!s && spark(86, 64, 0.8)}
    {!s && spark(42, 50, 0.6)}
  </g>
)

const Vassoura: Art = ({ s }) => (
  <g>
    {shadow(s)}
    <path d="M74 12L46 54" stroke="#A66C3B" strokeWidth="6" strokeLinecap="round" />
    <path d="M40 48l14 10-10 26c-8 2-20-6-24-12z" fill="#F4C55B" />
    <path d="M40 48l14 10-4 4-14-10z" fill="#EE7B62" />
    {!s && <path d="M36 62l-8 12M42 66l-6 14M48 66l-4 14" stroke="#D9A23E" strokeWidth="1.6" strokeLinecap="round" />}
    {!s && spark(78, 40, 1, '#9A6BCB')}
    {!s && spark(62, 76, 0.8, '#9A6BCB')}
    {!s && spark(22, 36, 0.7)}
  </g>
)

const Coruja: Art = ({ s }) => (
  <g>
    {shadow(s)}
    <path d="M28 26l10 10M72 26L62 36" stroke="#8C5A3C" strokeWidth="7" strokeLinecap="round" />
    <ellipse cx="50" cy="56" rx="26" ry="28" fill="#8C5A3C" />
    <ellipse cx="50" cy="64" rx="16" ry="17" fill="#E0AA74" />
    <circle cx="39" cy="46" r="10" fill="#FFFCF6" />
    <circle cx="61" cy="46" r="10" fill="#FFFCF6" />
    <circle cx="39" cy="46" r="5" fill="#3A3550" />
    <circle cx="61" cy="46" r="5" fill="#3A3550" />
    {!s && <circle cx="41" cy="44" r="1.8" fill="#fff" />}
    {!s && <circle cx="63" cy="44" r="1.8" fill="#fff" />}
    <path d="M46 54h8l-4 6z" fill="#F4C55B" />
    {!s && <path d="M42 70q4 2 8 0M50 74q4 2 8 0" stroke="#A66C3B" strokeWidth="1.6" fill="none" />}
  </g>
)

const CoroaFlores: Art = ({ s }) => {
  const flowers = [
    { x: 22, y: 56, c: '#F29BB5' }, { x: 34, y: 40, c: '#F4C55B' }, { x: 50, y: 34, c: '#EE7B62' },
    { x: 66, y: 40, c: '#9A6BCB' }, { x: 78, y: 56, c: '#F29BB5' },
  ]
  return (
    <g>
      {shadow(s)}
      <path d="M18 62c10-30 54-30 64 0" stroke="#5DB37E" strokeWidth="6" fill="none" strokeLinecap="round" />
      {!s && [28, 42, 58, 72].map((x, i) => <ellipse key={x} cx={x} cy={i % 3 ? 44 : 52} rx="4" ry="2.4" fill="#3E9262" transform={`rotate(${i * 30 - 40} ${x} ${i % 3 ? 44 : 52})`} />)}
      {flowers.map((f) => (
        <g key={f.x}>
          {[0, 72, 144, 216, 288].map((a) => <circle key={a} cx={f.x + 5.5 * Math.cos((a * Math.PI) / 180)} cy={f.y + 5.5 * Math.sin((a * Math.PI) / 180)} r="4.6" fill={f.c} />)}
          <circle cx={f.x} cy={f.y} r="3.4" fill="#FBE3A0" />
        </g>
      ))}
    </g>
  )
}

const Dragao: Art = ({ s }) => (
  <g>
    {shadow(s)}
    <path d="M24 46c-8-10-4-24 6-28 0 10 6 16 14 18z" fill="#3E9262" />
    <path d="M70 72c10 2 18-4 18-12-6 4-12 4-16 0z" fill="#5DB37E" />
    <ellipse cx="54" cy="64" rx="22" ry="18" fill="#5DB37E" />
    <ellipse cx="56" cy="70" rx="12" ry="9" fill="#A6DDB8" />
    <circle cx="44" cy="40" r="17" fill="#5DB37E" />
    <path d="M34 26l-2-10 8 6zM52 26l4-9 2 10z" fill="#F4C55B" />
    <circle cx="39" cy="40" r="3.6" fill="#3A3550" />
    <circle cx="51" cy="40" r="3.6" fill="#3A3550" />
    {!s && <circle cx="40.2" cy="38.8" r="1.2" fill="#fff" />}
    {!s && <circle cx="52.2" cy="38.8" r="1.2" fill="#fff" />}
    <path d="M40 48q5 4 10 0" stroke="#3A3550" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    {!s && <ellipse cx="33" cy="46" rx="3" ry="2" fill="#F29BB5" opacity=".7" />}
    {!s && <ellipse cx="56" cy="46" rx="3" ry="2" fill="#F29BB5" opacity=".7" />}
    {!s && [0, 1, 2].map((i) => <path key={i} d={`M${66 + i * 6} ${48 + i * 2}l3-5 2 6`} fill="#F4C55B" />)}
  </g>
)

const ARTS: Record<string, Art> = {
  gorro_aprendiz: Pena,
  capa_viagem: capa('#8B6B4A', '#5E4630'),
  escudo_madeira: Escudo,
  gatinho: Gatinho,
  capa_rubi: capa('#C0392B', '#7E2219'),
  chapeu_mago: ChapeuMago,
  raposa: Raposa,
  varinha: Varinha,
  coroa_ouro: CoroaOuro,
  capa_real: capa('#5B2C83', '#3A1A57', undefined, '#D4A23F'),
  colher_pau: Colher,
  vassoura: Vassoura,
  coruja: Coruja,
  coroa_flores: CoroaFlores,
  capa_estrelas: capa('#1F3A6B', '#122447', (
    <g>
      <path d={star(38, 52, 4.5, 2)} fill="#FBE3A0" />
      <path d={star(62, 60, 4, 1.8)} fill="#FBE3A0" />
      <path d={star(48, 70, 3, 1.3)} fill="#FBE3A0" />
      <path d={star(58, 42, 2.6, 1.1)} fill="#FBE3A0" />
    </g>
  )),
  dragaozinho: Dragao,
}

export const hasItemArt = (id: string) => id in ARTS

/** Arte do item de personagem. Sem arte para o id: não desenha nada (o chamador usa o emoji). */
export function ItemArt({ id, size = 40, className }: { id: string; size?: number; className?: string }) {
  const u = useId().replace(/:/g, '')
  const A = ARTS[id]
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" focusable="false" className={className}>
      {A && <A u={u} s={size < 40} />}
    </svg>
  )
}
