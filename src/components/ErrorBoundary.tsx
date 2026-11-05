import { Component, type ReactNode } from 'react'

/** Se algo inesperado quebrar a tela, mostra uma saída calma em vez de uma página branca. Os dados não são tocados. */
export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }
  static getDerivedStateFromError(error: Error) {
    return { error }
  }
  render() {
    if (!this.state.error) return this.props.children
    return <Trouble title="Algo saiu do lugar" text="Os dados da família continuam guardados neste aparelho. Recarregar costuma resolver." action />
  }
}

export function Trouble({ title, text, action }: { title: string; text: string; action?: boolean }) {
  return (
    <main className="night-sky on-night grid min-h-dvh place-items-center p-6 text-center">
      <div className="panel-night max-w-md p-8">
        <img src="./icon.svg" alt="" width={72} height={72} className="mx-auto rounded-2xl" />
        <h1 className="title-display mt-4 text-2xl text-gold-light">{title}</h1>
        <p className="mt-2 text-moon">{text}</p>
        {action && (
          <button className="btn btn-primary mt-5 h-14 w-full" onClick={() => location.reload()}>
            Recarregar
          </button>
        )}
      </div>
    </main>
  )
}
