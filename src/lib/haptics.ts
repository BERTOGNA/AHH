// Vibração curta opcional (só funciona em alguns celulares Android).
export function buzz(pattern: number | number[] = 30) {
  try {
    navigator.vibrate?.(pattern)
  } catch {
    /* sem suporte */
  }
}
