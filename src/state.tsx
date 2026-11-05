import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, DEFAULT_SETTINGS } from './db/db'
import type {
  AchievementUnlock, Completion, Member, Mission, Redemption, Reward, RoutineBlock, Settings, Task, Thanks,
} from './db/types'
import { ledger, type XpEvent } from './domain/economy'
import { ensureMission } from './db/actions'
import { go } from './router'
import { today, weekKey } from './lib/date'
import { setSpeechEnabled, stopSpeaking } from './lib/speech'
import { setSoundEnabled } from './lib/sound'
import { setVibrationEnabled } from './lib/haptics'

export interface Family {
  members: Member[]
  routines: RoutineBlock[]
  tasks: Task[]
  completions: Completion[]
  rewards: Reward[]
  redemptions: Redemption[]
  thanks: Thanks[]
  unlocks: AchievementUnlock[]
  missions: Mission[]
  settings: Settings
  events: XpEvent[]
  byId: Map<string, Member>
}

const FamilyCtx = createContext<Family | null>(null)

export function useFamily(): Family {
  const f = useContext(FamilyCtx)
  if (!f) throw new Error('useFamily fora do FamilyProvider')
  return f
}

export function FamilyProvider({ children, fallback }: { children: ReactNode; fallback: ReactNode }) {
  const data = useLiveQuery(async () => {
    const [members, routines, tasks, completions, rewards, redemptions, thanks, unlocks, missions, settings] =
      await Promise.all([
        db.members.orderBy('order').toArray(), db.routines.toArray(), db.tasks.toArray(), db.completions.toArray(),
        db.rewards.toArray(), db.redemptions.toArray(), db.thanks.toArray(), db.unlocks.toArray(),
        db.missions.toArray(), db.settings.get('app'),
      ])
    return { members, routines, tasks, completions, rewards, redemptions, thanks, unlocks, missions, settings: settings ?? DEFAULT_SETTINGS }
  })

  const family = useMemo<Family | null>(() => {
    if (!data) return null
    return {
      ...data,
      events: ledger({ completions: data.completions, thanks: data.thanks }),
      byId: new Map(data.members.map((m) => [m.id, m])),
    }
  }, [data])

  // Preferências globais de som, vibração.
  useEffect(() => {
    if (!family) return
    setSoundEnabled(family.settings.sounds)
    setVibrationEnabled(family.settings.vibration)
  }, [family?.settings.sounds, family?.settings.vibration]) // eslint-disable-line react-hooks/exhaustive-deps

  // Tema: claro, noite ou automático (noite das 19h às 6h). A impressão força o claro.
  const theme = family?.settings.theme ?? 'claro'
  useEffect(() => {
    const apply = () => {
      const h = new Date().getHours()
      const night = theme === 'noite' || (theme === 'auto' && (h >= 19 || h < 6))
      const root = document.documentElement
      if (root.dataset.print) root.dataset.theme = 'claro'
      else root.dataset.theme = night ? 'noite' : 'claro'
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', night ? '#121534' : '#1c1f3a')
    }
    apply()
    const t = window.setInterval(apply, 60000)
    window.addEventListener('hashchange', apply)
    return () => {
      window.clearInterval(t)
      window.removeEventListener('hashchange', apply)
    }
  }, [theme])

  // A missão da semana nasce na primeira abertura da semana.
  const wk = weekKey(today())
  const hasMission = family?.missions.some((m) => m.weekKey === wk)
  useEffect(() => {
    if (family?.settings.onboardingDone && !hasMission) void ensureMission()
  }, [family?.settings.onboardingDone, hasMission])

  if (!family) return <>{fallback}</>
  return <FamilyCtx.Provider value={family}>{children}</FamilyCtx.Provider>
}

// ---------- Sessão: quem está usando o aparelho agora ----------

interface Toast {
  id: number
  text: string
  action?: { label: string; run: () => void }
}

export interface Celebration {
  emoji: string
  title: string
  text?: string
  speak?: string
  heroId?: string
  /** Cena da missão (celebração de estágio coletivo). */
  scene?: { missionId: string; stage: number }
  /** Medalha de conquista desenhada. */
  achievementId?: string
}

interface Session {
  currentId: string | null
  setCurrent: (id: string | null) => void
  adultId: string | null // adulto com o modo pais destravado
  unlock: (adultId: string) => void
  lock: () => void
  pinRequest: PinRequest | null
  askPin: (req: PinRequest) => void
  closePin: () => void
  toasts: Toast[]
  toast: (text: string, action?: Toast['action']) => void
  dismissToast: (id: number) => void
  celebration: Celebration | null
  celebrate: (c: Celebration | null) => void
}

