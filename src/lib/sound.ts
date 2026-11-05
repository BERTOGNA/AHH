// Sons sintetizados (sem arquivos): "ding-ding" ao marcar, acorde ao validar.
let ctx: AudioContext | null = null
let on = true

export function setSoundEnabled(v: boolean) {
  on = v
}

function tone(freq: number, start: number, dur: number, vol = 0.4) {
  if (!ctx) return
  const o = ctx.createOscillator()
  const g = ctx.createGain()
  o.type = 'triangle'
  o.frequency.value = freq
  g.gain.setValueAtTime(0, ctx.currentTime + start)
  g.gain.linearRampToValueAtTime(vol * 0.4, ctx.currentTime + start + 0.01)
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur)
  o.connect(g).connect(ctx.destination)
  o.start(ctx.currentTime + start)
  o.stop(ctx.currentTime + start + dur + 0.05)
}

export function play(kind: 'done' | 'validated' | 'level' | 'tap') {
  try {
    if (!on) return
    ctx ??= new AudioContext()
    if (ctx.state === 'suspended') void ctx.resume()
    if (kind === 'tap') tone(660, 0, 0.08, 0.2)
    if (kind === 'done') { tone(784, 0, 0.18); tone(1047, 0.12, 0.25) }
    if (kind === 'validated') { tone(523, 0, 0.3); tone(659, 0.08, 0.3); tone(784, 0.16, 0.4) }
    if (kind === 'level') [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.4))
  } catch {
    /* sem áudio */
  }
}
