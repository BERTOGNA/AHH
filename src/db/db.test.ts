import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from './db'
import { seedDemo } from './seed'
import { exportBackup, importBackup, parseBackup } from './backup'
import { checkPin, markDone, notYet, requestReward, validate } from './actions'
import { occurrencesFor } from '../domain/schedule'
import { coinBalance, ledger, xpOf } from '../domain/economy'
import { today } from '../lib/date'

beforeEach(async () => {
  await seedDemo()
})

describe('banco local', () => {
  it('cria a família de exemplo com histórico e missão', async () => {
    expect(await db.members.count()).toBe(4)
    expect(await db.tasks.count()).toBeGreaterThan(15)
    expect(await db.missions.count()).toBe(1)
    expect((await db.completions.where('status').equals('done').count())).toBeGreaterThan(0)
    expect(await checkPin('1234')).toBe(true)
    expect(await checkPin('0000')).toBe(false)
    const [completions, thanks, redemptions] = await Promise.all([db.completions.toArray(), db.thanks.toArray(), db.redemptions.toArray()])
    const ev = ledger({ completions, thanks })
    // o resgate de exemplo cabe no saldo do Léo
    const leoEarned = ev.filter((e) => e.memberId === 'leo').reduce((s, e) => s + e.coins, 0)
    expect(leoEarned).toBeGreaterThanOrEqual(redemptions[0].cost)
    expect(await db.unlocks.count()).toBeGreaterThan(0)
  })

  it('criança marca, pai valida, XP sobe; "Ainda não" não deixa rastro', async () => {
    const [tasks, completions, members] = await Promise.all([db.tasks.toArray(), db.completions.toArray(), db.members.toArray()])
    const bia = members.find((m) => m.id === 'bia')!
    const open = occurrencesFor(today(), tasks, completions).filter((o) => o.forIds.includes('bia') && !o.completion)
    expect(open.length).toBeGreaterThan(0)
    const before = xpOf('bia', ledger({ completions, thanks: await db.thanks.toArray() }))

    const c = await markDone(open[0].task, today(), open[0].slot, ['bia'], bia)
    expect(c.status).toBe('done')
    await validate([c.id], 'ana')
    const after = xpOf('bia', ledger({ completions: await db.completions.toArray(), thanks: await db.thanks.toArray() }))
    expect(after).toBe(before + open[0].task.xp)

    const c2 = await markDone(open[1].task, today(), open[1].slot, ['bia'], bia)
    await notYet(c2.id)
    expect(await db.completions.get(c2.id)).toBeUndefined()
  })

  it('tarefa de adulto marcada por adulto já nasce validada', async () => {
    const [tasks, completions, members] = await Promise.all([db.tasks.toArray(), db.completions.toArray(), db.members.toArray()])
    const ana = members.find((m) => m.id === 'ana')!
    const mine = occurrencesFor(today(), tasks, completions).find((o) => o.forIds.includes('ana') && !o.completion)!
    const c = await markDone(mine.task, today(), mine.slot, mine.forIds, ana)
    expect(c.status).toBe('validated')
  })

  it('não deixa pedir recompensa sem moedas', async () => {
    const reward = { id: 'caro', title: 'Viagem', emoji: '✈️', cost: 300, active: true, createdAt: 0 }
    expect(await requestReward('bia', reward)).toBe(false)
    const [completions, thanks, redemptions] = await Promise.all([db.completions.toArray(), db.thanks.toArray(), db.redemptions.toArray()])
    expect(coinBalance('bia', ledger({ completions, thanks }), redemptions)).toBeGreaterThanOrEqual(0)
  })

  it('backup: exportar → apagar → importar devolve tudo igual', async () => {
    const b = await exportBackup()
    const text = JSON.stringify(b)
    for (const t of db.tables) await t.clear()
    expect(await db.members.count()).toBe(0)
    await importBackup(parseBackup(text))
    const again = await exportBackup()
    expect({ ...again, exportedAt: '' }).toEqual({ ...b, exportedAt: '' })
  })

  it('backup inválido é recusado com mensagem clara', () => {
    expect(() => parseBackup('oi')).toThrow(/não é um backup/)
    expect(() => parseBackup(JSON.stringify({ app: 'outro' }))).toThrow(/Reino da Família/)
    expect(() => parseBackup(JSON.stringify({ app: 'reino-da-familia', version: 99, data: {} }))).toThrow(/versão mais nova/)
  })
})

import { backfillSteps } from './actions'

describe('migração do passo a passo', () => {
  it('tarefas antigas sem passos ganham os passos da sugestão de mesmo nome', async () => {
    const t = (await db.tasks.toArray()).find((x) => x.title === 'Arrumar a cama')!
    await db.tasks.update(t.id, { steps: undefined })
    await backfillSteps()
    // roda uma vez só: se os pais apagarem os passos depois, eles não voltam
    await db.tasks.update(t.id, { steps: [] })
    await backfillSteps()
    expect((await db.tasks.get(t.id))!.steps).toEqual([])
    await db.tasks.update(t.id, { steps: ['x'] })
    expect((await db.tasks.get(t.id))!.steps?.length).toBeGreaterThan(0)
  })
})

import { clearTimeOff, setTimeOff } from './actions'
import { routineAt } from '../domain/schedule'
import { addDays as add } from '../lib/date'

describe('férias e folgas', () => {
  it('tira a escola e as tarefas de dia de aula só no período; desfazer volta', async () => {
    // próxima segunda-feira
    let mon = today()
    while (new Date(mon + 'T12:00').getDay() !== 1) mon = add(mon, 1)
    const routines = () => db.routines.toArray()
    expect(routineAt('bia', mon, 9 * 60, await routines())?.kind).toBe('school')
    await setTimeOff(['bia', 'leo'], mon, add(mon, 4), ['school'])
    expect(routineAt('bia', mon, 9 * 60, await routines())?.kind).not.toBe('school')
    const tasks = await db.tasks.toArray()
    expect(occurrencesFor(mon, tasks, []).some((o) => o.task.title === 'Lição de casa')).toBe(false)
    expect(occurrencesFor(add(mon, 7), tasks, []).some((o) => o.task.title === 'Lição de casa')).toBe(true) // semana seguinte normal
    expect(occurrencesFor(mon, tasks, []).some((o) => o.task.title === 'Arrumar a cama')).toBe(true) // casa continua
    await clearTimeOff(['bia', 'leo'], mon, add(mon, 4))
    expect(routineAt('bia', mon, 9 * 60, await routines())?.kind).toBe('school')
  })
})
