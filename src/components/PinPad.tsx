import { useState } from 'react'
import { useFamily, useSession } from '../state'
import { checkPin } from '../db/actions'
import { Modal } from './Modal'
import { Avatar } from './Avatar'
import { buzz } from '../lib/haptics'

/** Teclado de PIN dos pais. Abre quando alguém pede o modo pais. */
export function PinPad() {
  const { pinRequest, closePin, unlock, setCurrent } = useSession()
  const { members, settings } = useFamily()
  const adults = members.filter((m) => m.role === 'adult')
  const [who, setWho] = useState<string | undefined>(pinRequest?.adultId ?? adults[0]?.id)
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  if (!pinRequest) return null
  const adult = members.find((m) => m.id === (pinRequest.adultId ?? who))

  async function press(d: string) {
    if (pin.length >= 4) return
    const next = pin + d
    setPin(next)
    setError(false)
    if (next.length === 4) {
      if (await checkPin(next)) {
        const id = adult?.id ?? adults[0]?.id
        if (!id) return
        unlock(id)
        setCurrent(id)
        closePin()
        pinRequest!.then(id)
      } else {
        buzz([40, 40, 40])
        setError(true)
        setTimeout(() => setPin(''), 380)
      }
    }
  }

  return (
    <Modal title="Modo dos pais" onClose={closePin}>
      {!pinRequest.adultId && adults.length > 1 && (
        <div className="mb-4">
          <p className="mb-2 text-center font-semibold">Quem está entrando?</p>
          <div className="flex justify-center gap-4" role="radiogroup" aria-label="Adulto">
            {adults.map((a) => (
              <button
                key={a.id}
                role="radio"
                aria-checked={who === a.id}
                onClick={() => setWho(a.id)}
                className={`flex flex-col items-center gap-1 rounded-2xl p-2 transition ${who === a.id ? 'bg-wait ring-2 ring-gold' : 'opacity-70'}`}
              >
                <Avatar member={a} size={56} />
                <span className="font-semibold">{a.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {pinRequest.adultId && adult && (
        <div className="mb-3 flex flex-col items-center gap-1">
          <Avatar member={adult} size={72} />
          <span className="font-semibold">{adult.name}</span>
        </div>
      )}
      <p className="text-center text-muted">Digite o PIN de 4 dígitos.</p>
      <div className={`my-4 flex justify-center gap-4 ${error ? 'animate-shake' : ''}`} aria-live="polite">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={`h-4 w-4 rounded-full transition ${i < pin.length ? 'bg-gradient-to-b from-[#F6DD96] to-gold shadow-[0_0_10px_rgba(212,162,63,0.6)]' : 'bg-line'}`} />
        ))}
        <span className="sr-only">{error ? 'PIN incorreto. Tente de novo.' : `${pin.length} de 4 dígitos`}</span>
      </div>
      {error && <p className="mb-2 text-center font-semibold text-ink">PIN incorreto. Tente de novo.</p>}
      <div className="mx-auto grid max-w-[264px] grid-cols-3 gap-3">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
          <Key key={d} onClick={() => press(d)}>{d}</Key>
        ))}
        <span />
        <Key onClick={() => press('0')}>0</Key>
        <Key onClick={() => setPin((p) => p.slice(0, -1))} label="Apagar">⌫</Key>
      </div>
      {settings.demo && <p className="mt-4 text-center text-sm text-muted">Família de exemplo: o PIN é 1234.</p>}
    </Modal>
  )
}

function Key({ children, onClick, label }: { children: string; onClick: () => void; label?: string }) {
  return (
    <button
      onClick={onClick}
      aria-label={label ?? children}
      className="h-[72px] w-[72px] justify-self-center rounded-full border border-line bg-gradient-to-b from-white to-[#F7F0E2] text-[26px] font-semibold tabular-nums shadow-[var(--shadow-e1)] transition active:scale-95 active:bg-wait"
    >
      {children}
    </button>
  )
}
