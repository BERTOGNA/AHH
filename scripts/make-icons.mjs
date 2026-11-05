// Gera os ícones PNG do PWA a partir de public/icon.svg usando o Chromium do Playwright.
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
// Usa o Playwright local, se houver, ou o global da máquina.
const { chromium } = require('playwright')
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const svg = readFileSync(resolve('public/icon.svg'), 'utf8')
const targets = [
  { file: 'icon-192.png', size: 192, pad: 0 },
  { file: 'icon-512.png', size: 512, pad: 0 },
  { file: 'icon-maskable-512.png', size: 512, pad: 0 },
  { file: 'apple-touch-icon.png', size: 180, pad: 0 },
]
const browser = await chromium.launch()
const page = await browser.newPage()
for (const t of targets) {
  await page.setViewportSize({ width: t.size, height: t.size })
  await page.setContent(
    `<style>html,body{margin:0;background:#1c1233}svg{width:${t.size}px;height:${t.size}px;display:block}</style>${svg}`,
  )
  await page.screenshot({ path: resolve('public', t.file), omitBackground: false })
  console.log('ok', t.file)
}
await browser.close()
