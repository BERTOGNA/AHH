// Aventura de 12 anos e de adultos: lista densa e elegante, Chamas da Semana, mentoria e feitos invisíveis.
import { useState } from 'react'
import type { Category, Member, Task } from '../../db/types'
import { useFamily, useParentGate, useSession } from '../../state'
import { householdDay, memberDay, occurrencesFor, type Occurrence } from '../../domain/schedule'
import { levelOf, titleOf } from '../../domain/levels'
import { coinBalance, flamesOf, pendingXp, RULES, xpOf } from '../../domain/economy'
import { addHelper, joinHousehold, markDone, registerDeed, unmark } from '../../db/actions'
import { CATEGORIES } from '../../data/categories'
import { INVISIBLE_DEEDS } from '../../data/templates'
import { formatTime, isoWeekday, today, weekDates, WEEKDAY_LONG, WEEKDAY_SHORT } from '../../lib/date'
import { play } from '../../lib/sound'
import { buzz } from '../../lib/haptics'
import { Avatar } from '../../components/Avatar'
import { Progress } from '../../components/Progress'
import { Screen, Section, Empty } from '../../components/Screen'
import { TaskEditor } from '../../components/TaskEditor'
import { ThanksModal } from '../../components/ThanksModal'
import { Modal } from '../../components/Modal'
import { className } from '../../components/hero'
import { go } from '../../router'
import { useArrival, useLiveLevel } from './arrival'

type Tab = 'hoje' | 'semana' | 'mentoria'

