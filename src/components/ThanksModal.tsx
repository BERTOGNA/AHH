import { useState } from 'react'
import type { Member } from '../db/types'
import { useFamily, useSession } from '../state'
import { QUICK_THANKS } from '../data/thanks'
import { sendThanks } from '../db/actions'
import { Modal } from './Modal'
import { Avatar } from './Avatar'
import { genderize } from './hero'
import { speak } from '../lib/speech'
import { play } from '../lib/sound'

interface Props {
  from: Member
  to?: string
  completionId?: string
  about?: string // "por Cozinhar o jantar"
  onClose: () => void
}

/** Enviar um agradecimento. Para o perfil de 6 anos: só toques e voz, sem digitar. */
export function ThanksModal({ from, to, completionId, about, onClose }: Props) {
  const { members } = useFamily()
  const { toast } = useSession()
  const kid = from.role === 'child'
  const [toId, setToId] = useState<string | undefined>(to)
  const [text, setText] = useState('')
  const others = members.filter((m) => m.id !== from.id)
  const target = members.find((m) => m.id === toId)

  async function send(message: string, emoji: string) {
    if (!toId) return
    await sendThanks(from.id, toId, message, emoji, completionId)
    play('done')
    if (kid) speak(`Você agradeceu ${target?.name}!`)
    toast(`Agradecimento enviado para ${target?.name}. 💛`)
    onClose()
  }

  return (
    <Modal title={kid ? 'Agradecer' : `Agradecer${about ? ` ${about}` : ''}`} onClose={onClose}>
      <p className="mb-2 font-semibold">{kid ? 'Para quem?' : 'Para quem é o agradecimento?'}</p>
      <div className="mb-5 flex flex-wrap justify-center gap-3" role="radiogroup" aria-label="Para quem">
        {others.map((m) => (
          <button
            key={m.id}
            role="radio"
            aria-checked={toId === m.id}
            aria-label={m.name}
            onClick={() => {
              setToId(m.id)
              if (kid) speak(m.name)
            }}
            className={`flex flex-col items-center gap-1 rounded-2xl p-2 ${toId === m.id ? 'bg-wait ring-4 ring-gold' : ''}`}
          >
            <Avatar member={m} size={kid ? 88 : 60} />
            <span className={`font-semibold ${kid ? 'text-xl' : ''}`}>{m.name}</span>
          </button>
        ))}
      </div>
      {toId && (
        <>
          <p className="mb-2 font-semibold">{kid ? 'O que você quer dizer?' : 'Mensagem'}</p>
          <div className={`grid gap-2 ${kid ? 'grid-cols-4' : 'grid-cols-1 sm:grid-cols-2'}`}>
            {QUICK_THANKS.map((q) => {
              const msg = genderize(q.text, from.treatment)
              return kid ? (
                <button
                  key={q.text}
                  aria-label={msg}
                  className="grid h-20 place-items-center rounded-2xl border-2 border-line bg-white text-4xl active:bg-wait"
                  onClick={() => {
                    speak(msg)
                    void send(msg, q.emoji)
                  }}
                >
                  {q.emoji}
                </button>
              ) : (
                <button key={q.text} className="btn btn-ghost justify-start text-left" onClick={() => send(msg, q.emoji)}>
                  <span aria-hidden="true">{q.emoji}</span> {msg}
                </button>
              )
            })}
          </div>
          {!kid && (
            <form
              className="mt-4 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                if (text.trim()) void send(text.trim(), '💛')
              }}
            >
              <input className="field" maxLength={140} value={text} onChange={(e) => setText(e.target.value)} placeholder="Ou escreva com suas palavras…" aria-label="Mensagem livre" />
              <button className="btn btn-primary" disabled={!text.trim()}>Enviar</button>
            </form>
          )}
        </>
      )}
    </Modal>
  )
}
