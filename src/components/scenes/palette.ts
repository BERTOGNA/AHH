// Paleta das cenas (design-system.md). Dia e noite compartilham as mesmas formas.
export interface ScenePalette {
  skyTop: string
  skyBottom: string
  hillFar: string
  hillMid: string
  ground: string
  groundShade: string
  castle: string
  water: string
  waterLight: string
  stone: string
  stoneShade: string
  wood: string
  woodShade: string
  leaf: string
  leafLight: string
  mist: string
  ivory: string
}

export const DAY: ScenePalette = {
  skyTop: '#DCE6F2',
  skyBottom: '#F8F1E1',
  hillFar: '#A9C2AE',
  hillMid: '#7FA68B',
  ground: '#5E8C6C',
  groundShade: '#4C775A',
  castle: '#BCC8CF',
  water: '#6F9CC4',
  waterLight: '#A9CBE6',
  stone: '#E4DACB',
  stoneShade: '#BFB2A0',
  wood: '#A9784A',
  woodShade: '#7E5532',
  leaf: '#2F7A52',
  leafLight: '#5BA77A',
  mist: '#FFFFFF',
  ivory: '#F8F1E1',
}

export const NIGHT: ScenePalette = {
  skyTop: '#0F1230',
  skyBottom: '#2A3170',
  hillFar: '#2C366E',
  hillMid: '#222B5E',
  ground: '#1B2350',
  groundShade: '#151C43',
  castle: '#3A4689',
  water: '#2D4A8C',
  waterLight: '#4F6FB0',
  stone: '#8C8FB5',
  stoneShade: '#64689A',
  wood: '#7A5A52',
  woodShade: '#5A4040',
  leaf: '#2D6E5E',
  leafLight: '#4C9383',
  mist: '#C9C4F0',
  ivory: '#F8F1E1',
}

export const GOLD = '#D4A23F'
export const GOLD_LIGHT = '#F1D58A'
export const JEWELS = { safira: '#2550B8', ametista: '#7A3BA6', esmeralda: '#1D7350', topazio: '#B0501A' }
export const FLOWERS = ['#C2577A', '#E39A3B', '#7A3BA6', '#F1D58A', '#2550B8']
