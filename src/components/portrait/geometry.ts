// Geometria do retrato por faixa etária e utilitários de cor.
import type { PortraitAge } from './look'

export interface Geo {
  cx: number
  cy: number // centro da cabeça
  rx: number
  ry: number
  k: number // largura do queixo (0..1): criança mais redonda
  eyeY: number
  eyeDx: number
  eyeS: number // escala dos olhos
  mouthY: number
  neckW: number
  sy: number // linha dos ombros (base do pescoço)
  sw: number // largura dos ombros
  top: number // topo da cabeça
  F: number // linha da testa (onde a franja termina)
}

const BASE: Record<PortraitAge, Omit<Geo, 'top' | 'F'>> = {
  child: { cx: 50, cy: 42, rx: 18.5, ry: 18.8, k: 0.78, eyeY: 44.2, eyeDx: 7.1, eyeS: 1.22, mouthY: 53.2, neckW: 8.5, sy: 70, sw: 50 },
  teen: { cx: 50, cy: 40.5, rx: 16.6, ry: 19.4, k: 0.64, eyeY: 42, eyeDx: 6.5, eyeS: 1.06, mouthY: 51.6, neckW: 8.8, sy: 69, sw: 58 },
  adult: { cx: 50, cy: 39.5, rx: 16.2, ry: 20, k: 0.56, eyeY: 40.6, eyeDx: 6.3, eyeS: 1, mouthY: 51, neckW: 9.6, sy: 67.6, sw: 66 },
}

export function geometry(age: PortraitAge): Geo {
  const b = BASE[age]
  const top = b.cy - b.ry
  return { ...b, top, F: top + b.ry * 0.42 }
}

/** Rosto: oval com queixo mais ou menos afinado. */
export function facePath(g: Geo): string {
  const { cx, cy, rx, ry, k } = g
  return [
    `M ${cx} ${cy - ry}`,
    `C ${cx + rx * 0.56} ${cy - ry} ${cx + rx} ${cy - ry * 0.56} ${cx + rx} ${cy}`,
    `C ${cx + rx} ${cy + ry * 0.55} ${cx + rx * k} ${cy + ry} ${cx} ${cy + ry}`,
    `C ${cx - rx * k} ${cy + ry} ${cx - rx} ${cy + ry * 0.55} ${cx - rx} ${cy}`,
    `C ${cx - rx} ${cy - ry * 0.56} ${cx - rx * 0.56} ${cy - ry} ${cx} ${cy - ry}`,
    'Z',
  ].join(' ')
}

/** Tronco/ombros (cortados pelo medalhão). */
export function torsoPath(g: Geo): string {
  const { cx, sy, sw, neckW } = g
  const x0 = cx - sw / 2
  const x1 = cx + sw / 2
  return [
    `M ${x0} 104 L ${x0} ${sy + 10}`,
    `C ${x0} ${sy + 2.5} ${x0 + 5} ${sy - 0.5} ${cx - neckW * 0.95} ${sy - 2.4}`,
    `L ${cx + neckW * 0.95} ${sy - 2.4}`,
    `C ${x1 - 5} ${sy - 0.5} ${x1} ${sy + 2.5} ${x1} ${sy + 10}`,
    `L ${x1} 104 Z`,
  ].join(' ')
}

const hex = (h: string) => {
  const s = h.replace('#', '')
  return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16))
}
const toHex = (c: number[]) => `#${c.map((x) => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, '0')).join('')}`

/** Mistura duas cores hex (t = 0 → a, 1 → b). */
export function mix(a: string, b: string, t: number): string {
  const x = hex(a)
  const y = hex(b)
  return toHex(x.map((v, i) => v + (y[i] - v) * t))
}
export const darken = (c: string, t: number) => mix(c, '#000000', t)
export const lighten = (c: string, t: number) => mix(c, '#FFFFFF', t)
