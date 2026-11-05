import type { CSSProperties } from 'react'
import type { Member, Settings } from '../db/types'
import { HERO_COLORS, classById } from '../data/classes'

export const heroColor = (m: Pick<Member, 'slot'>) => HERO_COLORS[m.slot] ?? HERO_COLORS[0]

export const heroStyle = (m: Pick<Member, 'slot'>) =>
  ({ '--hero': heroColor(m).solid, '--hero-tint': heroColor(m).tint }) as CSSProperties

export const className = (m: Member) => classById(m.classId).name[m.treatment]

/** Como as crianças chamam os pais: "o Rei ou a Rainha", "o Pai ou a Mãe"… */
export function parentsLabel(s: Settings, adult?: Member): string {
  const t = adult?.treatment
  if (s.parentTitle === 'pais') return t === 'a' ? 'a Mãe' : t === 'o' ? 'o Pai' : 'o Pai ou a Mãe'
  if (s.parentTitle === 'guardioes') return t === 'a' ? 'a Guardiã' : t === 'o' ? 'o Guardião' : 'os Guardiões'
  return t === 'a' ? 'a Rainha' : t === 'o' ? 'o Rei' : 'o Rei ou a Rainha'
}

export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** Ajusta "Obrigado" para quem fala no feminino. */
export const genderize = (text: string, t: Member['treatment']) => (t === 'a' ? text.replace(/\bObrigado\b/g, 'Obrigada') : text)
