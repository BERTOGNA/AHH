// Retrato ilustrado do herói (busto em SVG), feito para caber no medalhão circular do Avatar.
import { useId } from 'react'
import { HAIR_COLORS, SKIN_TONES, type HeroLook, type PortraitAge } from './look'
import { darken, facePath, geometry, mix, type Geo } from './geometry'
import { HairBack, HairFront, type HairInk } from './hair'
import { Outfit } from './outfits'

interface Props {
  look: HeroLook
  classId: string
  color: string
  age: PortraitAge
  size?: number
  className?: string
}

// O busto é desenhado em escala natural e ampliado para preencher o medalhão.
const ZOOM = 1.16
const ZOOM_Y = 47
const INK = '#2A2230'
const LIP = '#8A3445'

export function HeroPortrait({ look, classId, color, age, size = 100, className }: Props) {
  const gid = `p${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const g = geometry(age)
  const small = size < 40
  const skin = SKIN_TONES.find((s) => s.id === look.skin) ?? SKIN_TONES[1]
  const hc = HAIR_COLORS.find((h) => h.id === look.hairColor) ?? HAIR_COLORS[1]
  const ink: HairInk = { base: hc.base, shine: hc.shine, dark: darken(hc.base, 0.22) }
  const has = (x: HeroLook['extras'][number]) => look.extras.includes(x)
  const grown = age !== 'child'
  const elf = has('orelhas-elficas')
  const brow = look.hair === 'careca' ? darken(skin.shade, 0.35) : darken(hc.base, 0.15)

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true" focusable="false" className={className}>
      <defs>
        <clipPath id={`${gid}-clip`}>
          <circle cx="50" cy="50" r="39.5" />
        </clipPath>
        <clipPath id={`${gid}-face`}>
          <path d={facePath(g)} />
        </clipPath>
        <radialGradient id={`${gid}-skin`} cx=".42" cy=".38" r=".75">
          <stop offset="0" stopColor={mix(skin.base, '#FFFFFF', 0.12)} />
          <stop offset=".7" stopColor={skin.base} />
          <stop offset="1" stopColor={mix(skin.base, skin.shade, 0.6)} />
        </radialGradient>
      </defs>

      <g clipPath={`url(#${gid}-clip)`}>
        <g transform={`translate(50 ${ZOOM_Y}) scale(${ZOOM}) translate(-50 -${ZOOM_Y})`}>
        <HairBack g={g} style={look.hair} ink={ink} />
        <Neck g={g} skin={skin.base} shade={skin.shade} />
        <Outfit classId={classId} g={g} c={color} skin={skin.base} skinShade={skin.shade} small={small} gid={gid} />
        <Ears g={g} elf={elf} skin={skin.base} shade={skin.shade} />

        {/* cabeça */}
        <path d={facePath(g)} fill={`url(#${gid}-skin)`} />
        <g clipPath={`url(#${gid}-face)`}>
          {/* sombreado lateral e sob a franja */}
          <ellipse cx={g.cx + g.rx * 0.95} cy={g.cy + 3} rx={g.rx * 0.42} ry={g.ry * 1.05} fill={skin.shade} opacity=".38" />
          {look.hair !== 'careca' && <ellipse cx={g.cx} cy={g.F - 1} rx={g.rx * 1.05} ry={3.6} fill={skin.shade} opacity=".35" />}
        </g>
        {look.hair === 'careca' && (
          <ellipse cx={g.cx - g.rx * 0.35} cy={g.top + 5} rx={4.5} ry={2.4} fill="#FFFFFF" opacity=".22" transform={`rotate(-18 ${g.cx - g.rx * 0.35} ${g.top + 5})`} />
        )}

        <Face g={g} look={look} skin={skin.base} shade={skin.shade} brow={brow} small={small} grown={grown} hair={ink} />

        <HairFront g={g} style={look.hair} ink={ink} small={small} />
        {has('oculos') && <Glasses g={g} small={small} />}
        </g>
      </g>
    </svg>
  )
}

function Neck({ g, skin, shade }: { g: Geo; skin: string; shade: string }) {
  const { cx, cy, ry, sy, neckW } = g
  const y0 = cy + ry - 7
  return (
    <g>
      <rect x={cx - neckW / 2} y={y0} width={neckW} height={sy - y0 + 4} rx={neckW * 0.35} fill={skin} />
      <path d={`M ${cx - neckW / 2} ${y0} L ${cx + neckW / 2} ${y0} L ${cx + neckW / 2} ${cy + ry + 3} Q ${cx} ${cy + ry + 5.5} ${cx - neckW / 2} ${cy + ry + 3} Z`} fill={shade} opacity=".75" />
    </g>
  )
}

