// Peças comuns das ilustrações de tarefa: paleta, sombra no chão e brilhos.
import type { ReactElement } from 'react'

export interface ArtProps {
  u: string // prefixo único para ids de gradiente
  s: boolean // pequeno (< 40px): sem detalhes finos
}
export type Art = (p: ArtProps) => ReactElement

/** Paleta das ilustrações (coesa com o design system: joias suaves, ouro, marfim). */
export const C = {
  ink: '#3A3550',
  ivory: '#FFFCF6',
  cream: '#FFF1D6',
  creamS: '#F1DDB4',
  wood: '#C98B55',
  woodS: '#A66C3B',
  woodL: '#E0AA74',
  blue: '#5B86E5',
  blueS: '#3F67C7',
  blueL: '#A9C1F4',
  coral: '#EE7B62',
  coralS: '#CF5E47',
  green: '#5DB37E',
  greenS: '#3E9262',
  greenL: '#A6DDB8',
  gold: '#F4C55B',
  goldS: '#D9A23E',
  goldL: '#FBE3A0',
  purple: '#9A6BCB',
  purpleS: '#7C4FAE',
  pink: '#F29BB5',
  pinkS: '#DB7898',
  metal: '#D3D8E2',
  metalS: '#A9B0C0',
  skin: '#EFC3A0',
  skinS: '#D9A47E',
  brown: '#8C5A3C',
  brownS: '#6E4329',
  white: '#FFFFFF',
}

/** Sombra suave no chão. */
export const Ground = ({ w = 34, y = 88 }: { w?: number; y?: number }) => (
  <ellipse cx="50" cy={y} rx={w} ry="4.2" fill="#1E1A2B" opacity=".10" />
)

/** Brilho de 4 pontas. */
export const Sparkle = ({ x, y, r = 4, c = C.gold }: { x: number; y: number; r?: number; c?: string }) => (
  <path
    d={`M${x} ${y - r} Q${x + r * 0.18} ${y - r * 0.18} ${x + r} ${y} Q${x + r * 0.18} ${y + r * 0.18} ${x} ${y + r} Q${x - r * 0.18} ${y + r * 0.18} ${x - r} ${y} Q${x - r * 0.18} ${y - r * 0.18} ${x} ${y - r}Z`}
    fill={c}
  />
)

/** Reflexo branco em forma de cápsula. */
export const Shine = ({ x, y, w = 6, h = 2.4, r = -20, o = 0.55 }: { x: number; y: number; w?: number; h?: number; r?: number; o?: number }) => (
  <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={h / 2} fill="#fff" opacity={o} transform={`rotate(${r} ${x} ${y})`} />
)

/** Olhinhos fofos + bochechas (para bichos e objetos "vivos"). */
export const Face = ({ x, y, d = 7, blush = true, s }: { x: number; y: number; d?: number; blush?: boolean; s: boolean }) => (
  <g>
    <circle cx={x - d / 2} cy={y} r={s ? 1.9 : 1.6} fill={C.ink} />
    <circle cx={x + d / 2} cy={y} r={s ? 1.9 : 1.6} fill={C.ink} />
    {!s && <circle cx={x - d / 2 + 0.5} cy={y - 0.6} r=".55" fill="#fff" />}
    {!s && <circle cx={x + d / 2 + 0.5} cy={y - 0.6} r=".55" fill="#fff" />}
    <path d={`M${x - 1.8} ${y + 2.6} Q${x} ${y + 4.4} ${x + 1.8} ${y + 2.6}`} stroke={C.ink} strokeWidth="1.2" fill="none" strokeLinecap="round" />
    {blush && !s && <ellipse cx={x - d / 2 - 2.4} cy={y + 2.6} rx="2" ry="1.2" fill={C.pink} opacity=".7" />}
    {blush && !s && <ellipse cx={x + d / 2 + 2.4} cy={y + 2.6} rx="2" ry="1.2" fill={C.pink} opacity=".7" />}
  </g>
)
