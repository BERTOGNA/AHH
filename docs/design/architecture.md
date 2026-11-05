# Reino da Família — Arquitetura técnica (MVP)

Documento curto e decisivo. Fonte do produto: brief. Tudo aqui roda 100% no aparelho, sem backend.

## 1. Stack (versões exatas, verificadas no registry em 2026-11-05)

| Pacote | Versão | Por quê |
|---|---|---|
| vite | 8.3.5 | build/dev; peer de todos os plugins abaixo aceita `^8` |
| react / react-dom | 19.3.1 | |
| typescript | 5.9.3 | já no package.json; TS 7 (port nativo) é recente demais para o ecossistema — não vale o risco |
| tailwindcss + @tailwindcss/vite | 4.3.4 | plugin peer: `vite ^5.2 \|\| ^6 \|\| ^7 \|\| ^8` ✔. Tokens via `@theme` no CSS, sem tailwind.config |
| @vitejs/plugin-react | 6.2.1 | peer `vite ^8` ✔ |
| dexie / dexie-react-hooks | 4.4.7 / 4.4.0 | IndexedDB tipado + `useLiveQuery` reativo (UI atualiza sozinha após escrita) |
| vite-plugin-pwa | 1.3.0 | peer `vite ... \|\| ^8` ✔; puxa workbox-build/window 7.4.1. **Não** usar 2.0.0 (major de out/2026, sem ganho para nós) |
| vitest | 5.1.0 | lógica pura + camada de DB com `fake-indexeddb@6.2.7` |
| @playwright/test | **1.63.0** (adicionar) | casa com o Playwright global 1.63.0 e os browsers já em `/opt/pw-browsers` (`PLAYWRIGHT_BROWSERS_PATH` já setado). Não rodar `playwright install` |

Sem lib de estado, sem date-fns, sem router de terceiros, sem lib de ícones (emoji + SVG inline).

**Roteamento: roteador mínimo por hash** (`#/semana`, `#/heroi/<id>`). Não precisa de fallback de navegação no service worker, funciona em `file://`/qualquer host estático, ~25 linhas:

```ts
// src/router.ts
import { useSyncExternalStore } from 'react';
export type Route =
  | { name: 'reino' } | { name: 'semana' } | { name: 'hoje'; memberId: string }
  | { name: 'heroi'; memberId: string } | { name: 'bau' } | { name: 'mural' }
  | { name: 'pais' } | { name: 'onboarding' } | { name: 'config' };

export function parse(hash: string): Route {
  const [a, b] = hash.replace(/^#\/?/, '').split('/');
  switch (a) {
    case 'semana': case 'bau': case 'mural': case 'pais': case 'onboarding': case 'config':
      return { name: a };
    case 'hoje': case 'heroi': if (b) return { name: a, memberId: b };
  }
  return { name: 'reino' };
}
const sub = (cb: () => void) => (addEventListener('hashchange', cb), () => removeEventListener('hashchange', cb));
export const useRoute = () => parse(useSyncExternalStore(sub, () => location.hash));
export const go = (path: string) => { location.hash = path; };
```

Estado de sessão (fora do DB): `AppContext` com `currentMemberId` (persistido em `localStorage`, só conveniência) e `adultUnlocked` (só em memória; trava ao trocar de perfil, ao `visibilitychange→hidden` e após 5 min sem interação).

## 2. Modelo de dados

Convenções: ids `crypto.randomUUID()`; datas locais `"YYYY-MM-DD"`; horas `"HH:MM"`; timestamps `number` (ms epoch); dia da semana ISO `1=seg … 7=dom`.

