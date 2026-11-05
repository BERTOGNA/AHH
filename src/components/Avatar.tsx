import type { Member } from '../db/types'
import { itemById } from '../data/items'
import { heroColor } from './hero'

interface Props {
  member: Member
  size?: number
  className?: string
  glow?: boolean
}

/** Avatar composto: base + moldura na cor do herói + capa (halo) + chapéu, ferramenta e companheiro. */
export function Avatar({ member, size = 96, className = '', glow }: Props) {
  const c = heroColor(member)
  const eq = member.avatar.equipped
  const hat = itemById(eq.chapeu)
  const tool = itemById(eq.ferramenta)
  const pet = itemById(eq.companheiro)
  const cape = itemById(eq.capa)
  const border = size >= 96 ? 6 : 3
  return (
    <span
      aria-hidden="true"
      className={`relative inline-grid shrink-0 place-items-center rounded-full ${glow ? 'glow' : ''} ${className}`}
      style={{
        width: size, height: size,
        background: `radial-gradient(circle at 50% 35%, var(--color-surface), ${c.tint} 70%)`,
        border: `${border}px solid ${c.solid}`,
        boxShadow: `inset 0 0 0 2px #d9a62e${cape?.color ? `, 0 0 0 ${Math.max(3, size / 22)}px ${cape.color}55` : ''}`,
      }}
    >
      <span style={{ fontSize: size * 0.52, lineHeight: 1 }}>{member.avatar.base}</span>
      {hat && (
        <span className="absolute" style={{ top: -size * 0.16, fontSize: size * 0.3, lineHeight: 1, transform: 'rotate(-10deg)' }}>
          {hat.emoji}
        </span>
      )}
      {tool && size >= 48 && (
        <Medal emoji={tool.emoji} size={size * 0.34} style={{ right: -size * 0.06, bottom: -size * 0.04 }} />
      )}
      {pet && size >= 48 && (
        <Medal emoji={pet.emoji} size={size * 0.3} style={{ left: -size * 0.06, bottom: -size * 0.04 }} />
      )}
    </span>
  )
}

function Medal({ emoji, size, style }: { emoji: string; size: number; style: React.CSSProperties }) {
  return (
    <span
      className="absolute grid place-items-center rounded-full border-2 border-gold bg-surface"
      style={{ width: size, height: size, fontSize: size * 0.6, lineHeight: 1, ...style }}
    >
      {emoji}
    </span>
  )
}
