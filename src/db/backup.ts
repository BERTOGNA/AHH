// Backup local em JSON: nada sai do aparelho, a família guarda o arquivo onde quiser.
import { db, SCHEMA_VERSION } from './db'
import { today } from '../lib/date'

export const TABLES = [
  'members', 'routines', 'tasks', 'completions', 'rewards', 'redemptions', 'thanks', 'unlocks', 'missions', 'settings',
] as const
type TableName = (typeof TABLES)[number]

export interface Backup {
  app: 'reino-da-familia'
  version: number
  exportedAt: string
  data: Record<TableName, unknown[]>
}

export async function exportBackup(): Promise<Backup> {
  const data = {} as Backup['data']
  for (const t of TABLES) data[t] = await db.table(t).toArray()
  return { app: 'reino-da-familia', version: SCHEMA_VERSION, exportedAt: new Date().toISOString(), data }
}

/** Baixa o arquivo e registra a data do último backup (para o lembrete gentil). */
export function downloadBackup(b: Backup) {
  void db.settings.update('app', { lastBackupAt: Date.now() })
  const blob = new Blob([JSON.stringify(b, null, 2)], { type: 'application/json' })
  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(blob), download: `reino-backup-${today()}.json`,
  })
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(a.href), 2000)
}

/** Lê e valida um backup. Lança Error com mensagem em português. */
export function parseBackup(text: string): Backup {
  let b: Backup
  try {
    b = JSON.parse(text)
  } catch {
    throw new Error('Este arquivo não é um backup válido (JSON ilegível).')
  }
  if (!b || b.app !== 'reino-da-familia') throw new Error('Este arquivo não é um backup do Reino da Família.')
  if (typeof b.version !== 'number' || b.version > SCHEMA_VERSION) {
    throw new Error('Este backup foi feito por uma versão mais nova do app. Atualize o app e tente de novo.')
  }
  if (!b.data || typeof b.data !== 'object') throw new Error('O backup está incompleto.')
  for (const t of TABLES) {
    const rows = b.data[t] ?? []
    if (!Array.isArray(rows)) throw new Error(`O backup está incompleto (${t}).`)
    b.data[t] = rows
  }
  if (!b.data.members.length) throw new Error('O backup não tem nenhum herói.')
  const pkOk = (rows: unknown[], key: string) => rows.every((r) => r && typeof r === 'object' && key in (r as object))
  for (const t of TABLES) {
    if (t === 'unlocks' ? !pkOk(b.data[t], 'memberId') : t === 'missions' ? !pkOk(b.data[t], 'weekKey') : !pkOk(b.data[t], 'id')) {
      throw new Error(`O backup tem registros sem identificação (${t}).`)
    }
  }
  return b
}

export function summarize(b: Backup) {
  const d = new Date(b.exportedAt)
  return {
    heroes: b.data.members.length,
    tasks: b.data.tasks.length,
    deeds: b.data.completions.length,
    exportedAt: isNaN(d.getTime()) ? '—' : d.toLocaleDateString('pt-BR'),
  }
}

/** Substitui tudo numa única transação: se falhar, nada muda. */
export async function importBackup(b: Backup) {
  await db.transaction('rw', db.tables, async () => {
    for (const t of TABLES) {
      await db.table(t).clear()
      await db.table(t).bulkPut(b.data[t])
    }
  })
}
