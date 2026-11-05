import { useEffect } from 'react'
import { useFamily, useParentGate, useSession } from '../state'
import { go } from '../router'
import { KidAdventure } from './adventure/Kid'
import { GrownAdventure } from './adventure/Grown'

/** Aventura de hoje: a tela muda com a idade, a história é a mesma. */
export function Adventure({ id }: { id: string }) {
  const { byId } = useFamily()
  const { currentId, setCurrent, adultId } = useSession()
  const gate = useParentGate()
  const me = byId.get(id)

  useEffect(() => {
    if (!me) return
    if (me.role === 'adult' && adultId !== me.id) {
      gate(() => {}, me.id) // tela de adulto exige PIN
      return
    }
    if (currentId !== me.id) setCurrent(me.id)
  }, [me, currentId, adultId, setCurrent, gate])

  if (!me) {
    go('/')
    return null
  }
  if (me.role === 'adult' && adultId !== me.id) {
    return (
      <main className="mx-auto max-w-md p-6 pt-16 text-center lg:pl-32">
        <p className="text-5xl" aria-hidden="true">🔒</p>
        <h1 className="title-display mt-3 text-2xl font-bold">Aventura de {me.name}</h1>
        <p className="mt-2 text-muted">A tela dos adultos pede o PIN.</p>
        <button className="btn btn-gold mt-5" onClick={() => gate(() => {}, me.id)}>Digitar PIN</button>
      </main>
    )
  }
  return me.role === 'child' ? <KidAdventure key={me.id} me={me} /> : <GrownAdventure key={me.id} me={me} />
}
