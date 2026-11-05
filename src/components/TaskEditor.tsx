import { useState } from 'react'
import type { Category, Task, TaskKind, Weekday } from '../db/types'
import { useFamily, useSession } from '../state'
import { CATEGORIES, XP_LEVELS } from '../data/categories'
import { WEEKDAYS, WEEKDAY_SHORT } from '../lib/date'
import { deleteTask, saveTask } from '../db/actions'
import { Modal } from './Modal'
import { Avatar } from './Avatar'

const EMOJIS = ['🛏️', '🧸', '🍽️', '🪥', '🧺', '🪴', '🐶', '🗑️', '🧽', '🍳', '🛒', '🧾', '🚗', '🤝', '📚', '📖', '🎒', '👕', '🚿', '🧹', '🍲', '☕', '🗒️', '🗓️', '💼', '🩺', '🏃', '🎹', '⚽', '🎨', '🧠', '🥣', '🌙', '🐱', '🧴', '🪣', '🔧', '💡', '📞', '🎁']

interface Props {
  task?: Task // ausente = nova tarefa
  presetAssignee?: string
  presetDay?: Weekday
  presetTime?: string
  /** Modo 12 anos: só a própria pessoa, XP fixo 10 e marcação "proposta por você". */
  teenId?: string
  onClose: () => void
}

