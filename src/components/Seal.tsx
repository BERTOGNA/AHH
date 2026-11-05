// Peças de "metal e cera" do Reino: selo de cera (aguardando), estrela de ouro (validada), moeda e lareira.
// Reconhecíveis pela forma, não só pela cor. Todas decorativas (aria-hidden).
import { useId } from 'react'

/** Contorno ondulado de cera derramada (raio varia suavemente). */
function waxPath(cx: number, cy: number, r: number, lobes = 11, amp = 0.055): string {
  const pts: string[] = []
  const n = 120
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2
    const rr = r * (1 + amp * Math.sin(a * lobes) + amp * 0.45 * Math.sin(a * (lobes * 2 + 3) + 1.3))
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(2)},${(cy + rr * Math.sin(a)).toFixed(2)}`)
  }
  return `M${pts.join('L')}Z`
}

const WAX = waxPath(50, 50, 44)

export function WaxSeal({ size = 104, className }: { size?: number; className?: string }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" focusable="false" className={className}>
      <defs>
        <radialGradient id={`${id}w`} cx="38%" cy="32%" r="75%">
          <stop offset="0" stopColor="#F1D58A" />
          <stop offset="0.38" stopColor="#D4A23F" />
          <stop offset="1" stopColor="#A8741E" />
        </radialGradient>
        <linearGradient id={`${id}r`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8A5A12" />
          <stop offset="1" stopColor="#F1D58A" />
        </linearGradient>
        <radialGradient id={`${id}i`} cx="45%" cy="40%" r="70%">
          <stop offset="0" stopColor="#E7BD5E" />
          <stop offset="1" stopColor="#B8842A" />
        </radialGradient>
      </defs>
      {/* sombra no papel */}
      <ellipse cx="52" cy="56" rx="42" ry="40" fill="#1E1A2B" opacity="0.18" />
      <path d={WAX} fill={`url(#${id}w)`} />
      <path d={WAX} fill="none" stroke="#8A5A12" strokeOpacity="0.35" strokeWidth="1.2" />
      {/* relevo: anel chanfrado */}
      <circle cx="50" cy="50" r="30" fill={`url(#${id}i)`} />
      <circle cx="50" cy="50" r="30" fill="none" stroke={`url(#${id}r)`} strokeWidth="3" />
      <circle cx="50" cy="50" r="25.5" fill="none" stroke="#8A5A12" strokeOpacity="0.45" strokeWidth="1" />
      {/* ampulheta gravada */}
      <g fill="none" stroke="#6E4508" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M40 35.5h20M40 64.5h20" />
        <path d="M42.5 35.5c0 7.5 7.5 8.8 7.5 14.5s-7.5 7-7.5 14.5M57.5 35.5c0 7.5-7.5 8.8-7.5 14.5s7.5 7 7.5 14.5" />
      </g>
      <path d="M45 61.5 50 56.8l5 4.7z" fill="#6E4508" />
      <path d="M46 43h8l-4 4.2z" fill="#6E4508" opacity="0.8" />
      {/* brilho da cera */}
      <path d="M24 34c4-9 12-15 22-17" fill="none" stroke="#FFF6DA" strokeOpacity="0.75" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

/** Pontos de uma estrela de 5 pontas. */
function starPoints(cx: number, cy: number, R: number, r: number): [number, number][] {
  return Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5
    const rad = i % 2 ? r : R
    return [cx + rad * Math.cos(a), cy + rad * Math.sin(a)]
  })
}

export function GoldStar({ size = 104, className, glow = true }: { size?: number; className?: string; glow?: boolean }) {
  const id = useId().replace(/:/g, '')
  const pts = starPoints(50, 53, 40, 17)
  const c: [number, number] = [50, 53]
  const fmt = (p: [number, number]) => `${p[0].toFixed(2)},${p[1].toFixed(2)}`
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" focusable="false" className={className}>
      <defs>
        <radialGradient id={`${id}g`}>
          <stop offset="0" stopColor="#F1D58A" stopOpacity="0.85" />
          <stop offset="0.55" stopColor="#F1D58A" stopOpacity="0.25" />
          <stop offset="1" stopColor="#F1D58A" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}l`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFF1C4" />
          <stop offset="1" stopColor="#E9BE55" />
        </linearGradient>
        <linearGradient id={`${id}d`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#D4A23F" />
          <stop offset="1" stopColor="#9A6716" />
        </linearGradient>
      </defs>
      {glow && <circle cx="50" cy="53" r="48" fill={`url(#${id}g)`} />}
      {/* facetas: cada ponta tem lado claro e lado escuro */}
      {pts.map((p, i) => {
        const next = pts[(i + 1) % 10]
        const light = i % 2 === 0
        return (
          <polygon
            key={i}
            points={`${fmt(c)} ${fmt(p)} ${fmt(next)}`}
            fill={light ? `url(#${id}l)` : `url(#${id}d)`}
          />
        )
      })}
      <polygon points={pts.map(fmt).join(' ')} fill="none" stroke="#8A5A12" strokeWidth="2" strokeLinejoin="round" />
      {glow && <path d="M77 18l1.6 4 4 1.6-4 1.6-1.6 4-1.6-4-4-1.6 4-1.6z" fill="#FFF6DA" />}
    </svg>
  )
}

