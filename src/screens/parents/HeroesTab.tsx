import { useState } from 'react'
import type { Member, Treatment } from '../../db/types'
import { useFamily, useSession } from '../../state'
import { updateMember } from '../../db/actions'
import { Avatar } from '../../components/Avatar'
import { AVATAR_BASES, CLASSES, classById } from '../../data/classes'

/** Editar nome, tratamento, classe, papel no reino, avatar e voz de cada herói. */
export function HeroesTab() {
  const { members } = useFamily()
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {members.map((m) => (
        <HeroCard key={`${m.id}|${m.name}|${m.kingdomRole}`} member={m} />
      ))}
    </div>
  )
}

const ROLE_LABEL = { adult: 'Adulto', teen: 'Pré-adolescente', child: 'Criança' }

function HeroCard({ member }: { member: Member }) {
  const { toast } = useSession()
  const [name, setName] = useState(member.name)
  const [kingdomRole, setKingdomRole] = useState(member.kingdomRole)
  const [pickBase, setPickBase] = useState(false)
  const save = (patch: Partial<Member>) => updateMember(member.id, patch)

  return (
    <section className="plaque p-4" aria-label={`Herói ${member.name}`}>
      <div className="mb-4 flex items-center gap-4">
        <button onClick={() => setPickBase((v) => !v)} aria-label={`Trocar avatar de ${member.name}`} aria-expanded={pickBase} className="rounded-full">
          <Avatar member={member} size={72} />
        </button>
        <div className="min-w-0 flex-1">
          <p className="title-display text-lg font-bold">{member.name}</p>
          <p className="text-sm text-muted">
            {ROLE_LABEL[member.role]} · {member.age} anos · {classById(member.classId).name[member.treatment]}
          </p>
        </div>
      </div>
      {pickBase && (
        <div className="mb-4 grid grid-cols-8 gap-1 rounded-2xl border border-line bg-white p-2" role="group" aria-label="Avatar">
          {AVATAR_BASES.map((b) => (
            <button
              key={b}
              aria-pressed={member.avatar.base === b}
              aria-label={b}
              className={`h-12 rounded-xl text-3xl ${member.avatar.base === b ? 'bg-wait ring-2 ring-gold' : ''}`}
              onClick={() => save({ avatar: { ...member.avatar, base: b } })}
            >
              {b}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <form
          className="flex items-end gap-2"
          onSubmit={async (e) => {
            e.preventDefault()
            if (!name.trim()) return
            await save({ name: name.trim() })
            toast('Nome atualizado.')
          }}
        >
          <label className="flex-1">
            <span className="mb-1 block text-sm font-semibold">Nome</span>
            <input className="field" maxLength={20} value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <button className="btn btn-ghost disabled:opacity-50" disabled={!name.trim() || name.trim() === member.name}>Salvar</button>
        </form>

        <fieldset>
          <legend className="mb-1 text-sm font-semibold">Tratamento</legend>
          <div className="flex gap-2">
            {(['o', 'a'] as Treatment[]).map((t) => (
              <button key={t} className="chip" aria-pressed={member.treatment === t} onClick={() => save({ treatment: t })}>
                {t === 'o' ? 'Ele' : 'Ela'}
              </button>
            ))}
          </div>
        </fieldset>

        <label>
          <span className="mb-1 block text-sm font-semibold">Classe</span>
          <select
            className="field"
            value={member.classId}
            onChange={(e) => save({ classId: e.target.value, kingdomRole: classById(e.target.value).role }).then(() => setKingdomRole(classById(e.target.value).role))}
          >
            {CLASSES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.emoji} {c.name[member.treatment]}
              </option>
            ))}
          </select>
        </label>

        <form
          className="flex items-end gap-2"
          onSubmit={async (e) => {
            e.preventDefault()
            await save({ kingdomRole: kingdomRole.trim() })
            toast('Papel no reino atualizado.')
          }}
        >
          <label className="flex-1">
            <span className="mb-1 block text-sm font-semibold">Papel no reino</span>
            <input className="field" maxLength={60} value={kingdomRole} onChange={(e) => setKingdomRole(e.target.value)} placeholder="Ex.: Cuida das contas e da saúde da família" />
          </label>
          <button className="btn btn-ghost disabled:opacity-50" disabled={kingdomRole.trim() === member.kingdomRole}>Salvar</button>
        </form>

        <label className="flex min-h-12 items-center gap-3">
          <input type="checkbox" className="h-6 w-6 accent-[#8a5b00]" checked={member.speech} onChange={(e) => save({ speech: e.target.checked })} />
          <span className="font-semibold">Leitura em voz alta 🔊</span>
        </label>
      </div>
    </section>
  )
}