/** Criar/editar tarefa: o mesmo formulário serve à grade, ao Painel dos Pais e ao planejamento do 12 anos. */
export function TaskEditor({ task, presetAssignee, presetDay, presetTime, teenId, onClose }: Props) {
  const { members } = useFamily()
  const { toast } = useSession()
  const [title, setTitle] = useState(task?.title ?? '')
  const [emoji, setEmoji] = useState(task?.emoji ?? '⭐')
  const [speakText, setSpeak] = useState(task?.speak ?? '')
  const [category, setCategory] = useState<Category>(task?.category ?? 'lar')
  const [kind, setKind] = useState<TaskKind>(task?.kind ?? 'individual')
  const [assignees, setAssignees] = useState<string[]>(task?.assigneeIds ?? (presetAssignee ? [presetAssignee] : teenId ? [teenId] : []))
  const [days, setDays] = useState<Weekday[]>(task?.weekdays ?? (presetDay ? [presetDay] : [1, 2, 3, 4, 5]))
  const [hasTime, setHasTime] = useState(Boolean(task?.time ?? presetTime))
  const [time, setTime] = useState(task?.time ?? presetTime ?? '18:00')
  const [duration, setDuration] = useState(task?.duration ?? 30)
  const [xp, setXp] = useState(task?.xp ?? 10)
  const [pickEmoji, setPickEmoji] = useState(false)

  const teenMode = Boolean(teenId)
  const canDelete = task && (!teenMode || task.proposedBy === teenId)
  const lockedForTeen = teenMode && task && task.proposedBy !== teenId // pode mover, não pode mudar o resto

  function toggleAssignee(id: string) {
    if (kind === 'household') return
    setAssignees((a) => {
      if (a.includes(id)) return a.filter((x) => x !== id)
      return kind === 'shared' ? [...a.slice(-1), id] : [id]
    })
  }

  const valid =
    title.trim().length > 0 && days.length > 0 &&
    (kind === 'household' || (kind === 'individual' ? assignees.length === 1 : assignees.length === 2))

  async function save() {
    if (!valid) return
    await saveTask({
      ...task, title: title.trim(), emoji, speak: speakText.trim() || undefined, category, kind,
      assigneeIds: kind === 'household' ? [] : assignees, weekdays: [...days].sort(), time: hasTime ? time : undefined,
      duration, xp: teenMode && !task ? 10 : xp, proposedBy: task ? task.proposedBy : teenMode ? teenId : undefined,
    })
    toast(task ? 'Tarefa atualizada.' : teenMode ? 'Tarefa adicionada à sua semana.' : 'Tarefa criada.')
    onClose()
  }

  return (
    <Modal title={task ? 'Editar tarefa' : 'Nova tarefa'} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div className="flex gap-3">
          <button
            className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border-2 border-line bg-white text-4xl"
            onClick={() => setPickEmoji((v) => !v)}
            aria-label={`Ícone: ${emoji}. Trocar ícone`}
            aria-expanded={pickEmoji}
            disabled={Boolean(lockedForTeen)}
          >
            {emoji}
          </button>
          <label className="flex-1">
            <span className="mb-1 block text-sm font-semibold">Nome da tarefa</span>
            <input className="field" value={title} maxLength={40} onChange={(e) => setTitle(e.target.value)} disabled={Boolean(lockedForTeen)} placeholder="Ex.: Regar as plantas" />
          </label>
        </div>
        {pickEmoji && (
          <div className="grid grid-cols-8 gap-1 rounded-2xl border border-line bg-white p-2" role="listbox" aria-label="Ícones">
            {EMOJIS.map((e) => (
              <button key={e} role="option" aria-selected={e === emoji} className={`h-11 rounded-xl text-2xl ${e === emoji ? 'bg-wait' : ''}`} onClick={() => { setEmoji(e); setPickEmoji(false) }}>
                {e}
              </button>
            ))}
          </div>
        )}

        {!teenMode && (
          <>
            <label>
              <span className="mb-1 block text-sm font-semibold">Como falar (lido em voz alta para quem ainda não lê)</span>
              <input className="field" value={speakText} maxLength={80} onChange={(e) => setSpeak(e.target.value)} placeholder="Ex.: Hora de regar as plantinhas!" />
            </label>
            <fieldset>
              <legend className="mb-1 text-sm font-semibold">Tipo</legend>
              <div className="flex flex-wrap gap-2">
                {([['individual', '👤 Uma pessoa'], ['shared', '👥 Em dupla'], ['household', '🏠 Do lar (qualquer um)']] as const).map(([k, l]) => (
                  <button key={k} className="chip" aria-pressed={kind === k} onClick={() => { setKind(k); setAssignees((a) => (k === 'individual' ? a.slice(0, 1) : k === 'household' ? [] : a)) }}>
                    {l}
                  </button>
                ))}
              </div>
            </fieldset>
            {kind !== 'household' && (
              <fieldset>
                <legend className="mb-1 text-sm font-semibold">{kind === 'shared' ? 'Quem faz junto (escolha 2)' : 'Quem faz'}</legend>
                <div className="flex flex-wrap gap-2">
                  {members.map((m) => (
                    <button key={m.id} className="chip pl-1" aria-pressed={assignees.includes(m.id)} onClick={() => toggleAssignee(m.id)}>
                      <Avatar member={m} size={36} /> {m.name}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}
            <fieldset>
              <legend className="mb-1 text-sm font-semibold">Categoria</legend>
              <select className="field" value={category} onChange={(e) => setCategory(e.target.value as Category)} aria-label="Categoria">
                {Object.entries(CATEGORIES).map(([k, c]) => (
                  <option key={k} value={k}>{c.emoji} {c.name}</option>
                ))}
              </select>
            </fieldset>
          </>
        )}

        <fieldset>
          <legend className="mb-1 text-sm font-semibold">Dias da semana</legend>
          <div className="flex flex-wrap gap-2">
            {WEEKDAYS.map((d) => (
              <button key={d} className="chip min-w-14 justify-center" aria-pressed={days.includes(d)} onClick={() => setDays((x) => (x.includes(d) ? x.filter((y) => y !== d) : [...x, d]))}>
                {WEEKDAY_SHORT[d]}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="flex flex-wrap items-end gap-3">
          <legend className="mb-1 text-sm font-semibold">Horário</legend>
          <button className="chip" aria-pressed={!hasTime} onClick={() => setHasTime(false)}>Qualquer hora</button>
          <button className="chip" aria-pressed={hasTime} onClick={() => setHasTime(true)}>Com horário</button>
          {hasTime && (
            <>
              <label className="flex items-center gap-2">
                <span className="text-sm">Início</span>
                <input type="time" step={900} className="field w-32" value={time} onChange={(e) => setTime(e.target.value)} />
              </label>
              <label className="flex items-center gap-2">
                <span className="text-sm">Duração</span>
                <select className="field w-28" value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
                  {[15, 30, 45, 60, 90, 120, 180, 240, 480, 540].map((n) => (
                    <option key={n} value={n}>{n < 60 ? `${n} min` : n % 60 ? `${Math.floor(n / 60)}h30` : `${n / 60}h`}</option>
                  ))}
                </select>
              </label>
            </>
          )}
        </fieldset>

        {!teenMode && (
          <fieldset>
            <legend className="mb-1 text-sm font-semibold">Valor</legend>
            <div className="flex flex-wrap gap-2">
              {XP_LEVELS.map((l) => (
                <button key={l.xp} className="chip" aria-pressed={xp === l.xp} onClick={() => setXp(l.xp)}>
                  {l.name} · {l.xp} XP
                </button>
              ))}
            </div>
          </fieldset>
        )}
        {teenMode && !task && <p className="text-sm text-muted">Tarefas que você propõe valem 10 XP. Seus pais podem ajustar depois.</p>}

        <div className="mt-2 flex flex-wrap gap-3">
          <button className="btn btn-gold flex-1" disabled={!valid} onClick={save} style={{ opacity: valid ? 1 : 0.5 }}>
            Salvar
          </button>
          {canDelete && (
            <button
              className="btn btn-ghost"
              onClick={async () => {
                await deleteTask(task!.id)
                toast('Tarefa removida da semana.')
                onClose()
              }}
            >
              Remover da semana
            </button>
          )}
        </div>
      </div>
    </Modal>
  )
}
