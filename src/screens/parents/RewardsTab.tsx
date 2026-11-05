import { useState } from 'react'
import { TaskArt } from '../../components/taskart/TaskArt'
import type { Reward } from '../../db/types'
import { useFamily, useSession } from '../../state'
import { saveReward } from '../../db/actions'
import { Empty, Section } from '../../components/Screen'
import { Modal } from '../../components/Modal'

const REWARD_EMOJIS = ['🍕', '🍨', '🍦', '🎬', '🍿', '📺', '🎮', '📖', '🌳', '🚲', '🎲', '🧑‍🤝‍🧑', '🛝', '🏊', '🎨', '🧸', '🎁', '⭐', '🌙', '🍰']

/** Cadastro das recompensas reais do Baú. */
export function RewardsTab() {
  const { rewards } = useFamily()
  const [editing, setEditing] = useState<Reward | 'new' | null>(null)
  const sorted = [...rewards].sort((a, b) => Number(b.active) - Number(a.active) || a.cost - b.cost)

  return (
    <Section
      title="Recompensas do Baú"
      aside={
        <button className="btn btn-primary" onClick={() => setEditing('new')}>
          ✚ Nova recompensa
        </button>
      }
    >
      <p className="mb-3 text-sm text-muted">
        Referência: uma criança junta cerca de 50 🪙 por semana. Pequenas: 10–20 · médias: 30–60 · grandes: 100–200.
      </p>
      {sorted.length === 0 ? (
        <Empty>Nenhuma recompensa cadastrada ainda.</Empty>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((r) => (
            <li key={r.id}>
              <button
                className={`card flex w-full items-center gap-3 p-3 text-left hover:bg-white ${r.active ? '' : 'opacity-60'}`}
                onClick={() => setEditing(r)}
                aria-label={`Editar ${r.title}`}
              >
                <TaskArt emoji={r.emoji} size={44} />
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{r.title}</span>
                  <span className="block text-sm text-muted">{r.active ? 'No Baú' : 'Guardada (fora do Baú)'}</span>
                </span>
                <span className="shrink-0 font-bold text-gold-deep tabular-nums">{r.cost} 🪙</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {editing && <RewardEditor reward={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} />}
    </Section>
  )
}

function RewardEditor({ reward, onClose }: { reward?: Reward; onClose: () => void }) {
  const { toast } = useSession()
  const [title, setTitle] = useState(reward?.title ?? '')
  const [emoji, setEmoji] = useState(reward?.emoji ?? '🎁')
  const [cost, setCost] = useState(reward?.cost ?? 30)
  const [active, setActive] = useState(reward?.active ?? true)
  const step = (d: number) => setCost((c) => Math.min(300, Math.max(5, c + d)))

  return (
    <Modal title={reward ? 'Editar recompensa' : 'Nova recompensa'} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <label>
          <span className="mb-1 block text-sm font-semibold">Nome</span>
          <input className="field" maxLength={40} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Escolher o filme da noite" />
        </label>
        <fieldset>
          <legend className="mb-1 text-sm font-semibold">Ícone</legend>
          <div className="grid grid-cols-10 gap-1 rounded-2xl border border-line bg-white p-2">
            {REWARD_EMOJIS.map((e) => (
              <button key={e} aria-pressed={e === emoji} aria-label={e} className={`h-11 rounded-xl grid place-items-center ${e === emoji ? 'bg-wait ring-2 ring-gold' : ''}`} onClick={() => setEmoji(e)}>
                <TaskArt emoji={e} size={32} />
              </button>
            ))}
          </div>
        </fieldset>
        <div>
          <span className="mb-1 block text-sm font-semibold" id="custo-label">Custo em moedas</span>
          <div className="flex items-center gap-2" role="group" aria-labelledby="custo-label">
            <button className="btn btn-ghost h-12 w-12 p-0 text-xl" aria-label="Menos 5 moedas" onClick={() => step(-5)}>−</button>
            <span className="min-w-20 text-center text-xl font-bold tabular-nums">{cost} 🪙</span>
            <button className="btn btn-ghost h-12 w-12 p-0 text-xl" aria-label="Mais 5 moedas" onClick={() => step(5)}>+</button>
          </div>
        </div>
        <label className="flex min-h-12 items-center gap-3">
          <input type="checkbox" className="h-6 w-6 accent-[#8a5b00]" checked={active} onChange={(e) => setActive(e.target.checked)} />
          <span className="font-semibold">Disponível no Baú</span>
        </label>
        <button
          className="btn btn-primary h-14"
          disabled={!title.trim()}
          style={{ opacity: title.trim() ? 1 : 0.5 }}
          onClick={async () => {
            await saveReward({ ...reward, title: title.trim(), emoji, cost, active })
            toast(reward ? 'Recompensa atualizada.' : 'Recompensa criada.')
            onClose()
          }}
        >
          Salvar
        </button>
      </div>
    </Modal>
  )
}
