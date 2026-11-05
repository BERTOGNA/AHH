// Ficha do Personagem: identidade e progresso de longo prazo. Itens e conquistas nunca se perdem.
import { ItemArt, hasItemArt } from '../components/badges/ItemArt'
import { AchievementBadge } from '../components/badges/AchievementBadge'
import { useState } from 'react'
import type { ItemSlot, Member } from '../db/types'
import { useCurrent, useFamily, useSession } from '../state'
import { levelOf, titleOf } from '../domain/levels'
import { coinBalance, coinsEarned, RULES, xpOf } from '../domain/economy'
import { statsOf } from '../domain/achievements'
import { ACHIEVEMENTS } from '../data/achievements'
import { ITEMS, SLOT_NAMES, unlockedItems } from '../data/items'
import { updateMember } from '../db/actions'
import { Screen, Section } from '../components/Screen'
import { Avatar } from '../components/Avatar'
import { LookEditor } from '../components/LookEditor'
import { Icon } from '../components/Icon'
import { CoinIcon, Flame, GoldStar } from '../components/Seal'
import { heroStyle } from '../components/hero'
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
        <button className="btn btn-primary" onClick={() => go('/')}>Voltar ao Salão</button>
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
      <section style={heroStyle(m)} className="night-sky on-night relative mb-7 flex flex-col items-center gap-5 overflow-hidden rounded-[28px] p-6 text-center shadow-[var(--shadow-e3)] sm:flex-row sm:p-8 sm:text-left">
        <span className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full opacity-40 blur-3xl" style={{ background: 'var(--hero)' }} aria-hidden="true" />
        <Avatar member={m} size={176} className="relative" />
        <div className="relative flex-1">
          <h1 className="insignia text-4xl leading-tight text-gold-light">{m.name}</h1>
          <p className="mt-1 text-lg font-semibold text-ivory">{className(m)}</p>
          <p className="text-moon">{m.kingdomRole}</p>
          {mentor && <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-gold/20 px-3 py-1 text-sm font-bold text-gold-light ring-1 ring-gold-light/40"><Icon name="feather" size={16} /> Mentor{m.treatment === 'a' ? 'a' : ''} do Reino</p>}
          <div className="mt-3 max-w-md">
            {kid ? (
              <div className="flex justify-center gap-1 sm:justify-start" role="img" aria-label="Estrelas até o próximo nível">
                {[0, 1, 2, 3, 4].map((i) => (
                  <span key={i} className={i < Math.floor((lv.into / lv.span) * 5) ? '' : 'opacity-25 grayscale'}><GoldStar size={44} glow={false} /></span>
                ))}
              </div>
            ) : (
              <>
                <p className="mb-2 font-semibold text-ivory">Nível {lv.level} · {titleOf(lv.level, m.treatment)}{lv.legendStars ? ` · ${lv.legendStars} Estrelas de Lenda` : ''}</p>
                <Progress value={lv.into} max={lv.span} label={`${lv.into} de ${lv.span} XP neste nível`} height={12} night />
                <p className="mt-1.5 text-sm text-moon">{xp} XP no total · {lv.into}/{lv.span} neste nível</p>
              </>
            )}
          </div>
          {canEdit && (
            <button className="btn btn-ghost mt-4" onClick={() => setCustom(true)}><Icon name="wand" size={18} /> Personalizar</button>
          )}
        </div>
        {(own || adultId) && (m.role !== 'adult' || f.settings.adultChest) && (
          <div className="panel-night relative p-5 text-center">
            <p className="text-sm text-moon">Moedas ganhas desde sempre</p>
            <p className="title-display mt-1 flex items-center justify-center gap-2 text-4xl tabular-nums text-gold-light"><CoinIcon size={34} /> {coinsEarned(m.id, f.events)}</p>
            <p className="mt-1 text-sm text-moon">Na bolsa: {coinBalance(m.id, f.events, f.redemptions)}</p>
          </div>
        )}
      </section>

      {!kid && (
        <Section title="Fogueira do Reino">
          <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:grid-cols-4">
            {[
              { art: <Flame size={40} lit />, n: flameDays, label: 'dias de chama' },
              { art: <Icon name="trophy" size={32} className="text-gold-deep" />, n: s.litWeeks, label: `semanas acesas (${RULES.litWeekFlames}+ chamas)` },
              { art: <Icon name="users" size={32} className="text-gold-deep" />, n: s.mentorships, label: 'mentorias' },
              { art: <Icon name="heart" size={32} className="text-gold-deep" />, n: s.thanksSent, label: 'agradecimentos enviados' },
            ].map((x) => (
              <div key={x.label} className="card flex items-center gap-3 p-4">
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-wait/60">{x.art}</span>
                <span className="min-w-0"><span className="title-display block text-3xl leading-none tabular-nums">{x.n}</span> <span className="text-sm text-muted">{x.label}</span></span>
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section title="Itens">
        <div className="grid gap-4 sm:grid-cols-2">
          {SLOTS.map((slot) => (
            <div key={slot} className="card p-3">
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
                        className={`grid aspect-square w-full place-items-center rounded-2xl border-2 text-3xl ${on ? 'border-gold bg-wait' : 'border-line bg-white'} ${ok ? '' : 'bg-bg'}`}
                        style={it.color && ok ? { boxShadow: `inset 0 0 0 4px ${it.color}55` } : undefined}
                      >
                        {ok ? (hasItemArt(it.id) ? <ItemArt id={it.id} size={52} /> : <span aria-hidden="true">{it.emoji}</span>) : <Icon name="lock" size={22} className="text-muted" />}
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
                className={`card flex flex-col items-center gap-1.5 p-3 text-center ${ok ? '' : 'bg-bg/70 shadow-none'}`}
                aria-label={`${a.name}${ok ? ', conquistada' : `. Como conseguir: ${a.hint}`}`}
              >
                <AchievementBadge id={a.id} size={76} locked={!ok} />
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
    <Modal title="Personalizar herói" onClose={onClose} wide>
      <LookEditor member={m} onChange={(look) => updateMember(m.id, { avatar: { ...m.avatar, look } })} />
      <p className="mt-4 text-center text-sm text-muted">Os itens conquistados são equipados na ficha, tocando neles.</p>
    </Modal>
  )
}
