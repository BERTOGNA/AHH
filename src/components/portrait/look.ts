// Aparência do herói ilustrado: peças combináveis desenhadas em SVG (sem emoji).
// Contrato entre o ilustrador (HeroPortrait) e o resto do app. Tudo é opcional no banco:
// membros antigos sem `look` ganham um visual padrão por `defaultLook`.
import type { Role, Treatment } from '../../db/types'

export const SKIN_TONES = [
  { id: 'porcelana', name: 'Porcelana', base: '#F7DCC8', shade: '#E8BFA6' },
  { id: 'pessego', name: 'Pêssego', base: '#EFC3A0', shade: '#DCA57F' },
  { id: 'mel', name: 'Mel', base: '#D49A6A', shade: '#B97E50' },
  { id: 'canela', name: 'Canela', base: '#A86E45', shade: '#8C5633' },
  { id: 'cacau', name: 'Cacau', base: '#7A4A2D', shade: '#623A22' },
  { id: 'ebano', name: 'Ébano', base: '#55331F', shade: '#432717' },
  // Tons de fantasia (para quem quer ser criatura mágica)
  { id: 'menta', name: 'Menta élfica', base: '#B9E2C8', shade: '#93C9A8' },
  { id: 'lavanda', name: 'Lavanda feérica', base: '#D9C8F0', shade: '#BBA5DE' },
] as const

export const HAIR_STYLES = [
  { id: 'curto', name: 'Curto' },
  { id: 'ondulado', name: 'Ondulado' },
  { id: 'cacheado', name: 'Cacheado' },
  { id: 'crespo', name: 'Crespo' },
  { id: 'longo', name: 'Longo' },
  { id: 'rabo', name: 'Rabo de cavalo' },
  { id: 'coque', name: 'Coque' },
  { id: 'trancas', name: 'Tranças' },
  { id: 'careca', name: 'Careca' },
] as const

export const HAIR_COLORS = [
  { id: 'preto', name: 'Preto', base: '#2A2230', shine: '#4A3F55' },
  { id: 'escuro', name: 'Castanho escuro', base: '#4A2E1F', shine: '#6E4630' },
  { id: 'castanho', name: 'Castanho', base: '#7A4A26', shine: '#A06A3C' },
  { id: 'ruivo', name: 'Ruivo', base: '#B4521F', shine: '#D9783E' },
  { id: 'loiro', name: 'Loiro', base: '#D9A94A', shine: '#F1CD7A' },
  { id: 'grisalho', name: 'Grisalho', base: '#A9A3AE', shine: '#D2CDD6' },
  { id: 'azul', name: 'Azul mágico', base: '#3E5FC2', shine: '#6E8BE0' },
  { id: 'rosa', name: 'Rosa mágico', base: '#C2508E', shine: '#E47FB5' },
] as const

export const EYES = [
  { id: 'redondos', name: 'Redondos' },
  { id: 'felizes', name: 'Felizes' },
  { id: 'amendoados', name: 'Amendoados' },
] as const

export const MOUTHS = [
  { id: 'sorriso', name: 'Sorriso' },
  { id: 'risada', name: 'Risada' },
  { id: 'tranquilo', name: 'Tranquilo' },
] as const

export const EXTRAS = [
  { id: 'oculos', name: 'Óculos' },
  { id: 'barba', name: 'Barba' },
  { id: 'bigode', name: 'Bigode' },
  { id: 'sardas', name: 'Sardas' },
  { id: 'orelhas-elficas', name: 'Orelhas élficas' },
] as const

export type SkinId = (typeof SKIN_TONES)[number]['id']
export type HairStyleId = (typeof HAIR_STYLES)[number]['id']
export type HairColorId = (typeof HAIR_COLORS)[number]['id']
export type EyesId = (typeof EYES)[number]['id']
export type MouthId = (typeof MOUTHS)[number]['id']
export type ExtraId = (typeof EXTRAS)[number]['id']

export interface HeroLook {
  skin: SkinId
  hair: HairStyleId
  hairColor: HairColorId
  eyes: EyesId
  mouth: MouthId
  extras: ExtraId[]
}

/** Faixa etária do desenho (proporções): criança tem cabeça maior e traços mais redondos. */
export type PortraitAge = 'child' | 'teen' | 'adult'
export const ageOf = (role: Role): PortraitAge => role

/** Visual padrão, estável por slot (para membros antigos e para o assistente). */
export function defaultLook(role: Role, treatment: Treatment, slot: number): HeroLook {
  const skins: SkinId[] = ['pessego', 'mel', 'canela', 'porcelana']
  const colors: HairColorId[] = ['escuro', 'castanho', 'preto', 'ruivo']
  const hair: HairStyleId =
    treatment === 'a' ? (role === 'child' ? 'trancas' : role === 'teen' ? 'rabo' : 'longo') : role === 'adult' ? 'curto' : 'ondulado'
  return {
    skin: skins[slot % skins.length],
    hair,
    hairColor: colors[slot % colors.length],
    eyes: role === 'child' ? 'redondos' : 'felizes',
    mouth: role === 'child' ? 'risada' : 'sorriso',
    extras: role === 'adult' && treatment === 'o' ? ['barba'] : [],
  }
}
