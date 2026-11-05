import { useState } from 'react'
import type { Task } from '../../db/types'
import { useFamily, useSession } from '../../state'
import { changeMission, updateMission } from '../../db/actions'
import { Avatar } from '../../components/Avatar'
import { Empty, Section } from '../../components/Screen'
import { TaskEditor } from '../../components/TaskEditor'
import { Progress } from '../../components/Progress'
import { MISSIONS, missionById, stageOf } from '../../data/missions'
import { weekXp } from '../../domain/economy'
import { WEEKDAY_SHORT, formatTime, today, weekKey } from '../../lib/date'

type Filter = 'todos' | 'lar' | string

/** Lista de tarefas recorrentes por herói, com criação/edição, e a missão da semana. */
export function TasksTab() {
  const { members, tasks, byId, missions } = useFamily()
  const current = missions.find((m) => m.weekKey === weekKey(today()))
  const missionKey = current ? `${current.weekKey}|${current.templateId}|${current.reward}` : 'none'
  const [filter, setFilter] = useState<Filter>('todos')
  const [editing, setEditing] = useState<Task | 'new' | null>(null)

  const list = tasks
    .filter((t) => t.active)
    .filter((t) => (filter === 'todos' ? true : filter === 'lar' ? t.kind === 'household' : t.assigneeIds.includes(filter)))
    .sort((a, b) => (a.time ?? '99').localeCompare(b.time ?? '99') || a.title.localeCompare(b.title))
  const proposed = list.filter((t) => t.proposedBy)

  return (
    <div>
      <MissionSettings key={missionKey} />

      <Section
        title="Tarefas da semana"
        aside={
          <button className="btn btn-gold" onClick={() => setEditing('new')}>
            ✚ Nova tarefa
          </button>
        }
      >
        <div className="-mx-4 mb-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <div className="flex w-max gap-2 sm:w-auto sm:flex-wrap" role="group" aria-label="Filtrar por herói">
            <button className="chip" aria-pressed={filter === 'todos'} onClick={() => setFilter('todos')}>
              Todos
            </button>
            {members.map((m) => (
              <button key={m.id} className="chip pl-1" aria-pressed={filter === m.id} onClick={() => setFilter(m.id)}>
                <Avatar member={m} size={36} /> {m.name}
              </button>
            ))}
            <button className="chip" aria-pressed={filter === 'lar'} onClick={() => setFilter('lar')}>
              🏠 Lar
            </button>
          </div>
        </div>

        {proposed.length > 0 && filter === 'todos' && (
          <p className="mb-3 rounded-xl bg-wait px-4 py-3 text-sm">
            ✎ {proposed.length === 1 ? 'Há 1 tarefa proposta' : `Há ${proposed.length} tarefas propostas`} pelos filhos. Ajustem dia ou valor se quiserem.
          </p>
        )}

        {list.length === 0 ? (
          <Empty>Nenhuma tarefa aqui ainda.</Empty>
        ) : (
          <ul className="grid gap-2 lg:grid-cols-2">
            {list.map((t) => (
              <li key={t.id}>
                <button
                  className="plaque flex w-full items-center gap-3 p-3 text-left hover:bg-white"
                  onClick={() => setEditing(t)}
                  aria-label={`Editar ${t.title}`}
                >
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-bg text-3xl" aria-hidden="true">
                    {t.emoji}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{t.title}</span>
                    <span className="block text-sm text-muted">
                      {t.kind === 'household'
                        ? '🏠 Qualquer um'
                        : t.assigneeIds.map((id) => byId.get(id)?.name ?? '—').join(' e ')}
                      {' · '}
                      {t.weekdays.length === 7 ? 'Todo dia' : t.weekdays.map((d) => WEEKDAY_SHORT[d]).join(' ')}
                      {t.time && ` · ${formatTime(t.time)}`}
                    </span>
                    {t.proposedBy && (
                      <span className="mt-1 inline-block rounded-full bg-wait px-2 text-xs font-semibold">
                        ✎ proposta por {byId.get(t.proposedBy)?.name}
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 font-bold text-gold tabular-nums">{t.xp} XP</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {editing && (
        <TaskEditor
          task={editing === 'new' ? undefined : editing}
          presetAssignee={editing === 'new' && filter !== 'todos' && filter !== 'lar' ? filter : undefined}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}

function MissionSettings() {
  const { missions, events } = useFamily()
  const { toast } = useSession()
  const wk = weekKey(today())
  const mission = missions.find((m) => m.weekKey === wk)
  const [reward, setReward] = useState(mission?.reward ?? '')
  if (!mission) return null
  const t = missionById(mission.templateId)
  const progress = weekXp(today(), events)
  const stage = t.stages[stageOf(progress, mission.goalXp)]

  const setGoal = (g: number) => updateMission(wk, { goalXp: Math.min(3000, Math.max(300, g)) })

  return (
    <Section title="Missão da semana">
      <div className="plaque plaque-star p-4">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-5xl" aria-hidden="true">{t.emoji}</span>
          <div className="min-w-0 flex-1 basis-48">
            <p className="font-semibold">{t.name}</p>
            <p className="story text-muted">{stage.scene} {stage.text}</p>
          </div>
        </div>
        <div className="mt-3">
          <Progress value={progress} max={mission.goalXp} label="Progresso da missão da família" height={12} />
          <p className="mt-1 text-sm text-muted tabular-nums">
            {progress} de {mission.goalXp} XP da família
          </p>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label>
            <span className="mb-1 block text-sm font-semibold">Trocar a missão desta semana</span>
            <select
              className="field"
              value={mission.templateId}
              onChange={async (e) => {
                await changeMission(wk, e.target.value)
                setReward(missionById(e.target.value).reward)
                toast('Missão da semana trocada.')
              }}
            >
              {MISSIONS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.emoji} {m.name}
                </option>
              ))}
            </select>
          </label>
          <div>
            <span className="mb-1 block text-sm font-semibold" id="meta-label">Meta (XP da família)</span>
            <div className="flex items-center gap-2" role="group" aria-labelledby="meta-label">
              <button className="btn btn-ghost h-12 w-12 p-0 text-xl" aria-label="Diminuir meta em 50" onClick={() => setGoal(mission.goalXp - 50)}>
                −
              </button>
              <span className="min-w-16 text-center text-lg font-bold tabular-nums">{mission.goalXp}</span>
              <button className="btn btn-ghost h-12 w-12 p-0 text-xl" aria-label="Aumentar meta em 50" onClick={() => setGoal(mission.goalXp + 50)}>
                +
              </button>
            </div>
          </div>
          <form
            className="md:col-span-2"
            onSubmit={async (e) => {
              e.preventDefault()
              if (!reward.trim()) return
              await updateMission(wk, { reward: reward.trim() })
              toast('Recompensa coletiva atualizada.')
            }}
          >
            <label className="mb-1 block text-sm font-semibold" htmlFor="reward-coletiva">Recompensa coletiva (ao chegar em 100%)</label>
            <div className="flex gap-2">
              <input id="reward-coletiva" className="field" maxLength={60} value={reward} onChange={(e) => setReward(e.target.value)} />
              <button className="btn btn-gold disabled:opacity-50" disabled={!reward.trim() || reward.trim() === mission.reward}>
                Salvar
              </button>
            </div>
          </form>
        </div>
      </div>
    </Section>
  )
}