```ts
// src/db/types.ts
export type Role = 'adult' | 'teen' | 'child';
export type Weekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type ISODate = string;   // "2026-11-05"
export type HHMM = string;      // "07:30"
export type WeekKey = string;   // "2026-W45" (ISO, segunda a domingo)

export interface Member {
  id: string; name: string; role: Role; age: number;
  classId: string;                       // data/classes.ts (guardiã, mago, bardo…)
  kingdomRole: string;                   // "Guardiã da Cozinha" — papel no reino, texto livre
  color: string;                         // token de cor (ex.: 'ember'), não hex solto
  avatar: { base: string; equipped: Partial<Record<ItemSlot, string>> }; // emoji base + itemIds
  mentorOf?: string[];                   // ids que este membro pode ajudar (12a → 6a)
  order: number; createdAt: number;
}
export type ItemSlot = 'head' | 'hand' | 'cape' | 'pet';

export type RoutineKind = 'wake' | 'school' | 'work' | 'free' | 'sleep' | 'meal' | 'other';
export interface RoutineBlock {
  id: string; memberId: string; kind: RoutineKind; label?: string;
  weekdays: Weekday[]; start: HHMM; end: HHMM;   // end < start = cruza meia-noite (sono)
}

export type TaskKind = 'individual' | 'shared' | 'household';
export interface Task {                         // template recorrente semanal
  id: string; title: string; emoji: string; category: string;
  kind: TaskKind; assigneeIds: string[];        // household: [] = qualquer um
  weekdays: Weekday[]; time?: HHMM; xp: number;
  active: boolean; createdAt: number;
}

export type CompletionStatus = 'done' | 'validated';
export interface Completion {
  id: string;            // determinístico: `${taskId}|${date}|${slot}` → put idempotente
  taskId: string; date: ISODate;
  memberIds: string[];   // quem fez (shared: os dois; household: quem fez)
  helperId?: string;     // mentor que ajudou
  status: CompletionStatus;
  xp: number;            // SNAPSHOT do task.xp no momento — editar a tarefa não reescreve o passado
  doneAt: number; validatedAt?: number; validatedBy?: string;
}

export interface Reward { id: string; title: string; emoji: string; cost: number; active: boolean; createdAt: number }
export type RedemptionStatus = 'requested' | 'approved' | 'delivered';
export interface Redemption {
  id: string; rewardId: string; memberId: string; cost: number; // snapshot do custo
  status: RedemptionStatus; requestedAt: number; approvedAt?: number; deliveredAt?: number;
}
export interface Thanks { id: string; fromId: string; toId: string; message: string; taskId?: string; date: ISODate; createdAt: number }
export interface AchievementUnlock { memberId: string; achievementId: string; unlockedAt: number; seen: boolean }
export interface Mission { weekKey: WeekKey; templateId: string; goalXp: number; finishedAt?: number }
export interface Settings {
  id: 'app'; kingdomName: string; pinHash?: string; pinSalt?: string;
  onboardingDone: boolean; speechEnabled: boolean; demo: boolean;
}
```

Slot da completion: `individual` → `memberId` (cada responsável tem a sua); `shared` e `household` → `'all'` (uma por dia).

```ts
// src/db/db.ts
import Dexie, { type EntityTable } from 'dexie';
export const db = new Dexie('reino-da-familia') as Dexie & {
  members: EntityTable<Member, 'id'>; routines: EntityTable<RoutineBlock, 'id'>;
  tasks: EntityTable<Task, 'id'>; completions: EntityTable<Completion, 'id'>;
  rewards: EntityTable<Reward, 'id'>; redemptions: EntityTable<Redemption, 'id'>;
  thanks: EntityTable<Thanks, 'id'>; unlocks: Dexie.Table<AchievementUnlock, [string, string]>;
  missions: EntityTable<Mission, 'weekKey'>; settings: EntityTable<Settings, 'id'>;
};
db.version(1).stores({
  members: 'id',
  routines: 'id, memberId',
  tasks: 'id',                                  // booleano não é indexável; filtrar em memória
  completions: 'id, date, taskId, status, *memberIds',
  rewards: 'id',
  redemptions: 'id, memberId, status',
  thanks: 'id, date, toId',
  unlocks: '[memberId+achievementId], memberId',
  missions: 'weekKey',
  settings: 'id',
});
export const SCHEMA_VERSION = 1;
```

### Decisão: instâncias de tarefa sob demanda (não pré-gerar)
"Tarefas de hoje" = `tasks` ativas cujo `weekdays` contém o dia + `completions` daquela data. Motivos: editar uma recorrência vale imediatamente sem reconciliar instâncias órfãs; nada a gerar quando o app fica dias fechado; backup menor; a única coisa persistida é o fato real (alguém fez). Tarefa não feita simplesmente não tem registro — nunca existe estado "falhou".

```ts
// src/domain/schedule.ts
export interface Occurrence { task: Task; date: ISODate; slot: string; completion?: Completion }
export function occurrencesFor(date: ISODate, tasks: Task[], completions: Completion[], memberId?: string): Occurrence[];
export const completionId = (taskId: string, date: ISODate, slot: string) => `${taskId}|${date}|${slot}`;
```

