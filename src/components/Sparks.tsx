/** Faíscas ✦ que se espalham a partir do centro do elemento pai (que precisa ser relative). */
export function Sparks({ color = '#d9a62e', count = 10 }: { color?: string; count?: number }) {
  return (
    <span aria-hidden="true">
      {Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2
        const r = 60 + (i % 3) * 18
        return (
          <span
            key={i}
            className="spark"
            style={{
              color: i % 2 ? color : '#d9a62e',
              ['--dx' as string]: `${Math.cos(a) * r}px`,
              ['--dy' as string]: `${Math.sin(a) * r}px`,
              animationDelay: `${(i % 4) * 30}ms`,
            }}
          >
            ✦
          </span>
        )
      })}
    </span>
  )
}