function Ears({ g, elf, skin, shade }: { g: Geo; elf: boolean; skin: string; shade: string }) {
  const { cx, rx, eyeY } = g
  return (
    <g>
      {[-1, 1].map((s) =>
        elf ? (
          <g key={s}>
            <path
              d={`M ${cx + s * (rx - 1.2)} ${eyeY - 3} C ${cx + s * (rx + 4)} ${eyeY - 6} ${cx + s * (rx + 8)} ${eyeY - 11} ${cx + s * (rx + 9)} ${eyeY - 12.5} C ${cx + s * (rx + 7.5)} ${eyeY - 5} ${cx + s * (rx + 4.5)} ${eyeY + 4} ${cx + s * (rx - 0.8)} ${eyeY + 5.5} Z`}
              fill={skin}
            />
            <path d={`M ${cx + s * (rx + 0.5)} ${eyeY - 1} C ${cx + s * (rx + 4)} ${eyeY - 4} ${cx + s * (rx + 6)} ${eyeY - 7.5} ${cx + s * (rx + 6.8)} ${eyeY - 9}`} fill="none" stroke={shade} strokeWidth="1.1" strokeLinecap="round" />
          </g>
        ) : (
          <g key={s}>
            <ellipse cx={cx + s * (rx - 0.2)} cy={eyeY + 1.8} rx={3} ry={4.3} fill={skin} />
            <ellipse cx={cx + s * (rx + 0.3)} cy={eyeY + 1.8} rx={1.3} ry={2.4} fill={shade} opacity=".8" />
          </g>
        ),
      )}
    </g>
  )
}

function Face({ g, look, skin, shade, brow, small, grown, hair }: {
  g: Geo; look: HeroLook; skin: string; shade: string; brow: string; small: boolean; grown: boolean; hair: HairInk
}) {
  const { cx, cy, rx, ry, eyeY, eyeDx, eyeS, mouthY } = g
  const s = eyeS * (small ? 1.15 : 1)
  const noseY = (eyeY + mouthY) / 2 + 1.2
  const beard = grown && look.extras.includes('barba')
  const stache = grown && (look.extras.includes('bigode') || beard)
  return (
    <g>
      {/* bochechas */}
      {[-1, 1].map((d) => (
        <ellipse key={d} cx={cx + d * eyeDx * 1.28} cy={eyeY + 5.6} rx={3.1} ry={1.9} fill="#FF7F86" opacity={small ? 0.22 : 0.3} />
      ))}
      {!small && look.extras.includes('sardas') &&
        [-1, 1].map((d) =>
          [[0, 0], [1.6, -0.9], [2.4, 0.8], [-1.2, 1]].map(([x, y], i) => (
            <circle key={`${d}${i}`} cx={cx + d * (eyeDx * 1.15 + x)} cy={eyeY + 4.6 + y} r={0.42} fill={darken(shade, 0.15)} />
          )),
        )}

      {/* sobrancelhas */}
      {[-1, 1].map((d) => {
        const ex = cx + d * eyeDx
        const by = eyeY - 4.6 * s
        return (
          <path key={d} d={`M ${ex + d * 2.6} ${by + 0.8} Q ${ex} ${by - 1} ${ex - d * 2.6} ${by + 0.2}`} fill="none" stroke={brow} strokeWidth={small ? 1.7 : 1.25} strokeLinecap="round" />
        )
      })}

      {/* olhos */}
      {[-1, 1].map((d) => (
        <Eye key={d} x={cx + d * eyeDx} y={eyeY} s={s} kind={look.eyes} small={small} />
      ))}

      {/* nariz */}
      <path d={`M ${cx - 1.3} ${noseY} Q ${cx} ${noseY + 1.4} ${cx + 1.3} ${noseY}`} fill="none" stroke={darken(shade, 0.08)} strokeWidth={small ? 1.4 : 1.1} strokeLinecap="round" />

      {/* barba */}
      {beard && (
        <path
          d={`M ${cx - rx + 0.4} ${cy - 1} C ${cx - rx + 0.2} ${cy + ry * 0.85} ${cx - rx * 0.42} ${cy + ry + 5} ${cx} ${cy + ry + 5} C ${cx + rx * 0.42} ${cy + ry + 5} ${cx + rx - 0.2} ${cy + ry * 0.85} ${cx + rx - 0.4} ${cy - 1} L ${cx + rx - 2.6} ${cy - 1} C ${cx + rx - 3} ${mouthY - 3} ${cx + 5} ${mouthY - 3.6} ${cx} ${mouthY - 3.6} C ${cx - 5} ${mouthY - 3.6} ${cx - rx + 3} ${mouthY - 3} ${cx - rx + 2.6} ${cy - 1} Z`}
          fill={hair.base}
        />
      )}
      {beard && <ellipse cx={cx} cy={mouthY + 0.6} rx={4.6} ry={2.6} fill={skin} />}

      <Mouth x={cx} y={mouthY} kind={look.mouth} small={small} />

      {stache && (
        <path
          d={`M ${cx} ${mouthY - 2.4} C ${cx - 2} ${mouthY - 4.4} ${cx - 5.6} ${mouthY - 3.6} ${cx - 6} ${mouthY - 1.2} C ${cx - 4} ${mouthY - 2} ${cx - 2} ${mouthY - 1.6} ${cx} ${mouthY - 1.4} C ${cx + 2} ${mouthY - 1.6} ${cx + 4} ${mouthY - 2} ${cx + 6} ${mouthY - 1.2} C ${cx + 5.6} ${mouthY - 3.6} ${cx + 2} ${mouthY - 4.4} ${cx} ${mouthY - 2.4} Z`}
          fill={beard ? darken(hair.base, 0.12) : hair.base}
        />
      )}
    </g>
  )
}

