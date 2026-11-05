// Vibração curta opcional (só funciona em alguns celulares).
let on = true
export function setVibrationEnabled(v: boolean) {
  on = v
}
export function buzz(pattern: number | number[] = 30) {
  try {
    if (on) navigator.vibrate?.(pattern)
  } catch {
    /* sem suporte */
  }
}
