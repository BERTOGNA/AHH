import { useState } from 'react'
import type { Weekday } from '../../db/types'
import type { WizardChore, WizardMember } from '../../domain/week'
import { Avatar } from '../../components/Avatar'
import { AVATAR_BASES, CLASSES } from '../../data/classes'
import { TEMPLATES } from '../../data/templates'
import { MISSIONS } from '../../data/missions'
import { CATEGORIES } from '../../data/categories'
import { WEEKDAY_SHORT } from '../../lib/date'
import { Card, DayChips, Stepper, TimeField } from './ui'
import { displayName, PLACEHOLDERS, previewMember, ROLE_LABEL, toggleDay, withAge, type Draft } from './draft'

export interface StepProps {
  d: Draft
  set: (fn: (d: Draft) => Draft) => void
}

const updateMember = (d: Draft, key: string, patch: Partial<WizardMember>): Draft => ({
  ...d, members: d.members.map((m) => (m.key === key ? { ...m, ...patch } : m)),
})

// ---------- 1. Quem mora no reino ----------

export function StepPeople({ d, set }: StepProps) {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <label className="flex flex-col gap-1">
          <span className="font-semibold">Nome do reino</span>
          <input className="field text-lg" maxLength={24} value={d.kingdomName} onChange={(e) => set((x) => ({ ...x, kingdomName: e.target.value }))} placeholder="Reino de Aurora" />
          <span className="text-sm text-muted">Pode ser o sobrenome da família, o nome da rua, o que vocês quiserem.</span>
        </label>
      </Card>
      {d.members.map((m, i) => (
        <Card key={m.key}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="flex flex-1 flex-col gap-1">
              <span className="font-semibold">Pessoa {i + 1} · nome</span>
              <input className="field" maxLength={20} value={m.name} placeholder={PLACEHOLDERS[i]} onChange={(e) => set((x) => updateMember(x, m.key, { name: e.target.value }))} />
            </label>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold" id={`age-${m.key}`}>Idade</span>
              <Stepper label={`idade de ${displayName(m, i)}`} value={m.age} min={3} max={99} onChange={(age) => set((x) => ({ ...x, members: x.members.map((y, j) => (y.key === m.key ? withAge(y, j, age) : y)) }))} />
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <div className="flex gap-2" role="group" aria-label={`Como chamar ${displayName(m, i)}`}>
              <button type="button" className="chip" aria-pressed={m.treatment === 'o'} onClick={() => set((x) => updateMember(x, m.key, { treatment: 'o' }))}>ele</button>
              <button type="button" className="chip" aria-pressed={m.treatment === 'a'} onClick={() => set((x) => updateMember(x, m.key, { treatment: 'a' }))}>ela</button>
            </div>
            <span className="ml-auto rounded-full bg-wait px-3 py-1 text-sm font-semibold text-ink">
              {ROLE_LABEL[m.role]}
              {m.role === 'teen' ? ' · planeja parte da semana' : m.role === 'child' ? ' · tela sem leitura' : ' · valida as tarefas'}
            </span>
          </div>
        </Card>
      ))}
      <Card>
        <p className="mb-2 font-semibold">Como as crianças chamam os adultos no jogo?</p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Título dos pais">
          {([['rei', '👑 Rei e Rainha'], ['pais', '🏠 Pai e Mãe'], ['guardioes', '🛡️ Guardiões']] as const).map(([k, l]) => (
            <button key={k} type="button" className="chip" aria-pressed={d.parentTitle === k} onClick={() => set((x) => ({ ...x, parentTitle: k }))}>
              {l}
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm text-muted">Aparece quando uma tarefa espera validação: "Agora {d.parentTitle === 'rei' ? 'o Rei ou a Rainha' : d.parentTitle === 'pais' ? 'o Pai ou a Mãe' : 'os Guardiões'} vai ver."</p>
      </Card>
    </div>
  )
}

// ---------- 2. Heróis ----------

export function StepHeroes({ d, set }: StepProps) {
  const [sel, setSel] = useState(0)
  const m = d.members[sel] ?? d.members[0]
  const classes = [...CLASSES].sort((a, b) => Number(b.suggestedFor.includes(m.role)) - Number(a.suggestedFor.includes(m.role)))
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-center gap-2 sm:gap-4" role="tablist" aria-label="Escolha o herói para personalizar">
        {d.members.map((x, i) => (
          <button
            key={x.key}
            role="tab"
            aria-selected={i === sel}
            onClick={() => setSel(i)}
            className={`flex w-20 flex-col items-center gap-1 rounded-2xl p-2 sm:w-24 ${i === sel ? 'bg-wait ring-2 ring-gold' : ''}`}
          >
            <Avatar member={previewMember(x, i)} size={56} />
            <span className="w-full truncate text-center text-sm font-semibold">{displayName(x, i)}</span>
          </button>
        ))}
      </div>
      <Card className="card-gilded">
        <div className="flex flex-col items-center gap-2 pb-2">
          <Avatar member={previewMember(m, sel)} size={120} />
          <p className="title-display text-xl font-bold">{displayName(m, sel)}</p>
          <p className="text-muted">{CLASSES.find((c) => c.id === m.classId)?.name[m.treatment]}</p>
        </div>
        <p className="mb-2 font-semibold" id="bases-label">Rosto do herói</p>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-8" role="radiogroup" aria-labelledby="bases-label">
          {AVATAR_BASES.map((b) => (
            <button
              key={b}
              role="radio"
              aria-checked={m.base === b}
              aria-label={`Rosto ${b}`}
              onClick={() => set((x) => updateMember(x, m.key, { base: b }))}
              className={`grid h-16 place-items-center rounded-2xl border-2 text-4xl ${m.base === b ? 'border-gold bg-wait' : 'border-line bg-white'}`}
            >
              {b}
            </button>
          ))}
        </div>
        <p className="mb-2 mt-5 font-semibold" id="classes-label">Classe (o papel no reino)</p>
        <div className="flex flex-col gap-2" role="radiogroup" aria-labelledby="classes-label">
          {classes.map((c) => (
            <button
              key={c.id}
              role="radio"
              aria-checked={m.classId === c.id}
              onClick={() => set((x) => updateMember(x, m.key, { classId: c.id }))}
              className={`flex min-h-14 items-center gap-3 rounded-2xl border-2 px-3 py-2 text-left ${m.classId === c.id ? 'border-gold bg-wait' : 'border-line bg-white'}`}
            >
              <span className="text-3xl" aria-hidden="true">{c.emoji}</span>
              <span className="flex-1">
                <span className="block font-bold">{c.name[m.treatment]}</span>
                <span className="block text-sm text-muted">{c.role}</span>
              </span>
              {m.role !== 'adult' && c.suggestedFor.includes(m.role) && <span className="text-xs font-semibold text-gold-deep">sugerida</span>}
            </button>
          ))}
        </div>
      </Card>
      <p className="text-center text-sm text-muted">Toque em cada herói lá em cima para escolher o visual de todos. A cor de cada um é fixa, para todos se reconhecerem de longe.</p>
    </div>
  )
}

// ---------- 3. Acordar e dormir ----------

export function StepTimes({ d, set }: StepProps) {
  return (
    <div className="flex flex-col gap-3">
      {d.members.map((m, i) => {
        const diff = Boolean(d.weekendDiff[m.key])
        return (
          <Card key={m.key}>
            <div className="mb-3 flex items-center gap-3">
              <Avatar member={previewMember(m, i)} size={48} />
              <h3 className="text-lg font-bold">{displayName(m, i)}</h3>
            </div>
            <div className="flex flex-wrap gap-4">
              <TimeField label={diff ? 'Acorda (seg–sex)' : 'Acorda'} value={m.wake} onChange={(v) => set((x) => updateMember(x, m.key, { wake: v }))} />
              <TimeField label={diff ? 'Dorme (dom–qui)' : 'Dorme'} value={m.sleep} onChange={(v) => set((x) => updateMember(x, m.key, { sleep: v }))} />
            </div>
            <label className="mt-3 flex min-h-12 cursor-pointer items-center gap-3">
              <input type="checkbox" className="h-6 w-6 accent-[#8a5b00]" checked={diff} onChange={(e) => set((x) => ({ ...x, weekendDiff: { ...x.weekendDiff, [m.key]: e.target.checked } }))} />
              <span className="font-semibold">Fim de semana diferente</span>
            </label>
            {diff && (
              <div className="mt-2 flex flex-wrap gap-4">
                <TimeField label="Acorda (sáb–dom)" value={m.weekendWake} onChange={(v) => set((x) => updateMember(x, m.key, { weekendWake: v }))} />
                <TimeField label="Dorme (sex–sáb)" value={m.weekendSleep} onChange={(v) => set((x) => updateMember(x, m.key, { weekendSleep: v }))} />
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )
}

// ---------- 4. Escola e trabalho ----------

const OCC = [
  ['school', '🏫 Escola'],
  ['work', '💼 Trabalho'],
  ['home', '🏠 Em casa'],
] as const

export function StepOccupation({ d, set }: StepProps) {
  return (
    <div className="flex flex-col gap-3">
      {d.members.map((m, i) => (
        <Card key={m.key}>
          <div className="mb-3 flex items-center gap-3">
            <Avatar member={previewMember(m, i)} size={48} />
            <h3 className="text-lg font-bold">{displayName(m, i)}</h3>
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label={`Onde ${displayName(m, i)} passa o dia`}>
            {OCC.map(([k, l]) => (
              <button
                key={k}
                type="button"
                className="chip"
                aria-pressed={m.occupation === k}
                onClick={() =>
                  set((x) =>
                    updateMember(x, m.key, {
                      occupation: k,
                      ...(k !== m.occupation && k === 'school' ? { occStart: '07:30', occEnd: '12:30' } : {}),
                      ...(k !== m.occupation && k === 'work' ? { occStart: '09:00', occEnd: '18:00' } : {}),
                    }),
                  )
                }
              >
                {l}
              </button>
            ))}
          </div>
          {m.occupation !== 'home' && (
            <div className="mt-3 flex flex-col gap-3">
              <DayChips label={`Dias de ${m.occupation === 'school' ? 'escola' : 'trabalho'}`} days={m.occDays} onToggle={(day) => set((x) => updateMember(x, m.key, { occDays: toggleDay(m.occDays, day) }))} />
              <div className="flex flex-wrap gap-4">
                <TimeField label="Começa" value={m.occStart} onChange={(v) => set((x) => updateMember(x, m.key, { occStart: v }))} />
                <TimeField label="Termina" value={m.occEnd} onChange={(v) => set((x) => updateMember(x, m.key, { occEnd: v }))} />
              </div>
              {m.role === 'adult' && m.occupation === 'work' && (
                <p className="text-sm text-muted">💼 O trabalho vira a tarefa "Expedição de trabalho": as crianças veem que ele também sustenta o reino.</p>
              )}
            </div>
          )}
        </Card>
      ))}
    </div>
  )
}

// ---------- 5. Quem cuida do quê ----------

const findChore = (chores: WizardChore[], templateId: string, pred: (c: WizardChore) => boolean) =>
  chores.find((c) => c.templateId === templateId && pred(c))

export function StepChores({ d, set }: StepProps) {
  const adults = d.members.filter((m) => m.role === 'adult')
  const adultKeys = new Set(adults.map((a) => a.key))
  const isAdultChore = (c: WizardChore) => adultKeys.has(c.assignee) || c.assignee === 'both' || c.assignee === 'lar'

  const toggleKid = (templateId: string, key: string, weekdays: Weekday[]) =>
    set((x) => {
      const has = findChore(x.chores, templateId, (c) => c.assignee === key)
      return { ...x, chores: has ? x.chores.filter((c) => c !== has) : [...x.chores, { templateId, assignee: key, weekdays }] }
    })
  const toggleAdult = (templateId: string, weekdays: Weekday[], household?: boolean) =>
    set((x) => {
      const has = findChore(x.chores, templateId, isAdultChore)
      if (has) return { ...x, chores: x.chores.filter((c) => c !== has) }
      return { ...x, chores: [...x.chores, { templateId, assignee: household ? 'lar' : adults[0]?.key ?? 'lar', weekdays }] }
    })
  const patch = (chore: WizardChore, p: Partial<WizardChore>) =>
    set((x) => ({ ...x, chores: x.chores.map((c) => (c === chore ? { ...c, ...p } : c)) }))

  return (
    <div className="flex flex-col gap-4">
      {d.members.map((m, i) => {
        if (m.role === 'adult') return null
        const templates = TEMPLATES[m.role]
        const mine = d.chores.filter((c) => c.assignee === m.key)
        const overloaded = m.role === 'child' && ([1, 2, 3, 4, 5, 6, 7] as Weekday[]).some((day) => mine.filter((c) => c.weekdays.includes(day)).length > 5)
        return (
          <Card key={m.key}>
            <div className="mb-3 flex items-center gap-3">
              <Avatar member={previewMember(m, i)} size={48} />
              <div>
                <h3 className="text-lg font-bold">{displayName(m, i)}</h3>
                <p className="text-sm text-muted">{m.role === 'child' ? 'Para os pequenos, 3 a 5 tarefas por dia é o ideal.' : 'Tarefas de mais valor e mais autonomia.'}</p>
              </div>
            </div>
            <ul className="flex flex-col gap-2">
              {templates.map((t) => {
                const c = findChore(d.chores, t.id, (x) => x.assignee === m.key)
                return (
                  <ChoreRow key={t.id} emoji={t.emoji} title={t.title} xp={t.xp} category={t.category} on={Boolean(c)} onToggle={() => toggleKid(t.id, m.key, t.weekdays)}>
                    {c && <DaysEditor label={`Dias de ${t.title}`} days={c.weekdays} onToggle={(day) => patch(c, { weekdays: toggleDay(c.weekdays, day) })} />}
                    {c && t.sharedWithAdult && <p className="text-sm text-muted">👥 Feita junto com um adulto.</p>}
                  </ChoreRow>
                )
              })}
            </ul>
            {overloaded && (
              <p className="mt-3 rounded-xl bg-wait px-3 py-2 text-sm font-semibold" role="status">
                Algum dia passou de 5 tarefas. Dá para seguir assim, mas para os pequenos menos costuma funcionar melhor.
              </p>
            )}
          </Card>
        )
      })}
      {adults.length > 0 && (
        <Card>
          <h3 className="mb-1 text-lg font-bold">Adultos</h3>
          <p className="mb-3 text-sm text-muted">O que vocês fazem pela casa também entra no jogo. As crianças vão ver.</p>
          <ul className="flex flex-col gap-2">
            {TEMPLATES.adult.map((t) => {
              const c = findChore(d.chores, t.id, isAdultChore)
              return (
                <ChoreRow key={t.id} emoji={t.emoji} title={t.title} xp={t.xp} category={t.category} on={Boolean(c)} onToggle={() => toggleAdult(t.id, t.weekdays, t.household)}>
                  {c && (
                    <>
                      <div className="flex flex-wrap gap-1.5" role="group" aria-label={`Quem faz ${t.title}`}>
                        {adults.map((a) => (
                          <button key={a.key} type="button" className="chip min-h-11 text-sm" aria-pressed={c.assignee === a.key} onClick={() => patch(c, { assignee: a.key })}>
                            {displayName(a, d.members.indexOf(a))}
                          </button>
                        ))}
                        {adults.length > 1 && (
                          <button type="button" className="chip min-h-11 text-sm" aria-pressed={c.assignee === 'both'} onClick={() => patch(c, { assignee: 'both' })}>👥 Os dois</button>
                        )}
                        <button type="button" className="chip min-h-11 text-sm" aria-pressed={c.assignee === 'lar'} onClick={() => patch(c, { assignee: 'lar' })}>🏠 Lar</button>
                      </div>
                      <DaysEditor label={`Dias de ${t.title}`} days={c.weekdays} onToggle={(day) => patch(c, { weekdays: toggleDay(c.weekdays, day) })} />
                    </>
                  )}
                </ChoreRow>
              )
            })}
          </ul>
          <p className="mt-3 text-sm text-muted">🏠 <b>Lar</b> = qualquer um da família pode pegar ("Eu faço!").</p>
        </Card>
      )}
    </div>
  )
}

/** Resumo dos dias ("Seg a Sex") que abre os chips só quando a pessoa quer mudar. */
function DaysEditor({ days, onToggle, label }: { days: Weekday[]; onToggle: (d: Weekday) => void; label: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex flex-col gap-2">
      <button type="button" className="chip self-start text-sm" aria-expanded={open} aria-label={`${label}: ${daysText(days)}. ${open ? 'Fechar' : 'Mudar dias'}`} onClick={() => setOpen((v) => !v)}>
        📅 {daysText(days)} <span className="text-muted">{open ? '▴' : '✎'}</span>
      </button>
      {open && <DayChips small label={label} days={days} onToggle={onToggle} />}
    </div>
  )
}

function daysText(days: Weekday[]): string {
  const k = [...days].sort().join('')
  if (k === '1234567') return 'Todos os dias'
  if (k === '12345') return 'Seg a Sex'
  if (k === '67') return 'Fim de semana'
  if (!days.length) return 'Nenhum dia'
  return [...days].sort().map((d) => WEEKDAY_SHORT[d]).join(', ')
}

function ChoreRow({ emoji, title, xp, category, on, onToggle, children }: {
  emoji: string; title: string; xp: number; category: keyof typeof CATEGORIES; on: boolean; onToggle: () => void; children?: React.ReactNode
}) {
  return (
    <li className={`rounded-2xl border-2 px-3 py-2 ${on ? 'border-gold bg-surface' : 'border-line bg-white/60'}`}>
      <label className="flex min-h-12 cursor-pointer items-center gap-3">
        <input type="checkbox" className="h-6 w-6 shrink-0 accent-[#8a5b00]" checked={on} onChange={onToggle} />
        <span className="text-2xl" aria-hidden="true">{emoji}</span>
        <span className="flex-1 font-semibold">{title}</span>
        <span className="hidden text-sm text-muted sm:inline">{CATEGORIES[category].name}</span>
        <span className="text-sm font-bold text-gold-deep tabular-nums">{xp} XP</span>
      </label>
      {on && children && <div className="mt-2 flex flex-col gap-2 pb-1 pl-9">{children}</div>}
    </li>
  )
}

// ---------- 6. Baú e missão ----------

const REWARD_EMOJIS = ['🎁', '🍦', '🎮', '🎨', '⚽', '🛝', '🎡', '🧁', '🎤', '🏊']

export function StepChest({ d, set }: StepProps) {
  const [title, setTitle] = useState('')
  const [emoji, setEmoji] = useState('🎁')
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <h3 className="mb-1 text-lg font-bold">Recompensas do Baú</h3>
        <p className="mb-3 text-sm text-muted">
          Cada tarefa validada dá moedas (10 XP = 2 🪙). Uma semana de tarefas rende umas 50 moedas para cada criança. Trocar moedas nunca tira nível nem XP.
        </p>
        <ul className="flex flex-col gap-2">
          {d.rewards.map((r, i) => (
            <li key={`${r.title}-${i}`} className={`flex flex-wrap items-center gap-3 rounded-2xl border-2 px-3 py-2 ${r.on ? 'border-gold bg-surface' : 'border-line bg-white/60'}`}>
              <label className="flex min-h-12 flex-1 cursor-pointer items-center gap-3">
                <input type="checkbox" className="h-6 w-6 shrink-0 accent-[#8a5b00]" checked={r.on} onChange={() => set((x) => ({ ...x, rewards: x.rewards.map((y, j) => (j === i ? { ...y, on: !y.on } : y)) }))} />
                <span className="text-2xl" aria-hidden="true">{r.emoji}</span>
                <span className="font-semibold">{r.title}</span>
              </label>
              <Stepper label={`custo de ${r.title}`} value={r.cost} min={5} max={300} step={5} suffix=" 🪙" onChange={(cost) => set((x) => ({ ...x, rewards: x.rewards.map((y, j) => (j === i ? { ...y, cost } : y)) }))} />
            </li>
          ))}
        </ul>
        <form
          className="mt-4 flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            if (!title.trim()) return
            set((x) => ({ ...x, rewards: [...x.rewards, { title: title.trim(), emoji, cost: 30, on: true }] }))
            setTitle('')
          }}
        >
          <span className="font-semibold">Adicionar uma recompensa de vocês</span>
          <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Ícone da recompensa">
            {REWARD_EMOJIS.map((e) => (
              <button key={e} type="button" role="radio" aria-checked={emoji === e} aria-label={`Ícone ${e}`} onClick={() => setEmoji(e)} className={`h-12 w-12 rounded-xl border-2 text-2xl ${emoji === e ? 'border-gold bg-wait' : 'border-line bg-white'}`}>
                {e}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input className="field" maxLength={40} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Acampar na sala" aria-label="Nome da recompensa" />
            <button className="btn btn-ghost shrink-0" disabled={!title.trim()}>Adicionar</button>
          </div>
        </form>
      </Card>
      <Card>
        <h3 className="mb-1 text-lg font-bold">Missão da primeira semana</h3>
        <p className="mb-3 text-sm text-muted">Todos contribuem para uma meta só. Ao completar, a família ganha a recompensa coletiva.</p>
        <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Missão da semana">
          {MISSIONS.map((m) => (
            <button
              key={m.id}
              role="radio"
              aria-checked={d.missionId === m.id}
              onClick={() => set((x) => ({ ...x, missionId: m.id }))}
              className={`flex min-h-20 items-center gap-3 rounded-2xl border-2 p-3 text-left ${d.missionId === m.id ? 'border-gold bg-wait' : 'border-line bg-white'}`}
            >
              <span className="text-4xl" aria-hidden="true">{m.emoji}</span>
              <span>
                <span className="block font-bold">{m.name}</span>
                <span className="block text-sm text-muted">🎉 {m.reward}</span>
              </span>
            </button>
          ))}
        </div>
      </Card>
    </div>
  )
}
