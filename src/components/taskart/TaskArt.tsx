// Ilustração da tarefa a partir do emoji cadastrado (SVG próprio; o emoji é só a "chave").
import { useId } from 'react'
import type { Art } from './kit'
import { Basket, Bed, Broom, Bucket, Bulb, Cat, Lotion, Moon, Pet, Plant, Shirt, Shower, Sponge, Teddy, Toothbrush, Trash, Wrench } from './home'
import { Bowl, Cup, IceCream, Pan, Pizza, Plate, Popcorn, Pot } from './food'
import { Backpack, BookOpen, Books, Brain, Briefcase, Calendar, Notepad, Phone, Receipt, School } from './study'
import { Ball, Car, Cart, Clapper, Friends, Gift, Hands, Palette, Piano, Run, Star, Stethoscope, Tree, Tv } from './misc'

/** Remove seletor de variação (U+FE0F) para casar '🛏️' e '🛏'. */
const norm = (e: string) => e.replace(/️/g, '')

const ART: Record<string, Art> = Object.fromEntries(
  (
    [
      ['🛏️', Bed], ['🧸', Teddy], ['🧺', Basket], ['🧹', Broom], ['🗑️', Trash], ['🧽', Sponge], ['🚿', Shower],
      ['🪴', Plant], ['🪣', Bucket], ['🔧', Wrench], ['💡', Bulb], ['🧴', Lotion], ['🪥', Toothbrush], ['👕', Shirt],
      ['🌙', Moon], ['🐶', Pet], ['🐱', Cat],
      ['🍽️', Plate], ['🥣', Bowl], ['🍳', Pan], ['🍲', Pot], ['☕', Cup], ['🍕', Pizza], ['🍨', IceCream], ['🍿', Popcorn],
      ['📖', BookOpen], ['📚', Books], ['🧠', Brain], ['🎒', Backpack], ['🗒️', Notepad], ['🗓️', Calendar], ['📅', Calendar],
      ['🧾', Receipt], ['💼', Briefcase], ['🏫', School], ['📞', Phone],
      ['🤝', Hands], ['🚗', Car], ['🛒', Cart], ['🏃', Run], ['🩺', Stethoscope], ['🎁', Gift], ['📺', Tv], ['🎬', Clapper],
      ['🌳', Tree], ['🧑‍🤝‍🧑', Friends], ['⭐', Star], ['🎹', Piano], ['⚽', Ball], ['🎨', Palette],
    ] as [string, Art][]
  ).map(([k, v]) => [norm(k), v]),
)

export const TASK_ART_EMOJIS = Object.keys(ART)

export function hasTaskArt(emoji: string): boolean {
  return norm(emoji) in ART
}

/** Ilustração da tarefa a partir do emoji cadastrado. Se não houver arte para o emoji, mostra o emoji (fallback). */
export function TaskArt({ emoji, size = 96, className }: { emoji: string; size?: number; className?: string }) {
  const u = useId().replace(/:/g, '')
  const A = ART[norm(emoji)]
  if (!A) {
    return (
      <span aria-hidden="true" className={className} style={{ fontSize: size * 0.78, lineHeight: 1, display: 'inline-block' }}>
        {emoji}
      </span>
    )
  }
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true" focusable="false" className={className}>
      <A u={u} s={size < 40} />
    </svg>
  )
}
