import { useState } from 'react'
import { Icon } from '../../components/Icon'
import { TaskArt } from '../../components/taskart/TaskArt'
import type { Completion, Member } from '../../db/types'
import { useFamily, useSession } from '../../state'
import { notYet, unvalidate, validate } from '../../db/actions'
import { Avatar } from '../../components/Avatar'
import { Modal } from '../../components/Modal'
import { Empty } from '../../components/Screen'
import { ThanksModal } from '../../components/ThanksModal'
import { play } from '../../lib/sound'
import { buzz } from '../../lib/haptics'
import { ago, dayLabel } from './time'

/** Fila de validação: um toque valida, com "Desfazer" por 5 segundos. */
export function Pending({ adultId }: { adultId: string }) {
  const { members, completions, byId } = useFamily()
  const { toast } = useSession()
  const [confirm, setConfirm] = useState<Completion[] | null>(null)
  const [thanks, setThanks] = useState<{ to: string; completionId: string; about: string } | null>(null)
  const adult = byId.get(adultId)

  const pending = completions
    .filter((c) => c.status === 'done')
    .sort((a, b) => a.date.localeCompare(b.date) || a.doneAt - b.doneAt)

  // Agrupa pelo primeiro herói da tarefa, na ordem fixa da família.
  const groups = members
    .map((m) => ({ member: m, items: pending.filter((c) => c.memberIds[0] === m.id) }))
    .filter((g) => g.items.length)

  async function validateOne(c: Completion) {
    await validate([c.id], adultId)
    play('validated')
    buzz([20, 40, 20])
    toast('Validado', { label: 'Desfazer', run: () => void unvalidate([c.id]) })
  }

  async function validateMany(list: Completion[]) {
    const ids = list.map((c) => c.id)
    await validate(ids, adultId)
    play('validated')
    buzz([20, 40, 20])
    setConfirm(null)
    toast(`${ids.length} ${ids.length === 1 ? 'tarefa validada' : 'tarefas validadas'}`, {
      label: 'Desfazer', run: () => void unvalidate(ids),
    })
  }

  if (!pending.length) return <Empty>Tudo validado. O reino está em dia. ✦</Empty>

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <p className="flex-1 text-muted">
          {pending.length === 1 ? '1 tarefa esperando o selo.' : `${pending.length} tarefas esperando o selo.`} Validem juntos, diante da família.
        </p>
        <button className="btn btn-primary h-14" onClick={() => setConfirm(pending)}>
          ✓ Validar todas ({pending.length})
        </button>
      </div>

      <div className="flex flex-col gap-5">
        {groups.map(({ member, items }) => (
          <section key={member.id} className="card p-4" aria-label={`Tarefas de ${member.name}`}>
            <div className="mb-3 flex items-center gap-3">
              <Avatar member={member} size={48} />
              <h3 className="title-display flex-1 text-lg font-bold">{member.name}</h3>
              {items.length > 1 && (
                <button className="btn btn-ghost" onClick={() => setConfirm(items)}>
                  Validar todas ({items.length})
                </button>
              )}
            </div>
            <ul className="flex flex-col divide-y divide-line">
              {items.map((c) => (
                <PendingRow
                  key={c.id}
                  c={c}
                  member={member}
                  byId={byId}
                  onValidate={() => validateOne(c)}
                  onThank={async () => {
                    await validateOne(c)
                    setThanks({ to: member.id, completionId: c.id, about: `por ${c.title.toLowerCase()}` })
                  }}
                  onNotYet={async () => {
                    await notYet(c.id)
                    toast('Tarefa voltou para fazer.')
                  }}
                />
              ))}
            </ul>
          </section>
        ))}
      </div>

      {confirm && (
        <Modal title={`Validar ${confirm.length} ${confirm.length === 1 ? 'tarefa' : 'tarefas'}`} onClose={() => setConfirm(null)}>
          <ul className="mb-5 flex max-h-[50dvh] flex-col gap-2 overflow-y-auto">
            {confirm.map((c) => (
              <li key={c.id} className="flex items-center gap-3 rounded-xl bg-white/70 px-3 py-2">
                <TaskArt emoji={c.emoji} size={32} />
                <span className="flex-1 font-semibold">{c.title}</span>
                <span className="text-sm text-muted">
                  {c.memberIds.map((id) => byId.get(id)?.name).join(' e ')} · {dayLabel(c.date)}
                </span>
              </li>
            ))}
          </ul>
          <button autoFocus className="btn btn-primary h-14 w-full text-lg" onClick={() => validateMany(confirm)}>
            ✓ Validar {confirm.length} {confirm.length === 1 ? 'tarefa' : 'tarefas'}
          </button>
        </Modal>
      )}

      {thanks && adult && (
        <ThanksModal from={adult} to={thanks.to} completionId={thanks.completionId} about={thanks.about} onClose={() => setThanks(null)} />
      )}
    </div>
  )
}

interface RowProps {
  c: Completion
  member: Member
  byId: Map<string, Member>
  onValidate: () => void
  onThank: () => void
  onNotYet: () => void
}

function PendingRow({ c, byId, onValidate, onThank, onNotYet }: RowProps) {
  const helper = c.helperId ? byId.get(c.helperId) : undefined
  const partners = c.memberIds.slice(1).map((id) => byId.get(id)?.name).filter(Boolean)
  return (
    <li className="flex flex-wrap items-center gap-3 py-3">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-wait" aria-hidden="true">
        <TaskArt emoji={c.emoji} size={38} />
      </span>
      <div className="min-w-0 flex-1 basis-40">
        <p className="font-semibold">{c.title}</p>
        <p className="text-sm text-muted">
          {dayLabel(c.date)} · {ago(c.doneAt)}
          {partners.length > 0 && ` · junto com ${partners.join(' e ')}`}
          {helper && ` · com ajuda de ${helper.name}`}
          {` · ${c.xp} XP`}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button className="btn btn-ghost h-12 px-3 text-sm text-muted" onClick={onNotYet}>
          Ainda não
        </button>
        <button
          className="btn btn-ghost h-14 w-14 p-0 text-gold-deep"
          aria-label={`Validar e agradecer: ${c.title}`}
          title="Validar e agradecer"
          onClick={onThank}
        >
          <Icon name="heart" size={24} strokeWidth={2} />
        </button>
        <button className="btn btn-primary h-14 min-w-[120px] text-lg" onClick={onValidate} aria-label={`Validar: ${c.title}`}>
          ✓ Validar
        </button>
      </div>
    </li>
  )
}
