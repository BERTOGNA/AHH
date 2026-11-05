// Baú de Recompensas: trocar moedas por tesouros reais. Trocar nunca reduz XP nem nível.
import { TaskArt } from '../components/taskart/TaskArt'
import { useState } from 'react'
import type { Member, Reward } from '../db/types'
import { useCurrent, useFamily, useParentGate, useSession } from '../state'
import { coinBalance, coinsEarned, weekXp } from '../domain/economy'
import { requestReward } from '../db/actions'
import { Screen, Section, Empty } from '../components/Screen'
import { Progress } from '../components/Progress'
import { Modal } from '../components/Modal'
import { Sparks } from '../components/Sparks'
import { Icon } from '../components/Icon'
import { CoinIcon, GoldStar, WaxSeal } from '../components/Seal'
import { go } from '../router'
import { today, weekKey } from '../lib/date'
import { speak } from '../lib/speech'
import { play } from '../lib/sound'

export function Chest() {
  const f = useFamily()
  const me = useCurrent()
  const gate = useParentGate()
  const mission = f.missions.find((m) => m.weekKey === weekKey(today()))
  const missionDone = mission ? weekXp(today(), f.events) >= mission.goalXp : false
  const rewards = f.rewards.filter((r) => r.active && (!r.forIds?.length || (me && r.forIds.includes(me.id)))).sort((a, b) => a.cost - b.cost)

  if (!me) {
    return (
      <Screen title="Baú de Recompensas">
        <Empty>Escolha o seu herói no Salão para abrir o seu baú.</Empty>
        <button className="btn btn-primary mt-4" onClick={() => go('/')}>Ir ao Salão</button>
      </Screen>
    )
  }

  const adultNoChest = me.role === 'adult' && !f.settings.adultChest
  const pendingRequests = f.redemptions.filter((r) => r.status === 'requested').length

  return (
    <Screen title="Baú de Recompensas">
      {mission && (
        <section className="night-sky on-night relative mb-6 flex items-center gap-4 overflow-hidden rounded-[24px] p-5 shadow-[var(--shadow-e3)]">
          <span className={`grid h-16 w-16 shrink-0 place-items-center rounded-2xl ring-1 ring-gold-light/40 ${missionDone ? 'bg-gold/25 text-gold-light' : 'bg-white/5 text-moon'}`} aria-hidden="true">
            <Icon name={missionDone ? 'gift' : 'chest'} size={36} />
          </span>
          <div className="flex-1">
            <p className="eyebrow">Tesouro da Família</p>
            <p className="title-display text-xl text-ivory">{mission.reward}</p>
            <p className="text-sm text-moon">
              {mission.delivered ? 'Já aproveitado. Que semana!' : missionDone ? 'Desbloqueado pela missão da família!' : 'Abre quando a missão da família for concluída — por todos juntos.'}
            </p>
          </div>
          {missionDone && !mission.delivered && <Sparks count={8} />}
        </section>
      )}

      {adultNoChest ? (
        <>
          <Empty>O Baú é das crianças. Os adultos ganham XP e nível; o baú dos adultos pode ser ligado nos Ajustes.</Empty>
          <button className="btn btn-primary mt-4" onClick={() => gate(() => go('/pais/bau'))}>
            Ver pedidos do Baú{pendingRequests ? ` (${pendingRequests})` : ''}
          </button>
        </>
      ) : me.role === 'child' ? (
        <KidChest me={me} rewards={rewards} />
      ) : (
        <GrownChest me={me} rewards={rewards} />
      )}
    </Screen>
  )
}

function useWallet(me: Member) {
  const f = useFamily()
  const balance = coinBalance(me.id, f.events, f.redemptions)
  const mine = f.redemptions.filter((r) => r.memberId === me.id).sort((a, b) => b.requestedAt - a.requestedAt)
  return { balance, earned: coinsEarned(me.id, f.events), mine }
}