### Decisão: XP e moedas DERIVADOS (não armazenados em Member)
Robusto a bugs (não existe contador dessincronizado), backup/import trivial, e torna "sem punição" verificável por construção. Volume é minúsculo (4 pessoas × ~5 tarefas × 365 dias ≈ 7 mil linhas/ano) — somar em memória custa microssegundos. Por isso `Member` **não** tem `xp`/`coins`.

```ts
// src/domain/economy.ts — funções puras
export const XP = { thanksReceived: 5, mentorShare: 0.5, missionBonus: 30 } as const;
export const coinsFromXp = (xp: number) => Math.floor(xp / 5);   // 10 XP = 2 moedas

export function xpOf(memberId: string, d: { completions: Completion[]; thanks: Thanks[]; missions: Mission[] }): number;
//  Σ completion.xp (validated, memberId ∈ memberIds)
//+ Σ round(completion.xp × mentorShare) (validated, helperId === memberId)
//+ thanksReceived × nº de thanks para o membro (máx. 3 contados por remetente/dia)
//+ missionBonus × nº de missões com finishedAt
export function coinsOf(memberId: string, d: {...; redemptions: Redemption[] }): number;
//  coinsFromXp(xpGanho) − Σ redemption.cost (status approved|delivered)
export function canAfford(memberId: string, reward: Reward, d: ...): boolean; // saldo − pedidos pendentes ≥ cost
```

Hook único: `useEconomy(memberId)` = `useLiveQuery` sobre as 4 tabelas + `xpOf/coinsOf/levelOf`.

### Conquistas
Regras puras em `data/achievements.ts` (`{ id, title, emoji, test(ctx): boolean }`); `domain/achievements.ts#newlyUnlocked(memberId, ctx, unlocks)` devolve as novas. Após cada validação, `actions.validate` grava as novas em `unlocks` (append-only, nunca apagadas) → a tela mostra celebração das `seen=false`. Itens de avatar (`data/items.ts`) são desbloqueados por nível ou conquista — derivado; só o que está **equipado** é salvo.

### Níveis
```ts
// src/domain/levels.ts — nível n exige 50·n·(n−1) XP: 1→0, 2→100, 3→300, 4→600, 5→1000
export const xpForLevel = (n: number) => 50 * n * (n - 1);
export function levelOf(xp: number): { level: number; into: number; span: number };
```

## 3. PIN dos pais
**Proteção contra criança curiosa, não segurança real** (os dados estão no aparelho, qualquer adulto com DevTools lê tudo). 4 dígitos, SHA-256 com salt aleatório:

```ts
// src/lib/pin.ts
const hex = (b: ArrayBuffer) => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
export async function hashPin(pin: string, salt = hex(crypto.getRandomValues(new Uint8Array(16)).buffer)) {
  const h = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${salt}:${pin}`));
  return { salt, hash: hex(h) };
}
export const checkPin = async (pin: string, s: Settings) => (await hashPin(pin, s.pinSalt)).hash === s.pinHash;
```
"Esqueci o PIN": pergunta-desafio adulta (ex.: soma de dois números de 2 dígitos) e permite redefinir. Nada de bloqueio por tentativas.

## 4. Estrutura de pastas
```
src/
  main.tsx  App.tsx  router.ts  state.tsx (AppContext)  index.css (@import "tailwindcss"; @theme tokens)
  db/       db.ts  types.ts  actions.ts (todas as escritas)  hooks.ts (useLiveQuery)  backup.ts  seed.ts
  domain/   levels.ts  achievements.ts  schedule.ts  week.ts  economy.ts   (+ *.test.ts ao lado)
  screens/  Kingdom.tsx  Week.tsx  Today.tsx  Hero.tsx  Chest.tsx  Mural.tsx  Parents.tsx  Settings.tsx  onboarding/
  components/  Avatar.tsx  TaskCard.tsx  BigButton.tsx  PinPad.tsx  Celebration.tsx  ProgressBar.tsx  …
  lib/      date.ts  speech.ts  haptics.ts  pin.ts  persist.ts
  data/     classes.ts  templates.ts (tarefas por faixa etária)  missions.ts  achievements.ts  items.ts  demoFamily.ts
