import { useEffect, useRef, useState } from 'react'
import { InstallCard } from '../../components/InstallCard'
import type { ParentTitle, Settings } from '../../db/types'
import { useFamily, useSession } from '../../state'
import { resetAll, setPin, updateSettings } from '../../db/actions'
import { downloadBackup, exportBackup, importBackup, parseBackup, summarize, type Backup } from '../../db/backup'
import { isPersisted, requestPersistence } from '../../lib/persist'
import { Section } from '../../components/Screen'
import { Modal } from '../../components/Modal'
import { go } from '../../router'

const TITLES: { id: ParentTitle; label: string }[] = [
  { id: 'rei', label: '👑 Rei e Rainha' },
  { id: 'pais', label: '👪 Pai e Mãe' },
  { id: 'guardioes', label: '🛡️ Guardiões' },
]

/** Ajustes do reino, PIN, backup e recomeço. */
export function SettingsTab() {
  const { settings } = useFamily()
  return (
    <div className="grid gap-x-6 lg:grid-cols-2">
      <div>
        <KingdomSettings key={settings.kingdomName} settings={settings} />
        <PinSettings />
      </div>
      <div>
        <div className="mb-6"><InstallCard /></div>
        <BackupSettings />
        <ResetSettings demo={settings.demo} />
      </div>
    </div>
  )
}