export function CoinIcon({ size = 24, className }: { size?: number; className?: string }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={className}>
      <defs>
        <linearGradient id={`${id}c`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F7E2A0" />
          <stop offset="0.5" stopColor="#D4A23F" />
          <stop offset="1" stopColor="#A8741E" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="10.5" fill={`url(#${id}c)`} stroke="#8A5A12" strokeWidth="1" />
      <circle cx="12" cy="12" r="7.6" fill="none" stroke="#8A5A12" strokeOpacity="0.55" strokeWidth="0.9" />
      <path d="M8.2 14.6v-4.3l1.9 1.7L12 9l1.9 3 1.9-1.7v4.3z" fill="#8A5A12" />
      <path d="M5.5 8.5a7.5 7.5 0 0 1 4-3.6" fill="none" stroke="#FFF6DA" strokeOpacity="0.85" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

/** Lareira das Chamas da Semana. Sem chama = lenha pronta, em tons neutros e calmos. */
export function Flame({ size = 36, lit, className }: { size?: number; lit: boolean; className?: string }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" focusable="false" className={className}>
      <defs>
        <linearGradient id={`${id}f`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#C77A1E" />
          <stop offset="0.5" stopColor="#E9A93A" />
          <stop offset="1" stopColor="#F7DC8C" />
        </linearGradient>
        <linearGradient id={`${id}c`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#F1D58A" />
          <stop offset="1" stopColor="#FFF6DA" />
        </linearGradient>
        <radialGradient id={`${id}g`} cx="50%" cy="60%" r="50%">
          <stop offset="0" stopColor="#F1D58A" stopOpacity="0.55" />
          <stop offset="1" stopColor="#F1D58A" stopOpacity="0" />
        </radialGradient>
      </defs>
      {lit && <circle cx="24" cy="27" r="22" fill={`url(#${id}g)`} />}
      {/* lenha cruzada */}
      <g strokeLinecap="round">
        <path d="M10 41 37 35" stroke={lit ? '#7A4E22' : '#A89A88'} strokeWidth="5" />
        <path d="M38 41 11 35" stroke={lit ? '#8E5D2B' : '#BDB0A0'} strokeWidth="5" />
      </g>
      <circle cx="10" cy="41" r="2.5" fill={lit ? '#B98A55' : '#D8CDBE'} />
      <circle cx="38" cy="41" r="2.5" fill={lit ? '#B98A55' : '#D8CDBE'} />
      {lit ? (
        <>
          <path d="M24 37c-6.5 0-9.5-4.2-9.5-8.6 0-5.2 4.8-8 6-14.4 2.6 2.1 3.2 4.6 3 7 1.4-1.3 2.1-3.2 2-5.3 4 3.2 8 7.4 8 12.7 0 4.4-3 8.6-9.5 8.6" fill={`url(#${id}f)`} />
          <path d="M24 37c-2.8 0-4.4-1.8-4.4-4 0-2.6 2-3.8 2.8-6.4 2.8 1.6 6 3.4 6 6.4 0 2.2-1.6 4-4.4 4" fill={`url(#${id}c)`} />
        </>
      ) : (
        /* lenha pronta: fogueira montada em tenda, esperando a primeira chama (tons calmos) */
        <g strokeLinecap="round">
          <path d="M16 36 24 21l8 15" fill="none" stroke="#BDB0A0" strokeWidth="3.2" strokeLinejoin="round" />
          <path d="M24 21v15" stroke="#CFC3B3" strokeWidth="3.2" />
        </g>
      )}
    </svg>
  )
}