function GrownChest({ me, rewards }: { me: Member; rewards: Reward[] }) {
  const { balance, earned, mine } = useWallet(me)
  const [confirm, setConfirm] = useState<Reward | null>(null)
  return (
    <>
      <section className="card-gilded mb-6 flex flex-wrap items-center gap-6 rounded-[24px] p-5">
        <div>
          <p className="text-sm text-muted">Moedas ganhas desde sempre</p>
          <p className="title-display flex items-center gap-2 text-4xl tabular-nums"><CoinIcon size={36} /> {earned}</p>
        </div>
        <div>
          <p className="text-sm text-muted">Na bolsa</p>
          <p className="text-xl font-bold tabular-nums">{balance}</p>
        </div>
        <p className="min-w-[200px] flex-1 text-sm text-muted">Trocar moedas por um tesouro não muda o seu nível nem o seu XP.</p>
      </section>
      <Section title="Tesouros">
        {rewards.length ? (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {rewards.map((r) => (
              <li key={r.id} className="card flex items-center gap-4 p-4">
                <TaskArt emoji={r.emoji} size={44} className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-bg ring-1 ring-line" />
                <div className="flex-1">
                  <p className="font-semibold">{r.title}</p>
                  <p className="flex items-center gap-1 text-sm font-semibold tabular-nums text-gold-deep"><CoinIcon size={16} /> {r.cost}</p>
                </div>
                <button className="btn btn-primary" disabled={balance < r.cost} style={{ opacity: balance < r.cost ? 0.45 : 1 }} onClick={() => setConfirm(r)}>
                  Trocar
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <Empty>Os pais ainda não colocaram tesouros no baú.</Empty>
        )}
      </Section>
      <MyRequests list={mine} />
      {confirm && <ConfirmTrade me={me} reward={confirm} onClose={() => setConfirm(null)} />}
    </>
  )
}

function KidChest({ me, rewards }: { me: Member; rewards: Reward[] }) {
  const { balance, mine } = useWallet(me)
  const [confirm, setConfirm] = useState<Reward | null>(null)
  return (
    <>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {rewards.map((r) => {
          const ready = balance >= r.cost
          const almost = !ready && balance >= r.cost * 0.6
          return (
            <li key={r.id}>
              <button
                className={`relative flex min-h-[240px] w-full flex-col items-center justify-center gap-3 rounded-[28px] p-5 shadow-[var(--shadow-e2)] ${ready ? 'card-gilded' : 'card'}`}
                aria-label={`${r.title}. ${ready ? 'Você já pode pedir!' : almost ? 'Falta pouco!' : 'Continue juntando moedas.'}`}
                onClick={() => {
                  speak(`${r.title}. ${ready ? 'Você já pode pedir!' : almost ? 'Falta pouco!' : 'Continue juntando moedas.'}`)
                  if (ready) setConfirm(r)
                }}
              >
                <TaskArt emoji={r.emoji} size={100} />
                <span className="story text-center text-[22px] font-bold leading-tight">{r.title}</span>
                {/* Pote de moedas enchendo, sem números */}
                <span className="flex w-full items-center gap-2">
                  <CoinIcon size={32} />
                  <Progress value={balance} max={r.cost} label="Moedas juntadas" height={18} />
                  {ready ? <GoldStar size={36} glow={false} /> : <span className="w-9" />}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
      {!rewards.length && <Empty>O baú está esperando tesouros.</Empty>}
      <MyRequests list={mine} kid />
      {confirm && <ConfirmTrade me={me} reward={confirm} onClose={() => setConfirm(null)} />}
    </>
  )
}

function ConfirmTrade({ me, reward, onClose }: { me: Member; reward: Reward; onClose: () => void }) {
  const { toast } = useSession()
  const f = useFamily()
  const kid = me.role === 'child'
  const firstTime = !f.redemptions.some((r) => r.memberId === me.id)
  const [sent, setSent] = useState(false)
  async function trade() {
    const ok = await requestReward(me.id, reward)
    if (!ok) return toast('Ainda não há moedas suficientes.')
    play('validated')
    setSent(true)
    speak(kid ? 'Pedido enviado! Seus pais vão ver.' : '')
    setTimeout(onClose, kid ? 2600 : 1800)
  }
  return (
    <Modal title={kid ? 'Pedir este tesouro?' : 'Trocar por este tesouro?'} onClose={onClose}>
      <div className="relative flex flex-col items-center gap-3 text-center">
        <span className={sent ? 'animate-pop' : ''}><TaskArt emoji={sent ? '🎁' : reward.emoji} size={120} /></span>
        {sent && <Sparks count={12} />}
        <p className="story text-2xl font-bold">{sent ? 'Pedido enviado! Seus pais vão ver.' : reward.title}</p>
        {!sent && !kid && <p className="flex items-center gap-1 text-muted">Você troca <CoinIcon size={18} /> {reward.cost} por este tesouro.</p>}
        {!sent && firstTime && !kid && <p className="text-sm text-muted">Seu nível continua o mesmo: você só troca moedas por um tesouro.</p>}
        {!sent && (
          <div className="mt-2 flex gap-3">
            <button className="btn btn-primary h-16 min-w-40 text-xl" onClick={trade}>{kid ? <><Icon name="gift" size={26} /> Pedir!</> : 'Trocar por este tesouro'}</button>
            <button className="btn btn-ghost h-16 min-w-16" onClick={onClose} aria-label="Agora não">{kid ? <Icon name="undo" size={30} strokeWidth={2.25} /> : 'Agora não'}</button>
          </div>
        )}
      </div>
    </Modal>
  )
}

function MyRequests({ list, kid }: { list: ReturnType<typeof useWallet>['mine']; kid?: boolean }) {
  if (!list.length) return null
  const label = { requested: 'Pedido enviado! Seus pais vão ver.', approved: 'Aprovado! Aproveite!', delivered: 'Tesouro conquistado!', returned: 'Guardado para outra hora — as moedas voltaram.' }
  const icon = {
    requested: <WaxSeal size={34} />,
    approved: <GoldStar size={34} glow={false} />,
    delivered: <Icon name="trophy" size={28} className="text-gold-deep" />,
    returned: <CoinIcon size={28} />,
  }
  return (
    <Section title={kid ? 'Meus pedidos' : 'Meus tesouros'}>
      <ul className="card divide-y divide-line/70 overflow-hidden">
        {list.slice(0, 8).map((r) => (
          <li key={r.id} className="flex min-h-14 items-center gap-3 px-3 py-2">
            <TaskArt emoji={r.emoji} size={36} />
            <span className="flex-1 font-semibold">{r.title}</span>
            <span className="grid w-9 place-items-center" aria-hidden="true">{icon[r.status]}</span>
            <span className={kid ? 'sr-only' : 'text-sm text-muted'}>{label[r.status]}</span>
          </li>
        ))}
      </ul>
    </Section>
  )
}
