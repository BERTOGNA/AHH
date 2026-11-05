import { useFamily } from '../state'
import { updateSettings } from '../db/actions'
import { Icon, type IconName } from './Icon'

const TIPS: { icon: IconName; title: string; text: string }[] = [
  { icon: 'castle', title: 'Este é o Salão', text: 'Cada um toca no próprio estandarte para jogar. Os adultos entram com o PIN.' },
  { icon: 'seal', title: 'Ritual do Selo', text: 'À noite, validem as tarefas com as crianças vendo. Um toque em “Validar” e a estrela carimba.' },
  { icon: 'calendar', title: 'A Semana', text: 'A rotina de todos num lugar só. Toque numa tarefa para ajustar; segure e arraste para mudar de dia.' },
]

/** Três dicas na primeira visita ao Salão (some para sempre ao tocar em "Entendi"). */
export function FirstTips() {
  const { settings } = useFamily()
  if (settings.tourDone || settings.demo) return null
  return (
    <section className="panel-night p-5" aria-labelledby="dicas">
      <h2 id="dicas" className="title-display mb-3 text-xl text-gold-light">Bem-vindos ao reino!</h2>
      <ul className="grid gap-3 md:grid-cols-3">
        {TIPS.map((t) => (
          <li key={t.title} className="flex gap-3 rounded-2xl bg-white/[0.05] p-3 ring-1 ring-white/10">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gold/20 text-gold-light" aria-hidden="true"><Icon name={t.icon} size={22} /></span>
            <span>
              <b className="block text-ivory">{t.title}</b>
              <span className="text-sm text-moon">{t.text}</span>
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button className="btn btn-primary" onClick={() => updateSettings({ tourDone: true })}>Entendi</button>
        <span className="text-sm text-moon">Tudo pode ser ajustado depois no Painel dos Pais (botão “Pais”).</span>
      </div>
    </section>
  )
}