scripts/make-icons.mjs        public/icons/*.png + icon.svg        e2e/*.spec.ts
```
Regras: `domain/` não importa React nem Dexie (só tipos). Telas leem via hooks e escrevem só via `db/actions.ts`. Sem barrel files.

## 5. Datas (sem libs)
Sempre data **local**; nunca `toISOString()` para datas (vira UTC e muda o dia à noite no Brasil).

```ts
// src/lib/date.ts
export const toISODate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const parseISODate = (s: ISODate) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d, 12); }; // meio-dia: imune a DST
export const today = () => toISODate(new Date());
export const isoWeekday = (s: ISODate) => (((parseISODate(s).getDay() + 6) % 7) + 1) as Weekday; // seg=1
export const addDays = (s: ISODate, n: number) => { const d = parseISODate(s); d.setDate(d.getDate() + n); return toISODate(d); };
export const weekStart = (s: ISODate) => addDays(s, 1 - isoWeekday(s));          // segunda
export const weekDates = (s: ISODate) => Array.from({ length: 7 }, (_, i) => addDays(weekStart(s), i));
export function weekKey(s: ISODate): WeekKey; // ISO-8601: ano da quinta-feira da semana + nº da semana
export const minutes = (t: HHMM) => +t.slice(0, 2) * 60 + +t.slice(3);
```
Semana começa **sempre na segunda** (padrão BR/ISO). Não há `weekStartsOn` configurável no MVP — removido do Settings para não ter dois caminhos.

## 6. "Sem punição" garantido no código
- Nenhuma função subtrai XP. `xpOf` é soma de termos ≥ 0; teste Vitest verifica monotonicidade (adicionar qualquer registro nunca diminui XP).
- Moedas só diminuem por `Redemption` aprovada — escolha do próprio membro, confirmada pelo pai.
- Desmarcar só é possível **antes** da validação (a criança errou o toque). Validação é final; após validar, o pai tem um toast "Desfazer" de 5 s (corrige clique errado, não pune).
- Não existe status `missed`/`failed`; ausência de registro = "ainda não". Missão não concluída não é exibida como falha: a semana seguinte começa nova e a cena mostra o quanto foi restaurado.
- Nenhuma consulta ordena membros por XP; o Mural soma contribuições lado a lado, sem posição.

## 7. Offline / PWA
```ts
// vite.config.ts
import { defineConfig } from 'vite'; import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'; import { VitePWA } from 'vite-plugin-pwa';
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), VitePWA({
    registerType: 'autoUpdate', injectRegister: 'auto',
    workbox: { globPatterns: ['**/*.{js,css,html,svg,png,woff2,webmanifest}'], cleanupOutdatedCaches: true },
    includeAssets: ['icons/icon.svg', 'icons/apple-touch-icon.png'],
    manifest: {
      name: 'Reino da Família', short_name: 'Reino', lang: 'pt-BR', description: 'A casa funciona porque cada um faz a sua parte.',
      start_url: './', scope: './', display: 'standalone', orientation: 'any',
      background_color: '#1b1430', theme_color: '#1b1430',
      icons: [
        { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
  })],
});
```
- **Ícones**: um `public/icons/icon.svg` (desenhado à mão, emoji/forma de castelo). `scripts/make-icons.mjs` usa o Playwright **global** via `createRequire` (import ESM do global falha; `require` resolve por `NODE_PATH`): abre página com o SVG em `<img>` no tamanho alvo e faz `screenshot` → `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` (180), `maskable-512.png` (SVG com 20% de padding sobre fundo sólido). PNGs são **commitados**; o script só roda quando o SVG muda (`npm run icons`).
  ```js
  import { createRequire } from 'node:module'; const { chromium } = createRequire(import.meta.url)('playwright');
  ```
- **Fontes**: sem CDN. Fonte de sistema para texto; se o design quiser fonte display, usar pacote `@fontsource/*` importado em `main.tsx` (vira woff2 no bundle → precache).
- **Persistência**: `lib/persist.ts` chama `navigator.storage?.persist?.()` ao concluir o onboarding e mostra o estado em Config ("dados protegidos" / "faça backup com frequência"). Sem garantia no Safari → reforçar o backup.
- Atualização: `autoUpdate` recarrega na próxima abertura; nenhum dado vive no SW, então é seguro.

## 8. Backup
```ts
// src/db/backup.ts
export interface Backup { app: 'reino-da-familia'; version: number; exportedAt: string; data: Record<TableName, unknown[]> }
export async function exportBackup(): Promise<Blob>;   // todas as tabelas → JSON.stringify(…, null, 2)
export function download(blob: Blob, name = `reino-backup-${today()}.json`) {
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: name });
  a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
export function parseBackup(text: string): Backup;     // lança Error com mensagem pt-BR
export async function importBackup(b: Backup) {
  await db.transaction('rw', db.tables, async () => {
    for (const t of db.tables) { await t.clear(); await t.bulkAdd((b.data as any)[t.name] ?? []); }
  });
}
```
Validação de `parseBackup`: JSON válido; `app` correto; `version ≤ SCHEMA_VERSION` (se menor, passar por `migrateBackup(b)`); cada tabela conhecida é array; cada linha tem a chave primária; existe `settings` com `id: 'app'`. UI (modo adulto): `<input type="file" accept="application/json">` → mostra resumo ("4 heróis, 23 tarefas, exportado em 03/11") → confirmação explícita "Substituir tudo" → import em transação única (falhou = nada muda).

## 9. Fatias verticais (cada uma termina com build verde, testes verdes e demo no navegador)
1. **Dados + perfis** — schema Dexie, tipos, `seed.ts`, tela Reino com os 4 heróis (avatar, classe, papel), troca de perfil, PIN pad. *Pronto:* recarregar mantém dados; PIN errado não abre modo pais; teste de `hashPin/checkPin`.
2. **Agenda semanal** — `Week.tsx`: grade seg–dom, colunas por membro, blocos de rotina + tarefas com horário; edição de blocos (modo pais). *Pronto:* sobreposições visíveis; testes de `date.ts` (virada de ano, DST, `weekKey` 2026-12-31 → 2026-W53) e de `schedule.ts`.
3. **Tarefas e validação** — `Today.tsx` por membro (cards grandes, voz, vibração), marcar feito, fila de validação em Parents (validar com um toque, inclusive as próprias), mentoria (`helperId`). *Pronto:* criança de 6 conclui sem ler; completion idempotente; desmarcar só antes de validar; e2e marca→valida.
4. **Progressão** — níveis, conquistas, itens/equipar, celebração. *Pronto:* testes de `levels`, `economy` (monotonicidade), `achievements`; XP pendente aparece como "esperando o selo".
5. **Recompensas** — Baú: CRUD (pais), pedir resgate, aprovar, entregar. *Pronto:* saldo nunca negativo (`canAfford` considera pendentes); teste de `coinsOf`.
6. **Missão e Mural** — missão criada sob demanda ao abrir a semana (`goalXp ≈ 70% do XP planejado`, rotação de `data/missions.ts`); agradecimentos; Mural com contribuição por membro, incluindo tarefas dos pais. *Pronto:* nenhuma ordenação/ranking; missão concluída grava `finishedAt` uma vez.
7. **Onboarding** — botão "Usar família de exemplo" + assistente (nome do reino, membros, horários, trabalho/estudo, tarefas da casa, tarefas por criança a partir de `templates.ts`) → `week.ts#generateWeek(answers)` (pura, testada) → grade editável. *Pronto:* fluxo completo em < 3 min no e2e.
8. **PWA e backup** — manifest, ícones, SW, `persist()`, export/import. *Pronto:* e2e: build + `vite preview`, aguarda SW, `context.setOffline(true)`, recarrega e a app abre com dados; roundtrip export→clear→import idêntico (Vitest + fake-indexeddb).

## 10. Testes
- `vitest` (ambiente `node`) para `src/domain/**` e `src/lib/date.ts`; `src/db/*.test.ts` com `import 'fake-indexeddb/auto'`.
- `e2e/` com `@playwright/test@1.63.0`, `webServer: { command: 'npm run build && npx vite preview --port 4173', port: 4173 }`, projeto único Chromium em viewport de tablet (820×1180) + um de celular (390×844). Cada teste começa com "Usar família de exemplo".

## 11. Família de exemplo (seed)
`data/demoFamily.ts` + `db/seed.ts#seedDemo()`: limpa tudo e cria, em uma transação, o reino **"Reino dos Oliveira"**: Ana (adult, 38, Guardiã da Despensa), Bruno (adult, 40, Ferreiro das Contas), Léo (teen, 12, Mago Mentor), Bia (child, 6, Fada dos Brinquedos); rotinas típicas (acordar 6:30/7:00, escola 7:30–12:30, trabalho 9–18, dormir 20:30 Bia / 22:00 Léo); ~14 tarefas (4/dia para Bia, incluindo tarefas dos pais: "Pagar contas", "Fazer o jantar"); 5 recompensas; e histórico **relativo a hoje** (últimos 3 dias com completions validadas, 2 agradecimentos, 1 resgate pedido) para Mural, níveis e fila de validação terem conteúdo. Marca `settings.demo = true` e `onboardingDone = true`; Config oferece "Começar do zero".
