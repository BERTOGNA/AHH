// Quadro da semana para imprimir (geladeira): uma linha por pessoa, uma coluna por dia, com as ilustrações.
import { useEffect } from 'react'
import { useFamily } from '../state'
import { memberDay, occurrencesFor } from '../domain/schedule'
import { formatDayMonth, formatTime, isoWeekday, today, weekDates, WEEKDAY_SHORT } from '../lib/date'
import { TaskArt } from '../components/taskart/TaskArt'
import { Avatar } from '../components/Avatar'
import { Icon } from '../components/Icon'
import { go } from '../router'
import { className } from '../components/hero'

export function PrintWeek() {
  const f = useFamily()
  const dates = weekDates(today())
  useEffect(() => {
    const root = document.documentElement
    const prev = root.dataset.theme
    document.body.classList.add('printing')
    root.dataset.print = '1'
    root.dataset.theme = 'claro'
    return () => {
      document.body.classList.remove('printing')
      delete root.dataset.print
      if (prev) root.dataset.theme = prev
    }
  }, [])
  return (
    <main className="print-sheet mx-auto max-w-[1100px] bg-white p-6 text-ink">
      <div className="no-print mb-4 flex flex-wrap gap-3">
        <button className="btn btn-ghost" onClick={() => go('/semana')}><Icon name="chevron-left" size={18} /> Voltar</button>
        <button className="btn btn-primary" onClick={() => window.print()}><Icon name="download" size={18} /> Imprimir</button>
        <p className="self-center text-sm text-muted">Dica: use papel na horizontal. Cada um marca o quadradinho quando fizer.</p>
      </div>
      <header className="mb-3 flex items-end justify-between border-b-2 border-ink pb-2">
        <div>
          <h1 className="insignia text-2xl">{f.settings.kingdomName}</h1>
          <p className="text-sm">Quadro da semana · {formatDayMonth(dates[0])} a {formatDayMonth(dates[6])}</p>
        </div>
        <p className="story text-sm italic">A casa funciona porque cada um faz a sua parte.</p>
      </header>
      <table className="w-full table-fixed border-collapse text-[11px]">
        <thead>
          <tr>
            <th className="w-[13%] border border-[#bbb] p-1 text-left">Herói</th>
            {dates.map((d) => (
              <th key={d} className="border border-[#bbb] p-1">{WEEKDAY_SHORT[isoWeekday(d)]} {formatDayMonth(d)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {f.members.map((m) => (
            <tr key={m.id} className="align-top">
              <td className="border border-[#bbb] p-1">
                <div className="flex flex-col items-center gap-1 text-center">
                  <Avatar member={m} size={44} />
                  <b className="text-xs">{m.name}</b>
                  <span className="text-[10px] leading-tight">{className(m)}</span>
                </div>
              </td>
              {dates.map((d) => {
                const occ = memberDay(m.id, occurrencesFor(d, f.tasks, []))
                return (
                  <td key={d} className="border border-[#bbb] p-1">
                    <ul className={`flex flex-col ${m.role === 'child' ? 'gap-2 py-1' : 'gap-1'}`}>
                      {occ.map((o) => (
                        <li key={o.task.id + o.slot} className="flex items-center gap-1">
                          <span className={`inline-block shrink-0 rounded border-[1.5px] border-ink ${m.role === 'child' ? 'h-7 w-7' : 'h-3.5 w-3.5'}`} aria-hidden="true" />
                          <TaskArt emoji={o.task.emoji} size={m.role === 'child' ? 46 : 22} />
                          <span className="leading-tight">
                            {m.role === 'child' ? '' : o.task.title}
                            {o.task.time && m.role !== 'child' ? <span className="text-[#555]"> {formatTime(o.task.time)}</span> : null}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-[10px] text-[#555]">Para os pequenos, o quadro mostra só os desenhos — cada desenho é uma missão do dia.</p>
    </main>
  )
}
