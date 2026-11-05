// Ícones de rotina e de classe sem emoji: ilustração (TaskArt) quando existe, ícone de traço nos demais.
import type { RoutineKind } from '../db/types'
import { TaskArt } from './taskart/TaskArt'
import { Icon, type IconName } from './Icon'

const ROUTINE: Record<RoutineKind, { art?: string; icon?: IconName; color: string }> = {
  wake: { icon: 'sun', color: '#B8860B' },
  school: { art: '🏫', color: '' },
  work: { art: '💼', color: '' },
  meal: { art: '🍽️', color: '' },
  free: { icon: 'sparkle', color: '#7A3BA6' },
  sleep: { icon: 'moon', color: '#2A3170' },
  other: { icon: 'calendar', color: '#5B5468' },
}

/** Ícone da rotina. `home` = em casa (sem bloco de rotina). */
export function RoutineIcon({ kind, size = 20, light }: { kind: RoutineKind | 'home'; size?: number; light?: boolean }) {
  if (kind === 'home') return <Icon name="home" size={size} className={light ? 'text-gold-light' : 'text-gold-deep'} />
  const r = ROUTINE[kind]
  if (r.art) return <TaskArt emoji={r.art} size={Math.round(size * 1.15)} />
  return <Icon name={r.icon!} size={size} strokeWidth={2} className={light ? 'text-gold-light' : ''} style={light ? undefined : { color: r.color }} />
}

const CLASS_ICON: Record<string, IconName> = {
  alquimista: 'flame', tesoureiro: 'coin', curandeiro: 'heart', arquiteto: 'home',
  cavaleiro: 'map', mago: 'wand', bardo: 'feather', escudeiro: 'shield',
}

/** Brasão da classe: ícone dourado num círculo. */
export function ClassIcon({ classId, size = 40 }: { classId: string; size?: number }) {
  return (
    <span
      aria-hidden="true"
      className="grid shrink-0 place-items-center rounded-full text-gold-deep"
      style={{ width: size, height: size, background: 'radial-gradient(circle at 50% 35%, #FFF7DE, #F1D58A)', boxShadow: '0 0 0 1.5px #D4A23F, 0 2px 6px rgb(138 90 18 / .2)' }}
    >
      <Icon name={CLASS_ICON[classId] ?? 'shield'} size={size * 0.55} strokeWidth={2} />
    </span>
  )
}
