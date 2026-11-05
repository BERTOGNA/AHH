import { useEffect, useRef, useState } from 'react'
import { InstallCard } from '../components/InstallCard'
import { useFamily, useSession } from '../state'
import { go } from '../router'
import { createFamily, seedDemo } from '../db/seed'
import { requestPersistence } from '../lib/persist'
import { MissionScene } from '../components/MissionScene'
import { Avatar } from '../components/Avatar'
import type { Member } from '../db/types'
import { importBackup, parseBackup, summarize } from '../db/backup'
import { defaultChores } from '../domain/week'
import { clearDraft, initialDraft, loadDraft, saveDraft, signature, toAnswers, type Draft } from './onboarding/draft'
import { StepChest, StepChores, StepHeroes, StepOccupation, StepPeople, StepTimes } from './onboarding/Steps'
import { StepPin, StepReview } from './onboarding/FinalSteps'

const STEPS = [
  { title: 'Quem mora neste reino?', hint: 'Nomes, idades e como as crianças chamam os adultos.' },
  { title: 'Escolham seus heróis', hint: 'Um rosto e uma classe para cada um. A classe é o papel na casa.' },
  { title: 'Que horas cada um acorda e dorme?', hint: 'Isso desenha a agenda da família.' },
  { title: 'Escola e trabalho', hint: 'Onde cada um passa o dia.' },
  { title: 'Quem cuida do quê na casa?', hint: 'Já deixamos uma sugestão marcada. Ajustem como quiserem.' },
  { title: 'Baú e missão', hint: 'Recompensas reais e a primeira meta da família.' },
  { title: 'PIN dos pais', hint: 'Para validar tarefas e mudar configurações.' },
  { title: 'Esta é a semana do reino', hint: 'Confiram e comecem a aventura.' },
]

/** Heróis de exemplo da abertura (só ilustração). */
const WELCOME_HEROES: Member[] = (
  [
    ['a', 'adult', 'a', 'tesoureiro', { skin: 'mel', hair: 'coque', hairColor: 'escuro', eyes: 'amendoados', mouth: 'sorriso', extras: ['oculos'] }],
    ['b', 'adult', 'o', 'alquimista', { skin: 'canela', hair: 'curto', hairColor: 'preto', eyes: 'felizes', mouth: 'risada', extras: ['barba'] }],
    ['c', 'teen', 'o', 'mago', { skin: 'pessego', hair: 'cacheado', hairColor: 'castanho', eyes: 'redondos', mouth: 'sorriso', extras: ['orelhas-elficas'] }],
    ['d', 'child', 'a', 'escudeiro', { skin: 'cacau', hair: 'crespo', hairColor: 'preto', eyes: 'redondos', mouth: 'risada', extras: [] }],
  ] as const
).map(([id, role, treatment, classId, look], i) => ({
  id, name: '', role, age: 0, treatment, classId, kingdomRole: '', slot: i as Member['slot'],
  avatar: { base: '', look: { ...look, extras: [...look.extras] }, equipped: {} }, speech: false, order: i, createdAt: 0,
}))

