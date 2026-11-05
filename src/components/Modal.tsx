import { useEffect, useRef, type ReactNode } from 'react'
import { Icon } from './Icon'

interface Props {
  title: string
  onClose: () => void
  children: ReactNode
  wide?: boolean
  hideTitle?: boolean
}

/** Folha inferior no celular, janela central no tablet. Foco preso e Esc fecha. */
export function Modal({ title, onClose, children, wide, hideTitle }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    const el = ref.current
    el?.querySelector<HTMLElement>('[autofocus], button, input, select, textarea')?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key !== 'Tab' || !el) return
      const f = [...el.querySelectorAll<HTMLElement>('button, input, select, textarea, [tabindex="0"]')].filter((x) => !x.hasAttribute('disabled'))
      if (!f.length) return
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus() }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      prev?.focus?.()
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-night/60 backdrop-blur-[2px] sm:items-center sm:p-6" onClick={onClose}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className={`animate-rise max-h-[92dvh] w-full overflow-y-auto rounded-t-[28px] border border-line bg-surface p-6 pb-[max(24px,env(safe-area-inset-bottom))] shadow-[var(--shadow-e3)] sm:rounded-[28px] ${wide ? 'sm:max-w-3xl' : 'sm:max-w-[560px]'}`}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 className={`title-display text-2xl ${hideTitle ? 'sr-only' : ''}`}>{title}</h2>
          <button className="btn btn-ghost ml-auto h-12 w-12 shrink-0 rounded-full p-0" onClick={onClose} aria-label="Fechar">
            <Icon name="close" size={22} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
