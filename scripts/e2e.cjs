// Passeio de ponta a ponta no navegador. Rode com o preview no ar: `npm run preview` e depois `npm run e2e`.
// Usa o Playwright instalado (local ou global: NODE_PATH=$(npm root -g)).
const { chromium } = require('playwright')
const fs = require('fs')
const os = require('os')
const path = require('path')

const BASE = process.env.BASE_URL || 'http://localhost:4173/'
const ok = (cond, msg) => {
  if (!cond) throw new Error(`✗ ${msg}`)
  console.log(`✓ ${msg}`)
}
async function closeCelebrations(page) {
  await page.waitForTimeout(500)
  for (let i = 0; i < 6; i++) {
    await page.waitForTimeout(150)
    const c = page.getByRole('button', { name: 'Continuar ✦' })
    if (await c.isVisible().catch(() => false)) await c.click()
    else break
  }
}
async function pin(page) {
  for (const d of '1234') await page.getByRole('button', { name: d, exact: true }).click()
}

;(async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'reino-e2e-'))
  let ctx = await chromium.launchPersistentContext(dir, { viewport: { width: 1180, height: 820 } })
  let page = ctx.pages()[0] || (await ctx.newPage())
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))

  await page.goto(BASE)
  await page.getByRole('button', { name: /família de exemplo/i }).click()
  await page.waitForURL(/#\/$/)
  ok((await page.getByRole('button', { name: /^(Ana|Bruno|Léo|Bia),/ }).count()) === 4, 'Salão mostra os 4 heróis')

  // Criança de 6 anos marca uma missão só com toques
  await page.getByRole('button', { name: /^Bia,/ }).click()
  await closeCelebrations(page)
  const mark = page.getByRole('button', { name: /^Marcar como feita/ }).first()
  const box = await mark.boundingBox()
  ok(box && box.width >= 64 && box.height >= 64, `botão de marcar da criança tem ${box?.width}×${box?.height}px`)
  await mark.click()
  await page.getByRole('button', { name: /Esperando o selo/ }).first().waitFor()
  ok(true, 'missão da criança fica "esperando o selo"')

  // Pai valida
  await page.goto(BASE + '#/')
  await page.getByRole('button', { name: /^Ana,/ }).click()
  await pin(page)
  await closeCelebrations(page)
  await page.goto(BASE + '#/pais')
  await page.getByRole('button', { name: /^Validar: / }).first().waitFor()
  const before = await page.getByRole('button', { name: /^Validar: / }).count()
  await page.getByRole('button', { name: /^Validar: / }).first().click()
  await page.waitForTimeout(300)
  ok((await page.getByRole('button', { name: /^Validar: / }).count()) === before - 1, 'validar com um toque tira a tarefa da fila')

  // Feito invisível do adulto aparece no Mural
  await page.goto(BASE + '#/heroi/ana')
  await closeCelebrations(page)
  await page.getByRole('button', { name: /Registrar feito invisível/ }).click()
  await page.getByRole('button', { name: /Levei ao médico/ }).click()
  await page.waitForTimeout(300)
  await page.goto(BASE + '#/mural')
  await page.waitForTimeout(300)
  if (process.env.DEBUG) await page.screenshot({ path: 'e2e-debug.png', fullPage: true })
  ok(await page.getByText('Levei ao médico').first().isVisible(), 'feito invisível aparece no Mural (Bastidores do Reino)')

  // Persistência + offline
  await page.evaluate(() => navigator.serviceWorker.ready)
  await page.waitForTimeout(1000)
  await ctx.close()
  ctx = await chromium.launchPersistentContext(dir, { viewport: { width: 390, height: 844 } })
  page = ctx.pages()[0] || (await ctx.newPage())
  await page.goto(BASE)
  await page.waitForTimeout(800)
  await ctx.setOffline(true)
  await page.reload()
  await page.locator('h1').first().waitFor()
  ok((await page.locator('h1').first().textContent()).includes('Reino dos Oliveira'), 'abre offline com os dados depois de fechar e reabrir')
  ok((await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)), 'sem rolagem horizontal no celular')
  await ctx.close()

  ok(errors.length === 0, `sem erros de página${errors.length ? ': ' + errors.join(' | ') : ''}`)
  fs.rmSync(dir, { recursive: true, force: true })
})().catch((e) => {
  console.error(e.message)
  process.exit(1)
})