export function Welcome() {
  const { settings } = useFamily()
  const { setCurrent, toast } = useSession()
  const [draft, setDraft] = useState<Draft | null>(() => loadDraft())
  const [started, setStarted] = useState(false)
  const [pin, setPin] = useState<string | null>(null)
  const [busy, setBusy] = useState<false | 'wizard' | 'demo'>(false)
  const [finishing, setFinishing] = useState(false)
  const heading = useRef<HTMLHeadingElement>(null)

  // Só sai para o Salão quando o banco já confirmou a família (evita voltar para cá).
  useEffect(() => {
    if (finishing && settings.onboardingDone) {
      setFinishing(false)
      go('/')
    }
  }, [finishing, settings.onboardingDone])

  useEffect(() => {
    if (draft && started) saveDraft(draft)
  }, [draft, started])

  useEffect(() => {
    if (started) heading.current?.focus()
  }, [started, draft?.step])

  const set = (fn: (d: Draft) => Draft) => setDraft((d) => (d ? fn(d) : d))

  async function useDemo() {
    setBusy('demo')
    try {
      await seedDemo()
      clearDraft()
      setCurrent(null)
      await requestPersistence()
      setFinishing(true)
    } catch {
      toast('Não foi possível criar a família de exemplo. Tente de novo.')
      setBusy(false)
    }
  }

  /** Aparelho novo: restaura a família a partir de um backup exportado antes. */
  async function restore(file: File | undefined) {
    if (!file) return
    try {
      const b = parseBackup(await file.text())
      const sum = summarize(b)
      if (!window.confirm(`Restaurar ${sum.heroes} heróis e ${sum.tasks} tarefas (backup de ${sum.exportedAt})? Isto substitui o que houver neste aparelho.`)) return
      setBusy('demo')
      await importBackup(b)
      clearDraft()
      setCurrent(null)
      await requestPersistence()
      setFinishing(true)
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Não foi possível ler o backup.')
      setBusy(false)
    }
  }

  async function finish() {
    if (!draft || !pin) return
    setBusy('wizard')
    try {
      await createFamily(toAnswers(draft), pin)
      clearDraft()
      setCurrent(null)
      await requestPersistence()
      setFinishing(true)
    } catch {
      toast('Não foi possível salvar a família. Tente de novo.')
      setBusy(false)
    }
  }

  function goStep(step: number) {
    set((d) => {
      let next = { ...d, step }
      // Mudou quem é quem? Refaz as tarefas sugeridas antes de mostrar o passo 5.
      if (step === 5 && d.choresFor !== signature(d.members)) {
        next = { ...next, chores: defaultChores(d.members), choresFor: signature(d.members) }
      }
      return next
    })
    window.scrollTo({ top: 0 })
  }

  if (!started || !draft) {
    return (
      <main className="night-sky on-night flex min-h-dvh flex-col items-center justify-center gap-6 px-6 py-10 text-center">
        <div className="relative w-full max-w-xl">
          <div className="overflow-hidden rounded-[28px] shadow-[0_30px_80px_rgba(0,0,0,0.45)] ring-1 ring-gold-light/25">
            <MissionScene missionId="farol" stage={4} night className="block aspect-[16/9] w-full" />
          </div>
          <div className="absolute inset-x-0 -bottom-9 flex justify-center gap-2 sm:gap-4" aria-hidden="true">
            {WELCOME_HEROES.map((h) => <Avatar key={h.id} member={h} size={76} />)}
          </div>
        </div>
        <div className="mt-8">
          <h1 className="insignia bg-gradient-to-b from-[#FFF1C4] via-gold-light to-gold bg-clip-text text-[40px] leading-tight text-transparent sm:text-6xl">Reino da Família</h1>
          <p className="story mx-auto mt-3 max-w-md text-xl text-moon">A casa funciona porque cada um faz a sua parte.</p>
        </div>
        <p className="max-w-md text-[#e8dcc0]">
          Uma agenda da semana que também é uma aventura: pais e filhos são heróis do mesmo reino, e todo esforço aparece.
        </p>
        <div className="flex w-full max-w-sm flex-col gap-3">
          <button
            className="btn btn-primary h-16 text-xl"
            disabled={Boolean(busy)}
            onClick={() => {
              if (!draft) setDraft(initialDraft())
              setStarted(true)
            }}
          >
            {draft ? `Continuar (passo ${draft.step} de 8)` : 'Começar'}
          </button>
          {draft && (
            <button
              className="btn h-12 border-2 border-[#e8dcc0]/50 text-bg"
              disabled={Boolean(busy)}
              onClick={() => {
                clearDraft()
                setDraft(initialDraft())
                setPin(null)
                setStarted(true)
              }}
            >
              Recomeçar do início
            </button>
          )}
          <button className="btn h-14 border-2 border-[#e8dcc0]/50 text-bg hover:bg-white/10" disabled={Boolean(busy)} onClick={useDemo}>
            {busy === 'demo' ? 'Preparando o reino…' : 'Usar família de exemplo'}
          </button>
          <label className="btn h-12 cursor-pointer text-[#e8dcc0] underline-offset-4 hover:underline">
            Restaurar um backup
            <input type="file" accept="application/json,.json" className="sr-only" disabled={Boolean(busy)} onChange={(e) => restore(e.target.files?.[0])} />
          </label>
        </div>
        <div className="w-full max-w-md"><InstallCard night /></div>
        <p className="max-w-sm text-sm text-[#cdbfa3]">Tudo fica guardado só neste aparelho. Nada é enviado para a internet.</p>
      </main>
    )
  }

  const step = draft.step
  const info = STEPS[step - 1]
  const canNext = step !== 7 || Boolean(pin)

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-4 pb-32 pt-5 sm:px-6">
      <div className="mb-4 flex items-center gap-2" aria-hidden="true">
        {STEPS.map((_, i) => (
          <span key={i} className="flex flex-1 items-center gap-2">
            <span className={`text-lg leading-none ${i < step ? 'text-gold-deep' : 'text-line'}`}>✦</span>
            {i < STEPS.length - 1 && <span className={`h-0.5 flex-1 rounded ${i < step - 1 ? 'bg-gold' : 'bg-line'}`} />}
          </span>
        ))}
      </div>
      <p className="text-sm font-semibold text-muted" aria-live="polite">
        Passo {step} de 8
      </p>
      <h1 ref={heading} tabIndex={-1} className="title-display mb-1 text-2xl font-bold outline-none sm:text-3xl">
        {info.title}
      </h1>
      <p className="mb-5 text-muted">{info.hint}</p>

      {step === 1 && <StepPeople d={draft} set={set} />}
      {step === 2 && <StepHeroes d={draft} set={set} />}
      {step === 3 && <StepTimes d={draft} set={set} />}
      {step === 4 && <StepOccupation d={draft} set={set} />}
      {step === 5 && <StepChores d={draft} set={set} />}
      {step === 6 && <StepChest d={draft} set={set} />}
      {step === 7 && <StepPin pin={pin} onPin={setPin} />}
      {step === 8 && <StepReview d={draft} onAdjust={() => goStep(5)} />}

      <nav aria-label="Passos do assistente" className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        <div className="mx-auto flex max-w-3xl gap-3 px-4 py-3 sm:px-6">
          <button className="btn btn-ghost h-14 min-w-28" onClick={() => (step === 1 ? setStarted(false) : goStep(step - 1))}>
            ← Voltar
          </button>
          {step < 8 ? (
            <button className="btn btn-primary h-14 flex-1 text-lg" disabled={!canNext} style={{ opacity: canNext ? 1 : 0.5 }} onClick={() => goStep(step + 1)}>
              {step === 7 && !pin ? 'Defina o PIN para seguir' : 'Próximo →'}
            </button>
          ) : (
            <button className="btn btn-primary h-14 flex-1 text-lg" disabled={!pin || Boolean(busy)} onClick={() => (pin ? finish() : goStep(7))}>
              {busy === 'wizard' ? 'Erguendo o reino…' : pin ? 'Começar a aventura ✦' : 'Falta o PIN (passo 7)'}
            </button>
          )}
        </div>
      </nav>
    </main>
  )
}
