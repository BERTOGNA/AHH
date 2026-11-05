import { useId } from 'react'
import type { Member } from '../db/types'
import { itemById } from '../data/items'
import { heroColor } from './hero'

interface Props {
  member: Member
  size?: number
  className?: string
  glow?: boolean
}

/**
 * Medalhão do herói: bezel dourado em SVG, interior em gradiente da joia, rosto no centro.
 * Itens equipados aparecem como pingentes dourados (chapéu no topo, ferramenta à direita, companheiro à esquerda).
 * O chapéu inicial (gorro de aprendiz) não é desenhado: só chapéus conquistados aparecem.
 */
export function Avatar({ member, size = 96, className = '', glow }: Props) {
  const c = heroColor(member)
  const id = useId().replace(/:/g, '')
  const eq = member.avatar.equipped
  const hat = eq.chapeu && eq.chapeu !== 'gorro_aprendiz' ? itemById(eq.chapeu) : undefined
  const tool = itemById(eq.ferramenta)
  const pet = itemById(eq.companheiro)
  const cape = itemById(eq.capa)
  const charms = size >= 56
  return (
    <span
      aria-hidden="true"
      className={`relative inline-grid shrink-0 place-items-center rounded-full ${glow ? 'glow' : ''} ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 100 100" width={size} height={size} className="absolute inset-0" style={{ filter: size >= 48 ? 'drop-shadow(0 3px 6px rgb(15 18 48 / .28))' : undefined }}>
        <defs>
          <linearGradient id={`b${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#F8E3A3" />
            <stop offset=".35" stopColor="#D4A23F" />
            <stop offset=".6" stopColor="#F3DDA0" />
            <stop offset="1" stopColor="#9C6B1C" />
          </linearGradient>
          <radialGradient id={`i${id}`} cx=".5" cy=".38" r=".7">
            <stop offset="0" stopColor="#FFFCF6" />
            <stop offset=".55" stopColor={c.tint} />
            <stop offset="1" stopColor={c.solid} stopOpacity=".55" />
          </radialGradient>
        </defs>
        {/* halo da capa equipada */}
        {cape?.color && <circle cx="50" cy="50" r="49" fill={cape.color} opacity=".35" />}
        <circle cx="50" cy="50" r="47" fill={`url(#b${id})`} />
        <circle cx="50" cy="50" r="42.5" fill={c.solid} />
        <circle cx="50" cy="50" r="39.5" fill={`url(#i${id})`} />
        <circle cx="50" cy="50" r="39.5" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="1" />
        {size >= 72 &&
          [0, 90, 180, 270].map((a) => (
            <circle key={a} cx={50 + 44.75 * Math.cos((a * Math.PI) / 180)} cy={50 + 44.75 * Math.sin((a * Math.PI) / 180)} r="1.6" fill="#FFF6D8" />
          ))}
      </svg>
      <span className="relative" style={{ fontSize: size * 0.46, lineHeight: 1, transform: `translateY(${size * 0.02}px)` }}>
        {member.avatar.base}
      </span>
      {hat && charms && <Charm emoji={hat.emoji} size={size * 0.3} style={{ top: -size * 0.1, left: '50%', transform: 'translateX(-50%)' }} />}
      {tool && charms && <Charm emoji={tool.emoji} size={size * 0.32} style={{ right: -size * 0.05, bottom: -size * 0.02 }} />}
      {pet && charms && <Charm emoji={pet.emoji} size={size * 0.3} style={{ left: -size * 0.05, bottom: -size * 0.02 }} />}
    </span>
  )
}

function Charm({ emoji, size, style }: { emoji: string; size: number; style: React.CSSProperties }) {
  return (
    <span
      className="absolute grid place-items-center rounded-full"
      style={{
        width: size, height: size, fontSize: size * 0.56, lineHeight: 1,
        background: 'radial-gradient(circle at 50% 35%, #FFFCF6, #F6EBCF)',
        boxShadow: '0 0 0 2px #D4A23F, 0 0 0 3px #FFF3CF, 0 2px 6px rgb(15 18 48 / .3)',
        ...style,
      }}
    >
      {emoji}
    </span>
  )
}
