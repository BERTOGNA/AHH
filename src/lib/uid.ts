/** Id único. `crypto.randomUUID` só existe em contexto seguro (https/localhost); fora dele, usa um fallback. */
export function uid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  const r = () => Math.random().toString(16).slice(2, 10)
  return `${Date.now().toString(16)}-${r()}-${r()}`
}
