// Editor do herói ilustrado: cada opção é uma miniatura do próprio herói (funciona sem leitura).
import { useState } from 'react'
import type { Member } from '../db/types'
import { Avatar } from './Avatar'
import { Icon } from './Icon'
import { speak } from '../lib/speech'
import { play } from '../lib/sound'
import {
  EXTRAS, EYES, HAIR_COLORS, HAIR_STYLES, MOUTHS, SKIN_TONES, defaultLook, type HeroLook,
} from './portrait/look'

type Tab = 'pele' | 'cabelo' | 'cor' | 'rosto' | 'extras'
const TABS: { id: Tab; label: string }[] = [
  { id: 'cabelo', label: 'Cabelo' },
  { id: 'cor', label: 'Cor do cabelo' },
  { id: 'pele', label: 'Pele' },
  { id: 'rosto', label: 'Rosto' },
  { id: 'extras', label: 'Detalhes' },
]

interface Props {
  member: Member
  onChange: (look: HeroLook) => void
}

const pick = <T,>(xs: readonly T[]) => xs[Math.floor(Math.random() * xs.length)]

export function LookEditor({ member, onChange }: Props) {
  const [tab, setTab] = useState<Tab>('cabelo')
  const look = member.avatar.look ?? defaultLook(member.role, member.treatment, member.slot)
  const kid = member.role === 'child'
  const preview = (l: HeroLook): Member => ({ ...member, avatar: { ...member.avatar, look: l, equipped: {} } })

  function set(patch: Partial<HeroLook>, say?: string) {
    onChange({ ...look, ...patch })
    play('tap')
    if (kid && say) speak(say)
  }

  function surprise() {
    const extras = EXTRAS.filter((e) => (member.role === 'child' ? e.id !== 'barba' && e.id !== 'bigode' : true))
      .filter(() => Math.random() < 0.25)
      .map((e) => e.id)
    onChange({
      skin: pick(SKIN_TONES).id, hair: pick(HAIR_STYLES).id, hairColor: pick(HAIR_COLORS).id,
      eyes: pick(EYES).id, mouth: pick(MOUTHS).id, extras,
    })
    play('done')
    if (kid) speak('Surpresa!')
  }

  const tile = (key: string, l: HeroLook, selected: boolean, label: string, onClick: () => void) => (
    <button
      key={key}
      role="radio"
      aria-checked={selected}
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`grid place-items-center rounded-2xl p-1.5 transition ${selected ? 'bg-wait ring-2 ring-gold' : 'bg-white ring-1 ring-line hover:ring-gold/60'}`}
    >
      <Avatar member={preview(l)} size={kid ? 72 : 60} />
    </button>
  )

  const swatch = (key: string, color: string, selected: boolean, label: string, onClick: () => void) => (
    <button
      key={key}
      role="radio"
      aria-checked={selected}
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`grid h-16 w-16 place-items-center rounded-full transition ${selected ? 'ring-4 ring-gold' : 'ring-1 ring-line'}`}
      style={{ background: `radial-gradient(circle at 35% 30%, #ffffff66, transparent 40%), ${color}` }}
    >
      {selected && <Icon name="check" size={26} strokeWidth={2.75} className="text-white drop-shadow" />}
    </button>
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-center gap-4">
        <Avatar member={preview(look)} size={kid ? 168 : 148} />
        <button className="btn btn-secondary h-14" onClick={surprise} aria-label="Surpresa: sortear um visual">
          <Icon name="sparkle" size={22} /> Surpresa!
        </button>
      </div>

      <div className="flex flex-wrap justify-center gap-2" role="tablist" aria-label="O que mudar">
        {TABS.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} className="chip" onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      <div role="radiogroup" aria-label={TABS.find((t) => t.id === tab)?.label} className="flex flex-wrap justify-center gap-2">
        {tab === 'cabelo' &&
          HAIR_STYLES.map((h) => tile(h.id, { ...look, hair: h.id }, look.hair === h.id, h.name, () => set({ hair: h.id }, h.name)))}
        {tab === 'cor' &&
          HAIR_COLORS.map((c) => swatch(c.id, c.base, look.hairColor === c.id, c.name, () => set({ hairColor: c.id }, c.name)))}
        {tab === 'pele' &&
          SKIN_TONES.map((t) => swatch(t.id, t.base, look.skin === t.id, t.name, () => set({ skin: t.id }, t.name)))}
        {tab === 'rosto' && (
          <>
            {EYES.map((e) => tile(`e-${e.id}`, { ...look, eyes: e.id }, look.eyes === e.id, `Olhos ${e.name.toLowerCase()}`, () => set({ eyes: e.id }, e.name)))}
            <span className="basis-full" aria-hidden="true" />
            {MOUTHS.map((m) => tile(`m-${m.id}`, { ...look, mouth: m.id }, look.mouth === m.id, m.name, () => set({ mouth: m.id }, m.name)))}
          </>
        )}
        {tab === 'extras' &&
          EXTRAS.filter((e) => member.role !== 'child' || (e.id !== 'barba' && e.id !== 'bigode')).map((e) => {
            const on = look.extras.includes(e.id)
            const next = on ? look.extras.filter((x) => x !== e.id) : [...look.extras, e.id]
            return (
              <button
                key={e.id}
                role="checkbox"
                aria-checked={on}
                aria-label={e.name}
                title={e.name}
                onClick={() => set({ extras: next }, e.name)}
                className={`grid place-items-center rounded-2xl p-1.5 transition ${on ? 'bg-wait ring-2 ring-gold' : 'bg-white ring-1 ring-line hover:ring-gold/60'}`}
              >
                <Avatar member={preview({ ...look, extras: on ? look.extras : [...look.extras, e.id] })} size={kid ? 72 : 60} />
              </button>
            )
          })}
      </div>
    </div>
  )
}