export interface PinRequest {
  adultId?: string // se ausente, a pessoa escolhe qual adulto é
  then: (adultId: string) => void
}

const SessionCtx = createContext<Session | null>(null)

export function useSession(): Session {
  const s = useContext(SessionCtx)
  if (!s) throw new Error('useSession fora do SessionProvider')
  return s
}

const CURRENT_KEY = 'reino:perfil'
const IDLE_HOME_MS = 3 * 60 * 1000
const IDLE_LOCK_MS = 5 * 60 * 1000

function readCurrent(): string | null {
  try {
    return localStorage.getItem(CURRENT_KEY)
  } catch {
    return null
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const family = useFamily()
  const [currentId, setCurrentId] = useState<string | null>(readCurrent)
  const [adultId, setAdultId] = useState<string | null>(null)
  const [pinRequest, setPinRequest] = useState<PinRequest | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [celebration, setCelebration] = useState<Celebration | null>(null)
  const seq = useRef(0)

  const current = currentId ? family.byId.get(currentId) : undefined
  const validCurrent = current ? current.id : null

  const setCurrent = useCallback((id: string | null) => {
    setCurrentId(id)
    try {
      if (id) localStorage.setItem(CURRENT_KEY, id)
      else localStorage.removeItem(CURRENT_KEY)
    } catch {
      /* armazenamento indisponível */
    }
  }, [])

  // Sair do modo pais também sai das telas que são só de adulto (senão o PIN seria pedido de novo na hora).
  const lock = useCallback(() => {
    setAdultId(null)
    if (/^#\/(pais|heroi)/.test(location.hash)) go('/')
  }, [])
  const unlock = useCallback((id: string) => setAdultId(id), [])

  // Trocar para um perfil que não é o adulto destravado trava o modo pais.
  useEffect(() => {
    if (adultId && validCurrent && validCurrent !== adultId) setAdultId(null)
  }, [validCurrent, adultId])

  // Voz: só para quem tem a leitura ligada.
  useEffect(() => {
    setSpeechEnabled(current?.speech ?? true)
  }, [current?.speech])

  // Ociosidade: 3 min → volta ao Salão; 5 min → trava o modo pais. Esconder o app trava também.
  useEffect(() => {
    let last = Date.now()
    const touch = () => (last = Date.now())
    const timer = window.setInterval(() => {
      const idle = Date.now() - last
      if (idle > IDLE_LOCK_MS) setAdultId(null)
      if (idle > IDLE_HOME_MS && location.hash.replace(/^#\/?/, '') !== '' && !location.hash.includes('bem-vindo')) {
        stopSpeaking()
        go('/')
      }
    }, 15000)
    const onHide = () => document.visibilityState === 'hidden' && setAdultId(null)
    window.addEventListener('pointerdown', touch)
    window.addEventListener('keydown', touch)
    document.addEventListener('visibilitychange', onHide)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener('pointerdown', touch)
      window.removeEventListener('keydown', touch)
      document.removeEventListener('visibilitychange', onHide)
    }
  }, [])

  const dismissToast = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), [])
  const toast = useCallback(
    (text: string, action?: Toast['action']) => {
      const id = ++seq.current
      setToasts((t) => [...t.slice(-1), { id, text, action }])
      window.setTimeout(() => dismissToast(id), 5000)
    },
    [dismissToast],
  )

  // Avisos (com "Desfazer") e o pedido de PIN pertencem à tela onde nasceram.
  useEffect(() => {
    const clear = () => {
      setToasts([])
      setPinRequest(null)
    }
    window.addEventListener('hashchange', clear)
    return () => window.removeEventListener('hashchange', clear)
  }, [])

  const value: Session = {
    currentId: validCurrent, setCurrent, adultId, unlock, lock,
    pinRequest, askPin: setPinRequest, closePin: () => setPinRequest(null),
    toasts, toast, dismissToast, celebration, celebrate: setCelebration,
  }
  return <SessionCtx.Provider value={value}>{children}</SessionCtx.Provider>
}

/** Membro do perfil ativo. */
export function useCurrent(): Member | undefined {
  const { currentId } = useSession()
  const { byId } = useFamily()
  return currentId ? byId.get(currentId) : undefined
}

/** Abre o modo pais (pede PIN se necessário) e então executa `then`. */
export function useParentGate() {
  const s = useSession()
  return useCallback(
    (then: (adultId: string) => void, adultId?: string) => {
      if (s.adultId && (!adultId || adultId === s.adultId)) return then(s.adultId)
      s.askPin({ adultId, then })
    },
    [s],
  )
}
