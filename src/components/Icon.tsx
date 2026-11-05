// Ícones de interface do Reino: traço único arredondado, grade 24, leve toque de fantasia.
// Sempre decorativos (aria-hidden): o rótulo acessível fica no botão que os contém.
import type { ReactNode } from 'react'

export type IconName =
  | 'castle' | 'map' | 'calendar' | 'chest' | 'scroll' | 'lock' | 'unlock' | 'speaker' | 'heart' | 'seal'
  | 'hourglass' | 'star' | 'check' | 'plus' | 'chevron-left' | 'chevron-right' | 'flame' | 'coin' | 'users'
  | 'home' | 'sparkle' | 'close' | 'undo' | 'gear' | 'shield' | 'gift' | 'clock' | 'pencil' | 'crown'
  | 'trophy' | 'book' | 'sun' | 'moon' | 'list' | 'grid' | 'download' | 'upload' | 'wand' | 'feather'

/** Desenhos. `f` = detalhe que ganha preenchimento quando `filled`. */
const PATHS: Record<IconName, (f: boolean) => ReactNode> = {
  castle: (f) => (
    <>
      <path
        d="M3.5 20.5v-10h2V8.5h2v2h2V6.5h1.5v-1h2v1H14.5v4h2v-2h2v2h2v10z"
        fill={f ? 'currentColor' : 'none'}
        fillOpacity={f ? 0.18 : 0}
      />
      <path d="M10 20.5V17a2 2 0 0 1 4 0v3.5" />
      <path d="M12 5.5V2.5l2.6 1-2.6 1" />
      <path d="M6 14h1.5M16.5 14H18" />
    </>
  ),
  map: (f) => (
    <>
      <path d="M3.5 6.5 8.5 4l7 2.5 5-2.5v13.5l-5 2.5-7-2.5-5 2.5z" fill={f ? 'currentColor' : 'none'} fillOpacity={f ? 0.15 : 0} />
      <path d="M8.5 4v13.5M15.5 6.5V20" />
      <path d="m10.8 10.2 1.4 1.4M12.2 10.2l-1.4 1.4" />
    </>
  ),
  calendar: () => (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="3" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" />
      <path d="m12 12.6.9 1.8 2 .3-1.45 1.4.35 2L12 17.2l-1.8.9.35-2-1.45-1.4 2-.3z" />
    </>
  ),
  chest: (f) => (
    <>
      <path d="M3.5 11V9a5 5 0 0 1 5-5h7a5 5 0 0 1 5 5v2" />
      <rect x="3.5" y="11" width="17" height="9.5" rx="2" fill={f ? 'currentColor' : 'none'} fillOpacity={f ? 0.15 : 0} />
      <path d="M8 4.6V11M16 4.6V11" />
      <rect x="10.25" y="9.5" width="3.5" height="4.5" rx="1" />
    </>
  ),
  scroll: () => (
    <>
      <path d="M6.5 4h11a2.5 2.5 0 0 1 0 5H17v8.5a2.5 2.5 0 0 1-2.5 2.5H6" />
      <path d="M6.5 4A2.5 2.5 0 0 0 4 6.5V9h3V6.5A2.5 2.5 0 0 0 6.5 4" />
      <path d="M6 20a2.5 2.5 0 0 1 0-5h7.5a2.5 2.5 0 0 0 0 5" />
      <path d="M9.5 9h4.5M9.5 12h4.5" />
    </>
  ),
  lock: (f) => (
    <>
      <rect x="4.5" y="10.5" width="15" height="10" rx="3" fill={f ? 'currentColor' : 'none'} fillOpacity={f ? 0.15 : 0} />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
      <path d="M12 14.2v2.6" />
    </>
  ),
  unlock: (f) => (
    <>
      <rect x="4.5" y="10.5" width="15" height="10" rx="3" fill={f ? 'currentColor' : 'none'} fillOpacity={f ? 0.15 : 0} />
      <path d="M8 10.5V8a4 4 0 0 1 7.7-1.5" />
      <path d="M12 14.2v2.6" />
    </>
  ),
  speaker: (f) => (
    <>
      <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill={f ? 'currentColor' : 'none'} fillOpacity={f ? 0.18 : 0} />
      <path d="M15.5 9.2a4 4 0 0 1 0 5.6M18.3 6.5a8 8 0 0 1 0 11" />
    </>
  ),
  heart: (f) => (
    <path
      d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20"
      fill={f ? 'currentColor' : 'none'}
    />
  ),
  seal: (f) => (
    <>
      <path
        d="M12 3.2l1.9 1.4 2.3-.3 1 2.1 2.1 1-.3 2.3 1.4 1.9-1.4 1.9.3 2.3-2.1 1-1 2.1-2.3-.3L12 20.2l-1.9-1.4-2.3.3-1-2.1-2.1-1 .3-2.3L3.6 11.8 5 9.9l-.3-2.3 2.1-1 1-2.1 2.3.3z"
        fill={f ? 'currentColor' : 'none'}
        fillOpacity={f ? 0.18 : 0}
      />
      <circle cx="12" cy="11.7" r="4.2" />
    </>
  ),
  hourglass: () => (
    <>
      <path d="M6 3.5h12M6 20.5h12" />
      <path d="M7.5 3.5c0 4.5 4.5 5.5 4.5 8.5s-4.5 4-4.5 8.5M16.5 3.5c0 4.5-4.5 5.5-4.5 8.5s4.5 4 4.5 8.5" />
      <path d="M9.5 18.2 12 16l2.5 2.2z" fill="currentColor" stroke="none" />
    </>
  ),
  star: (f) => (
    <path
      d="m12 3.5 2.55 5.3 5.8.75-4.25 4 1.05 5.75L12 16.5l-5.15 2.8 1.05-5.75-4.25-4 5.8-.75z"
      fill={f ? 'currentColor' : 'none'}
    />
  ),
  check: () => <path d="m5 12.5 4.5 4.5L19 7.5" />,
  plus: () => <path d="M12 5v14M5 12h14" />,
  'chevron-left': () => <path d="m14.5 5.5-6.5 6.5 6.5 6.5" />,
  'chevron-right': () => <path d="m9.5 5.5 6.5 6.5-6.5 6.5" />,
  flame: (f) => (
    <>
      <path
        d="M12 21a6 6 0 0 0 6-6c0-3.6-2.6-5.7-3.6-9.5-2.4 1.6-3.4 3.7-3.3 6-1-.6-1.6-1.6-1.8-2.9C7.6 10.5 6 12.6 6 15a6 6 0 0 0 6 6"
        fill={f ? 'currentColor' : 'none'}
        fillOpacity={f ? 0.18 : 0}
      />
      <path d="M12 21a2.6 2.6 0 0 1-2.6-2.6c0-1.6 1.3-2.4 2.1-3.9 1.4 1 3.1 2.2 3.1 3.9A2.6 2.6 0 0 1 12 21" />
    </>
  ),
  coin: (f) => (
    <>
      <circle cx="12" cy="12" r="8.5" fill={f ? 'currentColor' : 'none'} fillOpacity={f ? 0.18 : 0} />
      <circle cx="12" cy="12" r="5.6" />
      <path d="M9.4 13.6v-3.4l1.3 1.3 1.3-2 1.3 2 1.3-1.3v3.4z" />
    </>
  ),
  users: () => (
    <>
      <circle cx="9" cy="8.5" r="3.2" />
      <path d="M3.5 19.5a5.5 5.5 0 0 1 11 0" />
      <circle cx="16.8" cy="9.6" r="2.6" />
      <path d="M16 14.2a4.6 4.6 0 0 1 4.8 4.8" />
    </>
  ),
  home: (f) => (
    <>
      <path d="M4 10.5 12 4l8 6.5V18a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 18z" fill={f ? 'currentColor' : 'none'} fillOpacity={f ? 0.15 : 0} />
      <path d="M10 20.5V15a2 2 0 0 1 4 0v5.5" />
    </>
  ),
  sparkle: (f) => (
    <>
      <path d="M12 3c.6 4.6 2.4 6.4 7 7-4.6.6-6.4 2.4-7 7-.6-4.6-2.4-6.4-7-7 4.6-.6 6.4-2.4 7-7" fill={f ? 'currentColor' : 'none'} />
      <path d="M18.5 15.5c.2 1.6.9 2.3 2.5 2.5-1.6.2-2.3.9-2.5 2.5-.2-1.6-.9-2.3-2.5-2.5 1.6-.2 2.3-.9 2.5-2.5" />
    </>
  ),
  close: () => <path d="M6.5 6.5 17.5 17.5M17.5 6.5 6.5 17.5" />,
  undo: () => (
    <>
      <path d="M8.5 5 4.5 9l4 4" />
      <path d="M4.5 9H14a5.5 5.5 0 0 1 0 11h-3.5" />
    </>
  ),
  gear: () => (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3.5v2.2M12 18.3v2.2M20.5 12h-2.2M5.7 12H3.5M18 6l-1.55 1.55M7.55 16.45 6 18M18 18l-1.55-1.55M7.55 7.55 6 6" />
      <circle cx="12" cy="12" r="6.3" />
    </>
  ),
  shield: (f) => (
    <>
      <path d="M12 3.5 19 6v5.5c0 4.4-3 7.7-7 9-4-1.3-7-4.6-7-9V6z" fill={f ? 'currentColor' : 'none'} fillOpacity={f ? 0.18 : 0} />
      <path d="M12 3.5v17M5.4 11h13.2" />
    </>
  ),
  gift: (f) => (
    <>
      <rect x="4" y="10.5" width="16" height="10" rx="2" fill={f ? 'currentColor' : 'none'} fillOpacity={f ? 0.15 : 0} />
      <rect x="3" y="7.5" width="18" height="3" rx="1.5" />
      <path d="M12 7.5v13" />
      <path d="M12 7.5C10.8 4.6 7 4 7 6.2c0 1.3 2.4 1.3 5 1.3M12 7.5c1.2-2.9 5-3.5 5-1.3 0 1.3-2.4 1.3-5 1.3" />
    </>
  ),
  clock: () => (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  pencil: () => (
    <>
      <path d="M15.5 4.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4z" />
      <path d="m13.5 6.5 3 3" />
    </>
  ),
  crown: (f) => (
    <>
      <path d="m3.5 8 4.2 3.5L12 5l4.3 6.5L20.5 8 19 17.5H5z" fill={f ? 'currentColor' : 'none'} fillOpacity={f ? 0.2 : 0} />
      <path d="M5 20.5h14" />
    </>
  ),
  trophy: (f) => (
    <>
      <path d="M7.5 4h9v5.5a4.5 4.5 0 0 1-9 0z" fill={f ? 'currentColor' : 'none'} fillOpacity={f ? 0.18 : 0} />
      <path d="M7.5 6H4.5a3 3 0 0 0 3.2 4M16.5 6h3a3 3 0 0 1-3.2 4" />
      <path d="M12 14v3.5M8.5 20.5h7M9.5 17.5h5" />
    </>
  ),
  book: () => (
    <>
      <path d="M12 6.5C10.3 5 7.8 4.5 4 4.8v13.5c3.8-.3 6.3.2 8 1.7 1.7-1.5 4.2-2 8-1.7V4.8c-3.8-.3-6.3.2-8 1.7" />
      <path d="M12 6.5V20" />
    </>
  ),
  sun: (f) => (
    <>
      <circle cx="12" cy="12" r="4" fill={f ? 'currentColor' : 'none'} fillOpacity={f ? 0.2 : 0} />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" />
    </>
  ),
  moon: (f) => (
    <>
      <path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10" fill={f ? 'currentColor' : 'none'} fillOpacity={f ? 0.18 : 0} />
      <path d="m16.5 4.5.4 1.1 1.1.4-1.1.4-.4 1.1-.4-1.1-1.1-.4 1.1-.4z" />
    </>
  ),
  list: () => (
    <>
      <path d="M9.5 6.5h10M9.5 12h10M9.5 17.5h10" />
      <path d="m4.5 6.5.8.8 1.4-1.6M4.5 12l.8.8 1.4-1.6M4.5 17.5l.8.8 1.4-1.6" />
    </>
  ),
  grid: () => (
    <>
      <rect x="4" y="4" width="6.5" height="6.5" rx="1.8" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.8" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.8" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.8" />
    </>
  ),
  download: () => (
    <>
      <path d="M12 4v11M7.5 10.5 12 15l4.5-4.5" />
      <path d="M4.5 16.5v1.5a2.5 2.5 0 0 0 2.5 2.5h10a2.5 2.5 0 0 0 2.5-2.5v-1.5" />
    </>
  ),
  upload: () => (
    <>
      <path d="M12 15V4M7.5 8.5 12 4l4.5 4.5" />
      <path d="M4.5 16.5v1.5a2.5 2.5 0 0 0 2.5 2.5h10a2.5 2.5 0 0 0 2.5-2.5v-1.5" />
    </>
  ),
  wand: () => (
    <>
      <path d="m4 20 11-11" />
      <path d="m13.5 7.5 3 3" />
      <path d="M17.5 3c.3 1.8 1 2.5 2.8 2.8-1.8.3-2.5 1-2.8 2.8-.3-1.8-1-2.5-2.8-2.8 1.8-.3 2.5-1 2.8-2.8" />
      <path d="M8 4.5v2M7 5.5h2M19 13.5v2M18 14.5h2" />
    </>
  ),
  feather: () => (
    <>
      <path d="M19.5 4.5c-6.5 0-11 4.5-11 11v4" />
      <path d="M8.5 15.5c5.5 0 9.5-3 11-11-3.5 1-6 2.6-7.4 4.4M8.5 15.5l5-2" />
      <path d="M8.5 19.5 5 21" />
    </>
  ),
}

export const ICON_NAMES = Object.keys(PATHS) as IconName[]

interface Props {
  name: IconName
  size?: number
  className?: string
  strokeWidth?: number
  /** Preenche o detalhe principal (estrela, coração, brilho) ou dá um véu suave às formas fechadas. */
  filled?: boolean
  style?: React.CSSProperties
}

export function Icon({ name, size = 24, className, strokeWidth = 1.75, filled = false, style }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={style}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {PATHS[name](filled)}
    </svg>
  )
}
