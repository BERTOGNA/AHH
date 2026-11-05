// O PIN dos pais protege contra toques das crianças; não é segurança real.
// Os dados ficam no aparelho, então um hash com sal basta para não guardar o PIN em claro.

export async function hashPin(pin: string, salt: string): Promise<string> {
  const text = `${salt}:${pin}`
  if (globalThis.crypto?.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
  }
  // Fora de contexto seguro (http na rede local) não há SubtleCrypto: usa FNV-1a.
  let h = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return `fnv-${h.toString(16)}`
}

export function newSalt(): string {
  return Math.random().toString(36).slice(2, 12)
}
