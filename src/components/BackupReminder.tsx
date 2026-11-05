import { useFamily, useSession } from '../state'
import { downloadBackup, exportBackup } from '../db/backup'
import { Icon } from './Icon'

const DAY = 86400000
const EVERY = 14 * DAY

/** Quando lembrar: último backup há mais de 14 dias; sem backup, depois de 7 dias de uso. */
export function needsBackup(s: { lastBackupAt?: number; createdAt?: number; demo: boolean }, now = Date.now()) {
  if (s.demo) return false
  if (s.lastBackupAt) return now - s.lastBackupAt > EVERY
  return s.createdAt !== undefined && now - s.createdAt > 7 * DAY
}

/** Lembrete gentil para os pais: os dados vivem só neste aparelho. */
export function BackupReminder({ night }: { night?: boolean }) {
  const { settings, members } = useFamily()
  const { adultId, toast } = useSession()
  if (!adultId || !needsBackup({ ...settings, createdAt: settings.createdAt ?? members[0]?.createdAt })) return null
  const days = settings.lastBackupAt ? Math.floor((Date.now() - settings.lastBackupAt) / DAY) : null
  return (
    <section className={`${night ? 'panel-night' : 'card-gilded'} mb-5 flex flex-wrap items-center gap-4 p-4`} aria-label="Lembrete de backup">
      <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${night ? 'bg-white/10 text-gold-light' : 'bg-wait text-gold-deep'}`}>
        <Icon name="download" size={24} />
      </span>
      <p className="min-w-[200px] flex-1">
        <b>Hora de guardar o reino.</b>{' '}
        <span className={night ? 'text-moon' : 'text-muted'}>
          {days === null ? 'Vocês ainda não fizeram um backup.' : `O último backup foi há ${days} dias.`} Os dados vivem só neste aparelho.
        </span>
      </p>
      <button
        className="btn btn-primary"
        onClick={async () => {
          downloadBackup(await exportBackup())
          toast('Backup salvo. Guarde o arquivo num lugar seguro.')
        }}
      >
        Fazer backup agora
      </button>
    </section>
  )
}