function Toggle({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return (
    <label className="flex min-h-12 items-center gap-3">
      <input type="checkbox" className="h-6 w-6 shrink-0 accent-[#8a5b00]" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>
        <span className="block font-semibold">{label}</span>
        {hint && <span className="block text-sm text-muted">{hint}</span>}
      </span>
    </label>
  )
}

function KingdomSettings({ settings }: { settings: Settings }) {
  const { toast } = useSession()
  const [name, setName] = useState(settings.kingdomName)
  return (
    <Section title="O reino">
      <div className="card flex flex-col gap-4 p-4">
        <form
          className="flex items-end gap-2"
          onSubmit={async (e) => {
            e.preventDefault()
            if (!name.trim()) return
            await updateSettings({ kingdomName: name.trim() })
            toast('Nome do reino atualizado.')
          }}
        >
          <label className="flex-1">
            <span className="mb-1 block text-sm font-semibold">Nome do reino</span>
            <input className="field" maxLength={24} value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <button className="btn btn-ghost disabled:opacity-50" disabled={!name.trim() || name.trim() === settings.kingdomName}>Salvar</button>
        </form>
        <fieldset>
          <legend className="mb-1 text-sm font-semibold">Como as crianças chamam os pais na validação</legend>
          <div className="flex flex-wrap gap-2">
            {TITLES.map((t) => (
              <button key={t.id} className="chip" aria-pressed={settings.parentTitle === t.id} onClick={() => updateSettings({ parentTitle: t.id })}>
                {t.label}
              </button>
            ))}
          </div>
        </fieldset>
        <Toggle label="Sons" checked={settings.sounds} onChange={(v) => updateSettings({ sounds: v })} />
        <Toggle label="Vibração" hint="Funciona em alguns celulares." checked={settings.vibration} onChange={(v) => updateSettings({ vibration: v })} />
        <Toggle
          label="Baú dos adultos"
          hint="Os pais também trocam moedas por recompensas; o outro adulto aprova."
          checked={settings.adultChest}
          onChange={(v) => updateSettings({ adultChest: v })}
        />
      </div>
    </Section>
  )
}

function PinSettings() {
  const { toast } = useSession()
  const [a, setA] = useState('')
  const [b, setB] = useState('')
  const ok = /^\d{4}$/.test(a) && a === b
  const clean = (v: string) => v.replace(/\D/g, '').slice(0, 4)
  return (
    <Section title="PIN dos pais">
      <form
        className="card flex flex-col gap-3 p-4"
        onSubmit={async (e) => {
          e.preventDefault()
          if (!ok) return
          await setPin(a)
          setA('')
          setB('')
          toast('PIN alterado.')
        }}
      >
        <p className="text-sm text-muted">O PIN protege o modo pais contra toques das crianças. Não é uma senha de segurança.</p>
        <div className="flex flex-wrap gap-3">
          <label className="flex-1">
            <span className="mb-1 block text-sm font-semibold">Novo PIN</span>
            <input className="field tracking-[0.5em]" type="password" inputMode="numeric" autoComplete="new-password" pattern="\d{4}" value={a} onChange={(e) => setA(clean(e.target.value))} />
          </label>
          <label className="flex-1">
            <span className="mb-1 block text-sm font-semibold">Repita o PIN</span>
            <input className="field tracking-[0.5em]" type="password" inputMode="numeric" autoComplete="new-password" pattern="\d{4}" value={b} onChange={(e) => setB(clean(e.target.value))} />
          </label>
        </div>
        {b.length === 4 && a !== b && <p className="text-sm font-semibold">Os dois PINs precisam ser iguais.</p>}
        <button className="btn btn-primary disabled:opacity-50" disabled={!ok} style={{ opacity: ok ? 1 : 0.5 }}>
          Salvar novo PIN
        </button>
      </form>
    </Section>
  )
}

function BackupSettings() {
  const { toast } = useSession()
  const fileRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState<Backup | null>(null)
  const [persisted, setPersisted] = useState<boolean | null>(null)

  useEffect(() => {
    void isPersisted().then(setPersisted)
  }, [])

  async function onFile(f: File | undefined) {
    setError(null)
    if (!f) return
    try {
      setPending(parseBackup(await f.text()))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível ler o arquivo.')
    } finally {
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const s = pending && summarize(pending)
  return (
    <Section title="Backup">
      <div className="card flex flex-col gap-3 p-4">
        <p className="text-sm text-muted">Os dados ficam só neste aparelho. Guarde o arquivo em um lugar seguro.</p>
        <button
          className="btn btn-primary"
          onClick={async () => {
            downloadBackup(await exportBackup())
            toast('Backup exportado.')
          }}
        >
          ⬇️ Exportar backup (JSON)
        </button>
        <button className="btn btn-ghost" onClick={() => fileRef.current?.click()}>
          ⬆️ Importar backup
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="sr-only"
          aria-label="Arquivo de backup"
          tabIndex={-1}
          onChange={(e) => void onFile(e.target.files?.[0])}
        />
        {error && (
          <p role="alert" className="rounded-xl bg-wait px-4 py-3 font-semibold">
            {error}
          </p>
        )}
        <div className="mt-1 rounded-xl bg-bg px-4 py-3 text-sm">
          {persisted === null ? (
            'Verificando a proteção dos dados…'
          ) : persisted ? (
            '✓ O navegador vai preservar os dados.'
          ) : (
            <span className="flex flex-wrap items-center gap-3">
              <span className="flex-1">O navegador pode apagar os dados se faltar espaço. Façam backups com frequência.</span>
              <button className="btn btn-ghost h-12 min-h-12" onClick={async () => setPersisted(await requestPersistence())}>
                Pedir para preservar
              </button>
            </span>
          )}
        </div>
      </div>
      {pending && s && (
        <Modal title="Importar backup" onClose={() => setPending(null)}>
          <p className="mb-2">
            Este backup tem <strong>{s.heroes} {s.heroes === 1 ? 'herói' : 'heróis'}</strong>, {s.tasks} tarefas e {s.deeds} registros, exportado em {s.exportedAt}.
          </p>
          <p className="mb-5 text-muted">Tudo o que está neste aparelho agora será substituído pelo conteúdo do backup.</p>
          <div className="flex flex-wrap gap-3">
            <button className="btn btn-ghost flex-1" onClick={() => setPending(null)}>
              Cancelar
            </button>
            <button
              className="btn btn-primary flex-1"
              onClick={async () => {
                await importBackup(pending)
                setPending(null)
                toast('Backup importado. O reino foi restaurado.')
              }}
            >
              Substituir tudo
            </button>
          </div>
        </Modal>
      )}
    </Section>
  )
}

function ResetSettings({ demo }: { demo: boolean }) {
  const [step, setStep] = useState<0 | 1>(0)
  const { lock } = useSession()
  return (
    <Section title="Começar do zero">
      <div className="card flex flex-col gap-3 p-4">
        {demo && (
          <p className="rounded-xl bg-wait px-4 py-3 font-semibold">
            Vocês estão usando a família de exemplo. Quando quiserem, comecem a família de vocês.
          </p>
        )}
        <p className="text-sm text-muted">Apaga todos os dados deste aparelho e abre o assistente de novo.</p>
        <button className="btn btn-ghost" onClick={() => setStep(1)}>
          Começar do zero…
        </button>
      </div>
      {step === 1 && (
        <Modal title="Começar do zero?" onClose={() => setStep(0)}>
          <p className="mb-5">Isto apaga tudo deste aparelho: heróis, semana, histórico e recompensas. Exportem um backup antes, se quiserem guardar.</p>
          <div className="flex flex-wrap gap-3">
            <button autoFocus className="btn btn-ghost flex-1" onClick={() => setStep(0)}>
              Cancelar
            </button>
            <button
              className="btn btn-secondary flex-1"
              onClick={async () => {
                await resetAll()
                lock()
                try {
                  localStorage.removeItem('reino:perfil')
                } catch {
                  /* nada */
                }
                go('/bem-vindo')
              }}
            >
              Sim, apagar tudo
            </button>
          </div>
        </Modal>
      )}
    </Section>
  )
}
