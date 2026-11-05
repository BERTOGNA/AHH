import { useEffect, useRef } from 'react'
import { Icon } from '../components/Icon'
import { useFamily, useParentGate, useSession } from '../state'
import { go } from '../router'
import { Screen } from '../components/Screen'
import { Pending } from './parents/Pending'
import { Requests } from './parents/Requests'
import { TasksTab } from './parents/TasksTab'
import { RewardsTab } from './parents/RewardsTab'
import { HeroesTab } from './parents/HeroesTab'
import { SettingsTab } from './parents/SettingsTab'

const TABS = [
  { id: 'pendentes', label: 'Pendentes', icon: 'seal' },
  { id: 'bau', label: 'Pedidos do Baú', icon: 'chest' },
  { id: 'tarefas', label: 'Tarefas', icon: 'list' },
  { id: 'recompensas', label: 'Recompensas', icon: 'gift' },
  { id: 'herois', label: 'Heróis', icon: 'shield' },
  { id: 'ajustes', label: 'Ajustes', icon: 'gear' },
] as const

/** Painel dos Pais: validar, aprovar resgates e cuidar da configuração do reino. Exige PIN. */
export function Parents({ tab }: { tab?: string }) {
  const { adultId } = useSession()
  const gate = useParentGate()
  const { completions, redemptions } = useFamily()
  const asked = useRef(false)

  // Ao entrar direto na rota, pede o PIN uma vez.
  useEffect(() => {
    if (!adultId && !asked.current) {
      asked.current = true
      gate(() => {})
    }
  }, [adultId, gate])

  if (!adultId) {
    return (
      <Screen title="Painel dos Pais">
        <div className="card-gilded mx-auto max-w-md p-8 text-center">
          <div className="text-6xl" aria-hidden="true">🔒</div>
          <h2 className="title-display mt-3 text-xl font-bold">Esta área é dos adultos</h2>
          <p className="mt-2 text-muted">Aqui os pais validam tarefas, aprovam pedidos do Baú e ajustam a semana.</p>
          <button className="btn btn-primary mt-5 h-14 w-full text-lg" onClick={() => gate(() => {})}>
            Entrar com PIN
          </button>
        </div>
      </Screen>
    )
  }

  const current = TABS.find((t) => t.id === tab)?.id ?? 'pendentes'
  const badges: Record<string, number> = {
    pendentes: completions.filter((c) => c.status === 'done').length,
    bau: redemptions.filter((r) => r.status === 'requested').length,
  }

  return (
    <Screen title="Painel dos Pais" subtitle="Validar, aprovar e cuidar do reino.">
      <nav aria-label="Seções do painel" className="-mx-4 mb-5 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
          {TABS.map((t) => (
            <button
              key={t.id}
              className="chip h-12 whitespace-nowrap"
              aria-pressed={current === t.id}
              onClick={() => go(`/pais/${t.id}`)}
            >
              <Icon name={t.icon} size={18} />
              {t.label}
              {badges[t.id] ? (
                <span
                  className="ml-1 grid h-6 min-w-6 place-items-center rounded-full bg-gold px-1.5 text-sm font-bold text-ink tabular-nums"
                  aria-label={`${badges[t.id]} pendentes`}
                >
                  {badges[t.id]}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </nav>
      {current === 'pendentes' && <Pending adultId={adultId} />}
      {current === 'bau' && <Requests />}
      {current === 'tarefas' && <TasksTab />}
      {current === 'recompensas' && <RewardsTab />}
      {current === 'herois' && <HeroesTab />}
      {current === 'ajustes' && <SettingsTab />}
    </Screen>
  )
}
