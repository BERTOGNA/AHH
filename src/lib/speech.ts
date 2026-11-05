// Leitura em voz alta com a Web Speech API. Se não houver suporte, falha em silêncio.

let enabled = true

export function setSpeechEnabled(on: boolean) {
  enabled = on
  if (!on) stopSpeaking()
}

function ptVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices()
  return (
    voices.find((v) => v.lang === 'pt-BR') ??
    voices.find((v) => v.lang.toLowerCase().startsWith('pt'))
  )
}

export function speak(text: string) {
  try {
    if (!enabled || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'pt-BR'
    u.rate = 0.95
    u.pitch = 1.05
    const v = ptVoice()
    if (v) u.voice = v
    window.speechSynthesis.speak(u)
  } catch {
    /* fallback silencioso */
  }
}

export function stopSpeaking() {
  try {
    window.speechSynthesis?.cancel()
  } catch {
    /* nada */
  }
}
