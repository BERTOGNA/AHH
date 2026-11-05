// Ficha do Personagem: identidade e progresso de longo prazo. Itens e conquistas nunca se perdem.
import { useState } from 'react'
import type { ItemSlot, Member } from '../db/types'
import { useCurrent, useFamily, useSession } from '../state'
import { levelOf, titleOf } from '../domain/levels'
import { coinBalance, coinsEarned, RULES, xpOf } from '../domain/economy'
import { statsOf } from '../domain/achievements'
import { ACHIEVEMENTS } from '../data/achievements'
import { ITEMS, SLOT_NAMES, unlockedItems } from '../data/items'
import { AVATAR_BASES } from '../data/classes'
import { updateMember } from '../db/actions'
import { Screen, Section } from '../components/Screen'
import { Avatar } from '../components/Avatar'
import { Progress } from '../components/Progress'
import { Modal } from '../components/Modal'
import { className } from '../components/hero'
import { go } from '../router'
import { speak } from '../lib/speech'

const SLOTS: ItemSlot[] = ['chapeu', 'ferramenta', 'companheiro', 'capa']

export function CharacterSheet({ id }: { id: string }) {
  const f = useFamily()
  const me = useCurrent()
  const { adultId } = useSession()
  const [custom, setCustom] = useState(false)
  const m = f.byId.get(id)
  if (!m) {
    return (
      <Screen title="Ficha">
        <button className="btn btn-gold" onClick={() => go('/')}>Voltar ao Salão</button>
      </Screen>
    )
  }
  const own = me?.id === m.id
  const canEdit = own || Boolean(adultId)
  const kid = m.role === 'child'
  const xp = xpOf(m.id, f.events)
  const lv = levelOf(xp)
  const unlockedIds = new Set(f.unlocks.filter((u) => u.memberId === m.id).map((u) => u.achievementId))
  const items = unlockedItems(lv.level, unlockedIds)
  const have = new Set(items.map((i) => i.id))
  const s = statsOf(m.id, f)
  const mentor = s.mentorships > 0
  const flameDays = new Set(f.completions.filter((c) => c.status === 'validated' && c.memberIds.includes(m.id)).map((c) => c.date)).size

  function equip(slot: ItemSlot, itemId: string) {
    if (!canEdit) return
    const eq = { ...m!.avatar.equipped }
    if (eq[slot] === itemId) delete eq[slot]
    else eq[slot] = itemId
    void updateMember(m!.id, { avatar: { ...m!.avatar, equipped: eq } })
    const it = ITEMS.find((i) => i.id === itemId)
    if (kid && it) speak(it.name)
  }

  return (
    <Screen title={`Ficha de ${m.name}`} hideTitle>
      <section className="plaque plaque-star mb-6 flex flex-col items-center gap-3 p-6 text-center sm:flex-row sm:text-left">
        <Avatar member={m} size={180} />
        <div className="flex-1">
          <h1 className="title-display text-3xl font-bold">{m.name}</h1>
          <p className="text-lg font-semibold">{className(m)}</p>
          <p className="text-muted">{m.kingdomRole}</p>
          {mentor && <p className="mt-1 inline-block rounded-full bg-wait px-3 py-1 text-sm font-bold">🦉 Mentor{m.treatment === 'a' ? 'a' : ''} do Reino</p>}
          <div className="mt-3 max-w-md">
            {kid ? (
              <div className="flex gap-1 text-4xl" role="img" aria-label="Estrelas até o próximo nível">
                {[0, 1, 2, 3, 4].map((i) => (
                  <span key={i} className={i < Math.floor((lv.into / lv.span) * 5) ? '' : 'opacity-25 grayscale'} aria-hidden="true">⭐</span>
                ))}
              </div>
            ) : (
              <>
                <p className="font-semibold">Nível {lv.level} · {titleOf(lv.level, m.treatment)}{lv.legendStars ? ` · ${lv.legendStars} ⭐ de Lenda` : ''}</p>
                <Progress value={lv.into} max={lv.span} label={`${lv.into} de ${lv.span} XP neste nível`} />
                <p className="mt-1 text-sm text-muted">{xp} XP no total · {lv.into}/{lv.span} neste nível</p>
              </>
            )}
          </div>
          {canEdit && (
            <button className="btn btn-ghost mt-3" onClick={() => setCustom(true)}>🎨 Personalizar</button>
          )}
        </div>
        {(own || adultId) && (m.role !== 'adult' || f.settings.adultChest) && (
          <div className="plaque p-4 text-center">
            <p className="text-sm text-muted">Moedas ganhas desde sempre</p>
            <p className="title-display text-3xl font-bold tabular-nums">🪙 {coinsEarned(m.id, f.events)}</p>
            <p className="text-sm text-muted">Na bolsa: {coinBalance(m.id, f.events, f.redemptions)}</p>
          </div>
        )}
      </section>

      {!kid && (
        <Section title="Fogueira do Reino">
          <div className="plaque flex flex-wrap gap-6 p-4">
            <p><span className="title-display text-2xl font-bold">🔥 {flameDays}</span> <span className="text-muted">dias de chama</span></p>
            <p><span className="title-display text-2xl font-bold">🏕️ {s.litWeeks}</span> <span className="text-muted">semanas acesas ({RULES.litWeekFlames}+ chamas)</span></p>
            <p><span className="title-display text-2xl font-bold">🤝 {s.mentorships}</span> <span className="text-muted">mentorias</span></p>
            <p><span className="title-display text-2xl font-bold">💌 {s.thanksSent}</span> <span className="text-muted">agradecimentos enviados</span></p>
          </div>
        </Section>
      )}

      <Section title="Itens">
        <div className="grid gap-4 sm:grid-cols-2">
          {SLOTS.map((slot) => (
            <div key={slot} className="plaque p-3">
              <h3 className="mb-2 font-bold">{SLOT_NAMES[slot]}</h3>
              <ul className="grid grid-cols-4 gap-2">
                {ITEMS.filter((i) => i.slot === slot).map((it) => {
                  const ok = have.has(it.id)
                  const on = m.avatar.equipped[slot] === it.id
                  const req = it.unlock === 'start' ? '' : 'level' in it.unlock ? `Chega no nível ${it.unlock.level}` : `Vem com a conquista ${ACHIEVEMENTS.find((a) => a.id === (it.unlock as { achievement: string }).achievement)?.name}`
                  return (
                    <li key={it.id}>
                      <button
                        disabled={!ok || !canEdit}
                        onClick={() => equip(slot, it.id)}
                        aria-pressed={on}
                        aria-label={`${it.name}${ok ? (on ? ', equipado' : '') : `. ${req}`}`}
                        title={ok ? it.name : req}
                        className={`grid aspect-square w-full place-items-center rounded-2xl border-2 text-3xl ${on ? 'border-gold bg-wait' : 'border-line bg-white'} ${ok ? '' : 'opacity-40 grayscale'}`}
                        style={it.color && ok ? { boxShadow: `inset 0 0 0 4px ${it.color}55` } : undefined}
                      >
                        <span aria-hidden="true">{ok ? it.emoji : '❔'}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Conquistas">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          {ACHIEVEMENTS.map((a) => {
            const ok = unlockedIds.has(a.id)
            return (
              <li
                key={a.id}
                className={`plaque flex flex-col items-center gap-1 p-3 text-center ${ok ? '' : 'opacity-55'}`}
                aria-label={`${a.name}${ok ? ', conquistada' : `. Como conseguir: ${a.hint}`}`}
              >
                <span className={`text-4xl ${ok ? '' : 'grayscale'}`} aria-hidden="true">{ok ? a.emoji : '🔒'}</span>
                <span className="text-sm font-bold">{a.name}</span>
                <span className="text-xs text-muted">{a.hint}</span>
              </li>
            )
          })}
        </ul>
      </Section>

      {custom && <Customize m={m} onClose={() => setCustom(false)} />}
    </Screen>
  )
}

function Customize({ m, onClose }: { m: Member; onClose: () => void }) {
  return (
    <Modal title="Personalizar herói" onClose={onClose}>
      <div className="mb-4 flex justify-center"><Avatar member={m} size={120} /></div>
      <p className="mb-2 font-semibold">Rosto do herói</p>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
        {AVATAR_BASES.map((b) => (
          <button
            key={b}
            aria-pressed={m.avatar.base === b}
            aria-label={`Rosto ${b}`}
            className={`grid h-16 place-items-center rounded-2xl border-2 text-4xl ${m.avatar.base === b ? 'border-gold bg-wait' : 'border-line bg-white'}`}
            onClick={() => updateMember(m.id, { avatar: { ...m.avatar, base: b } })}
          >
            {b}
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm text-muted">Os itens são equipados na ficha, tocando neles.</p>
    </Modal>
  )
}
