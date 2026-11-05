import { useFamily, useSession } from '../../state'
import { decideRedemption, updateMission } from '../../db/actions'
import { Avatar } from '../../components/Avatar'
import { Empty, Section } from '../../components/Screen'
import { missionById } from '../../data/missions'
import { weekXp } from '../../domain/economy'
import { today, weekKey } from '../../lib/date'
import { play } from '../../lib/sound'
import { ago } from './time'

/** Pedidos do Baú: aprovar, deixar para outra hora (moedas voltam) e marcar como entregue. */
export function Requests() {
  const { redemptions, byId, missions, events } = useFamily()
  const { toast } = useSession()
  const requested = redemptions.filter((r) => r.status === 'requested').sort((a, b) => a.requestedAt - b.requestedAt)
  const approved = redemptions.filter((r) => r.status === 'approved').sort((a, b) => (a.decidedAt ?? 0) - (b.decidedAt ?? 0))

  const wk = weekKey(today())
  const mission = missions.find((m) => m.weekKey === wk)
  const missionDone = mission && weekXp(today(), events) >= mission.goalXp

  return (
    <div>
      {missionDone && mission && (
        <Section title="Tesouro da Família">
          <div className="plaque plaque-star flex flex-wrap items-center gap-4 p-4">
            <span className="text-5xl" aria-hidden="true">{missionById(mission.templateId).emoji}</span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">Missão cumprida: {missionById(mission.templateId).name}</p>
              <p className="text-muted">Recompensa coletiva: {mission.reward}</p>
            </div>
            {mission.delivered ? (
              <span className="font-semibold text-leaf">✓ Entregue</span>
            ) : (
              <button
                className="btn btn-gold h-14"
                onClick={async () => {
                  await updateMission(wk, { delivered: true })
                  toast('Tesouro da Família entregue. Aproveitem juntos!')
                }}
              >
                Marcar como entregue
              </button>
            )}
          </div>
        </Section>
      )}

      <Section title="Pedidos novos">
        {requested.length === 0 ? (
          <Empty>Nenhum pedido no Baú agora.</Empty>
        ) : (
          <>
            <p className="mb-3 text-sm text-muted">"Agora não" guarda o pedido para outra hora: as moedas voltam inteiras para a bolsa.</p>
            <ul className="flex flex-col gap-3">
              {requested.map((r) => {
                const m = byId.get(r.memberId)
                return (
                  <li key={r.id} className="plaque flex flex-wrap items-center gap-3 p-4">
                    {m && <Avatar member={m} size={48} />}
                    <span className="text-4xl" aria-hidden="true">{r.emoji}</span>
                    <div className="min-w-0 flex-1 basis-40">
                      <p className="font-semibold">{r.title}</p>
                      <p className="text-sm text-muted">
                        {m?.name} pediu {ago(r.requestedAt)} · {r.cost} 🪙
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="btn btn-ghost h-14"
                        onClick={async () => {
                          await decideRedemption(r.id, 'returned')
                          toast('Guardado para outra hora. As moedas voltaram.')
                        }}
                      >
                        Agora não
                      </button>
                      <button
                        className="btn btn-gold h-14 min-w-[120px]"
                        onClick={async () => {
                          await decideRedemption(r.id, 'approved')
                          play('validated')
                          toast('Aprovado! Aproveite.')
                        }}
                      >
                        ✓ Aprovar
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </Section>

      <Section title="Aprovados, para entregar">
        {approved.length === 0 ? (
          <Empty>Nada para entregar.</Empty>
        ) : (
          <ul className="flex flex-col gap-3">
            {approved.map((r) => {
              const m = byId.get(r.memberId)
              return (
                <li key={r.id} className="plaque flex flex-wrap items-center gap-3 p-4">
                  {m && <Avatar member={m} size={40} />}
                  <span className="text-3xl" aria-hidden="true">{r.emoji}</span>
                  <p className="min-w-0 flex-1 font-semibold">
                    {r.title} <span className="font-normal text-muted">· para {m?.name}</span>
                  </p>
                  <button
                    className="btn btn-ghost h-12"
                    onClick={async () => {
                      await decideRedemption(r.id, 'delivered')
                      toast('Tesouro entregue.')
                    }}
                  >
                    Marcar como entregue
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </Section>
    </div>
  )
}