export function GrownAdventure({ me }: { me: Member }) {
  const f = useFamily()
  useArrival(me)
  useLiveLevel(me)
  const [tab, setTab] = useState<Tab>('hoje')
  const [thanks, setThanks] = useState(false)
  const teen = me.role === 'teen'
  const apprentices = f.members.filter((m) => m.role === 'child')
  const xp = xpOf(me.id, f.events)
  const lv = levelOf(xp)
  const pending = pendingXp(me.id, f.completions)
  const showCoins = teen || f.settings.adultChest

  const tabs: { id: Tab; label: string }[] = [
    { id: 'hoje', label: 'Hoje' },
    ...(teen ? [{ id: 'semana' as Tab, label: 'Minha semana' }] : []),
    ...(teen && apprentices.length ? [{ id: 'mentoria' as Tab, label: 'Mentoria' }] : []),
  ]

  return (
    <Screen title={`Aventura de ${me.name}`} hideTitle hideMe>
      <section className="plaque mb-4 flex flex-wrap items-center gap-4 p-4">
        <button onClick={() => go(`/ficha/${me.id}`)} aria-label="Abrir ficha do personagem" className="rounded-full">
          <Avatar member={me} size={80} />
        </button>
        <div className="min-w-[200px] flex-1">
          <h1 className="title-display text-2xl font-bold">{me.name}</h1>
          <p className="font-semibold text-muted">
            Nível {lv.level} · {titleOf(lv.level, me.treatment)} · {className(me)}
          </p>
          <div className="mt-2 flex items-center gap-3">
            <Progress value={lv.into} max={lv.span} label={`Nível ${lv.level}: ${lv.into} de ${lv.span} XP`} height={8} />
            <span className="shrink-0 text-sm tabular-nums text-muted">{lv.into}/{lv.span} XP</span>
          </div>
          {pending > 0 && <p className="mt-1 text-sm text-gold">+{pending} XP aguardando validação</p>}
        </div>
        {showCoins && (
          <button className="btn btn-ghost h-14 tabular-nums" onClick={() => go('/bau')}>
            <span aria-hidden="true">🪙</span> {coinBalance(me.id, f.events, f.redemptions)} <span className="text-sm font-normal">na bolsa</span>
          </button>
        )}
      </section>

      <Flames me={me} />

      {tabs.length > 1 && (
        <div className="mb-4 flex gap-2" role="tablist" aria-label="Seções">
          {tabs.map((t) => (
            <button key={t.id} role="tab" aria-selected={tab === t.id} className="chip" aria-pressed={tab === t.id} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
      )}

      {tab === 'hoje' && <Today me={me} />}
      {tab === 'semana' && <MyWeek me={me} />}
      {tab === 'mentoria' && <Mentoring me={me} apprentices={apprentices} />}

      <div className="mt-6 flex flex-wrap gap-3">
        <button className="btn btn-ghost" onClick={() => setThanks(true)}>💛 Agradecer alguém</button>
        {me.role === 'adult' && <ParentShortcut />}
      </div>
      {thanks && <ThanksModal from={me} onClose={() => setThanks(false)} />}
    </Screen>
  )
}

function ParentShortcut() {
  const gate = useParentGate()
  const f = useFamily()
  const n = f.completions.filter((c) => c.status === 'done').length
  return (
    <button className="btn btn-night" onClick={() => gate(() => go('/pais'))}>
      🔏 Painel dos pais{n ? ` · ${n} para validar` : ''}
    </button>
  )
}

/** Chamas da Semana: lareira acesa no dia com ≥1 tarefa validada. Dia sem chama é neutro. */
function Flames({ me }: { me: Member }) {
  const f = useFamily()
  const flames = flamesOf(me.id, today(), f.completions)
  const lit = flames.filter(Boolean).length
  const need = RULES.litWeekFlames
  const msg =
    lit >= need
      ? `Semana Acesa! ${lit} chamas. A Fogueira do Reino agradece (+${RULES.litWeekXp} XP).`
      : lit === 0
        ? 'A lenha está pronta. A primeira tarefa validada acende a chama de hoje.'
        : `${lit} ${lit === 1 ? 'chama' : 'chamas'} esta semana. ${need - lit === 1 ? 'Mais uma acende' : `Mais ${need - lit} acendem`} a Fogueira.`
  return (
    <section className="plaque mb-4 p-4" aria-labelledby="chamas">
      <h2 id="chamas" className="title-display mb-2 text-lg font-bold">Chamas da Semana</h2>
      <ol className="mb-2 grid grid-cols-7 gap-1 text-center">
        {flames.map((on, i) => (
          <li key={i} aria-label={`${WEEKDAY_LONG[(i + 1) as 1]}: ${on ? 'chama acesa' : 'lenha pronta'}`}>
            <span className={`block text-3xl ${on ? '' : 'opacity-40 grayscale'}`} aria-hidden="true">{on ? '🔥' : '🪵'}</span>
            <span className="text-xs font-semibold text-muted">{WEEKDAY_SHORT[(i + 1) as 1]}</span>
          </li>
        ))}
      </ol>
      <p className="text-sm">{msg}</p>
    </section>
  )
}

function Today({ me }: { me: Member }) {
  const f = useFamily()
  const { toast } = useSession()
  const day = today()
  const occ = occurrencesFor(day, f.tasks, f.completions)
  const mine = memberDay(me.id, occ)
  const lar = householdDay(occ)
  const todo = mine.filter((o) => !o.completion)
  const deeds = f.completions.filter((c) => c.date === day && c.taskId === 'adhoc' && c.memberIds.includes(me.id))
  const doneList = mine.filter((o) => o.completion)
  const [deedOpen, setDeedOpen] = useState(false)
  const adult = me.role === 'adult'

  async function mark(o: Occurrence, ids = o.forIds) {
    await markDone(o.task, o.date, o.slot, ids, me)
    play(adult ? 'validated' : 'done')
    buzz(30)
    toast(adult ? `Feito · +${o.task.xp} XP` : 'Tarefa registrada. Aguardando validação.')
  }

  return (
    <>
      <Section title="Hoje">
        {todo.length ? (
          <ul className="plaque divide-y divide-line/60">
            {todo.map((o) => (
              <TaskRow key={o.task.id + o.slot} o={o} me={me} onCheck={() => mark(o)} />
            ))}
          </ul>
        ) : (
          <Empty>{mine.length ? 'Nada pendente por aqui. Bom ritmo.' : 'Nenhuma tarefa marcada para hoje.'}</Empty>
        )}
      </Section>

      {lar.length > 0 && (
        <Section title="Chamados do Lar">
          <ul className="plaque divide-y divide-line/60">
            {lar.map((o) => {
              const c = o.completion
              const who = c?.memberIds.map((id) => f.byId.get(id)).filter(Boolean) as Member[] | undefined
              return (
                <li key={o.task.id} className="flex min-h-16 items-center gap-3 px-3 py-2">
                  <span className="text-[28px]" aria-hidden="true">{o.task.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{o.task.title}</p>
                    <p className="text-sm text-muted">
                      {o.task.time ? `${formatTime(o.task.time)} · ` : ''}
                      {c ? `${who?.map((m) => m.name).join(' e ')} ${c.status === 'validated' ? '· validada ⭐' : '· aguardando o selo ⏳'}` : 'Quem puder pega'}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-gold">+{o.task.xp} XP</span>
                  {!c && <button className="btn btn-gold" onClick={() => mark(o, [me.id])}>Eu faço!</button>}
                  {c && c.status === 'done' && !c.memberIds.includes(me.id) && c.memberIds.length < 2 && (
                    <button className="btn btn-ghost" onClick={async () => { await joinHousehold(c.id, me.id); toast('Agora vocês fazem juntos.') }}>
                      Eu ajudo!
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        </Section>
      )}

      {adult && (
        <Section title="Bastidores do Reino">
          <p className="mb-3 text-muted">O trabalho que ninguém vê também sustenta o reino. Registre e ele aparece no Mural.</p>
          <button className="btn btn-gold" onClick={() => setDeedOpen(true)}>✚ Registrar feito invisível</button>
          {deedOpen && <DeedModal me={me} onClose={() => setDeedOpen(false)} />}
        </Section>
      )}

      {(doneList.length > 0 || deeds.length > 0) && (
        <Section title="Concluídas hoje">
          <ul className="plaque divide-y divide-line/60">
            {doneList.map((o) => (
              <TaskRow key={o.task.id + o.slot} o={o} me={me} />
            ))}
            {deeds.map((c) => (
              <li key={c.id} className="flex min-h-16 items-center gap-3 px-3 py-2">
                <span className="text-[28px]" aria-hidden="true">{c.emoji}</span>
                <p className="flex-1 font-semibold">{c.title}</p>
                <span className="text-sm font-semibold text-gold">⭐ +{c.xp} XP</span>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </>
  )
}

function TaskRow({ o, me, onCheck }: { o: Occurrence; me: Member; onCheck?: () => void }) {
  const f = useFamily()
  const c = o.completion
  const partners = o.forIds.filter((id) => id !== me.id).map((id) => f.byId.get(id)?.name).filter(Boolean)
  const helper = c?.helperId ? f.byId.get(c.helperId) : undefined
  return (
    <li className="flex min-h-16 items-center gap-3 px-3 py-2">
      {c ? (
        <span
          className={`grid h-12 w-12 shrink-0 place-items-center rounded-full text-xl ${c.status === 'validated' ? 'bg-[#fff3c9]' : 'bg-wait'}`}
          aria-hidden="true"
        >
          {c.status === 'validated' ? '⭐' : '⏳'}
        </span>
      ) : (
        <button
          onClick={onCheck}
          aria-label={`Marcar como feita: ${o.task.title}`}
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full border-[3px] border-ink/60 bg-white text-xl text-transparent hover:text-ink/40"
        >
          ✓
        </button>
      )}
      <span className="text-[28px]" aria-hidden="true">{o.task.emoji}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[17px] font-semibold">{o.task.title}</p>
        <p className="text-sm text-muted">
          {o.task.time ? formatTime(o.task.time) : 'Qualquer hora'}
          {partners.length > 0 && ` · com ${partners.join(' e ')}`}
          {helper && ` · com ajuda de ${helper.name}`}
          {c && (c.status === 'validated' ? ' · validada' : ' · aguardando validação')}
        </p>
      </div>
      <span className="shrink-0 text-sm font-bold text-gold">+{o.task.xp} XP</span>
      {c?.status === 'done' && (
        <button className="btn btn-ghost h-12 min-h-12 px-3 text-sm" onClick={() => unmark(c.id)} aria-label={`Desfazer: ${o.task.title}`}>
          Desfazer
        </button>
      )}
    </li>
  )
}

function DeedModal({ me, onClose }: { me: Member; onClose: () => void }) {
  const { toast } = useSession()
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<Category>('planejamento')
  const [xp, setXp] = useState(10)
  async function save(d: { title: string; emoji: string; category: Category; xp: number }) {
    await registerDeed(me, d)
    play('validated')
    toast('Registrado no Mural. A família vai ver.')
    onClose()
  }
  return (
    <Modal title="Registrar feito invisível" onClose={onClose}>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {INVISIBLE_DEEDS.map((d) => (
          <button key={d.title} className="btn btn-ghost justify-start" onClick={() => save(d)}>
            <span aria-hidden="true">{d.emoji}</span> {d.title}
            <span className="ml-auto text-sm text-gold">+{d.xp}</span>
          </button>
        ))}
      </div>
      <div className="divider my-4 text-sm">ou</div>
      <form
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault()
          if (title.trim()) void save({ title: title.trim(), emoji: CATEGORIES[category].emoji, category, xp })
        }}
      >
        <label>
          <span className="mb-1 block text-sm font-semibold">O que você fez?</span>
          <input className="field" value={title} maxLength={60} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Resolvi a pendência do banco" />
        </label>
        <div className="flex flex-wrap gap-2">
          <select className="field w-auto flex-1" value={category} onChange={(e) => setCategory(e.target.value as Category)} aria-label="Categoria">
            {Object.entries(CATEGORIES).map(([k, c]) => <option key={k} value={k}>{c.emoji} {c.name}</option>)}
          </select>
          <select className="field w-28" value={xp} onChange={(e) => setXp(Number(e.target.value))} aria-label="Valor em XP">
            {[5, 10, 20, 30].map((n) => <option key={n} value={n}>{n} XP</option>)}
          </select>
        </div>
        <button className="btn btn-gold" disabled={!title.trim()}>Registrar</button>
      </form>
    </Modal>
  )
}

/** 12 anos planeja a própria semana: vê, move e propõe tarefas. */
function MyWeek({ me }: { me: Member }) {
  const f = useFamily()
  const [edit, setEdit] = useState<{ task?: Task; day?: number } | null>(null)
  const dates = weekDates(today())
  return (
    <Section title="Minha semana" aside={<button className="btn btn-gold h-12 min-h-12" onClick={() => setEdit({})}>＋ Nova tarefa</button>}>
      <p className="mb-3 text-sm text-muted">Toque numa tarefa para mudar o dia ou o horário. As que você cria valem 10 XP.</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {dates.map((d) => {
          const list = memberDay(me.id, occurrencesFor(d, f.tasks, f.completions))
          const wd = isoWeekday(d)
          return (
            <section key={d} className={`plaque p-3 ${d === today() ? 'ring-2 ring-gold' : ''}`} aria-label={WEEKDAY_LONG[wd]}>
              <h3 className="mb-2 flex items-center font-bold">
                <span className="flex-1">{WEEKDAY_LONG[wd]}</span>
                <button className="h-12 w-12 rounded-full text-xl hover:bg-wait" aria-label={`Nova tarefa na ${WEEKDAY_LONG[wd]}`} onClick={() => setEdit({ day: wd })}>＋</button>
              </h3>
              {list.length ? (
                <ul className="flex flex-col gap-1">
                  {list.map((o) => (
                    <li key={o.task.id + o.slot}>
                      <button className="flex min-h-12 w-full items-center gap-2 rounded-xl px-2 text-left hover:bg-wait/60" onClick={() => setEdit({ task: o.task })}>
                        <span aria-hidden="true">{o.task.emoji}</span>
                        <span className="flex-1 truncate">{o.task.title}</span>
                        {o.task.proposedBy === me.id && <span className="text-xs text-muted" title="proposta por você">✎</span>}
                        <span className="text-sm tabular-nums text-muted">{o.task.time ? formatTime(o.task.time) : '—'}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted">Livre.</p>
              )}
            </section>
          )
        })}
      </div>
      {edit && (
        <TaskEditor
          task={edit.task}
          teenId={me.id}
          presetAssignee={me.id}
          presetDay={edit.day as 1 | undefined}
          onClose={() => setEdit(null)}
        />
      )}
    </Section>
  )
}

/** Mentoria: só aparecem tarefas do irmão que ele já marcou. Nada de "o que falta". */
function Mentoring({ me, apprentices }: { me: Member; apprentices: Member[] }) {
  const f = useFamily()
  const { toast } = useSession()
  const day = today()
  return (
    <>
      {apprentices.map((a) => {
        const done = f.completions.filter((c) => c.date === day && c.memberIds.includes(a.id))
        const helped = done.filter((c) => c.helperId === me.id)
        return (
          <Section key={a.id} title={`Mentor${me.treatment === 'a' ? 'a' : ''} de ${a.name}`}>
            <div className="plaque p-4">
              <div className="mb-3 flex items-center gap-3">
                <Avatar member={a} size={56} />
                <p className="flex-1">
                  {helped.length ? <b>{a.name} contou com você hoje.</b> : `Quando ${a.name} marcar uma missão, ela aparece aqui. Se você ajudou, registre.`}
                </p>
              </div>
              {done.length > 0 && (
                <ul className="divide-y divide-line/60">
                  {done.map((c) => (
                    <li key={c.id} className="flex min-h-14 items-center gap-3 py-2">
                      <span className="text-2xl" aria-hidden="true">{c.emoji}</span>
                      <span className="flex-1 font-semibold">{c.title}</span>
                      {c.helperId === me.id ? (
                        <span className="text-sm font-semibold text-leaf">🤝 Você ajudou</span>
                      ) : c.helperId ? (
                        <span className="text-sm text-muted">com ajuda de {f.byId.get(c.helperId)?.name}</span>
                      ) : (
                        <button className="btn btn-ghost" onClick={async () => { await addHelper(c.id, me.id); toast(`Mentoria registrada: +${RULES.mentorXp} XP quando for validada.`) }}>
                          🤝 Eu ajudei
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Section>
        )
      })}
    </>
  )
}