function Eye({ x, y, s, kind, small }: { x: number; y: number; s: number; kind: HeroLook['eyes']; small: boolean }) {
  if (kind === 'felizes') {
    return <path d={`M ${x - 2.5 * s} ${y + 0.8} Q ${x} ${y - 2.8 * s} ${x + 2.5 * s} ${y + 0.8}`} fill="none" stroke={INK} strokeWidth={small ? 2 : 1.6} strokeLinecap="round" />
  }
  if (kind === 'amendoados') {
    return (
      <g>
        <ellipse cx={x} cy={y + 0.2} rx={2.35 * s} ry={1.85 * s} fill={INK} />
        <path d={`M ${x - 3 * s} ${y - 0.6} Q ${x} ${y - 2.9 * s} ${x + 3 * s} ${y - 0.9}`} fill="none" stroke={INK} strokeWidth="1" strokeLinecap="round" />
        {!small && <circle cx={x - 0.7 * s} cy={y - 0.5} r={0.7 * s} fill="#fff" />}
      </g>
    )
  }
  return (
    <g>
      <ellipse cx={x} cy={y} rx={2.15 * s} ry={2.6 * s} fill={INK} />
      <circle cx={x - 0.75 * s} cy={y - 0.95 * s} r={0.85 * s} fill="#fff" />
      {!small && <circle cx={x + 0.75 * s} cy={y + 1 * s} r={0.38 * s} fill="#fff" opacity=".8" />}
    </g>
  )
}

function Mouth({ x, y, kind, small }: { x: number; y: number; kind: HeroLook['mouth']; small: boolean }) {
  if (kind === 'risada') {
    return (
      <g>
        <path d={`M ${x - 4} ${y - 0.6} Q ${x} ${y + 5.6} ${x + 4} ${y - 0.6} Z`} fill={LIP} />
        {!small && <path d={`M ${x - 2.2} ${y + 2.4} Q ${x} ${y + 1.2} ${x + 2.2} ${y + 2.4} Q ${x} ${y + 4} ${x - 2.2} ${y + 2.4} Z`} fill="#F08A98" />}
        {!small && <path d={`M ${x - 3.4} ${y - 0.4} L ${x + 3.4} ${y - 0.4} L ${x + 2.8} ${y + 0.6} L ${x - 2.8} ${y + 0.6} Z`} fill="#FFFFFF" opacity=".9" />}
      </g>
    )
  }
  if (kind === 'tranquilo') {
    return <path d={`M ${x - 2.4} ${y} Q ${x} ${y + 1.4} ${x + 2.4} ${y}`} fill="none" stroke={LIP} strokeWidth={small ? 1.7 : 1.3} strokeLinecap="round" />
  }
  return <path d={`M ${x - 3.6} ${y - 0.4} Q ${x} ${y + 3.4} ${x + 3.6} ${y - 0.4}`} fill="none" stroke={LIP} strokeWidth={small ? 1.8 : 1.45} strokeLinecap="round" />
}

function Glasses({ g, small }: { g: Geo; small: boolean }) {
  const { cx, eyeY, eyeDx, eyeS } = g
  const r = 3.9 * eyeS
  // Armação em ouro antigo: aparece bem em todos os tons de pele.
  const frame = '#B07A1E'
  return (
    <g fill="#FFFFFF" fillOpacity=".2" stroke={frame} strokeWidth={small ? 1.6 : 1.2}>
      <circle cx={cx - eyeDx} cy={eyeY} r={r} />
      <circle cx={cx + eyeDx} cy={eyeY} r={r} />
      <path d={`M ${cx - eyeDx + r} ${eyeY - 0.4} Q ${cx} ${eyeY - 2} ${cx + eyeDx - r} ${eyeY - 0.4}`} fill="none" />
    </g>
  )
}
