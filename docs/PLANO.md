# Plano consolidado do MVP — Reino da Família

Este é o documento que manda. Ele junta os três documentos de especialistas
(`docs/design/game-design.md`, `docs/design/ux-design.md`, `docs/design/architecture.md`)
e resolve as contradições entre eles. Quando um documento de especialista discordar
deste plano, vale este plano.

## 1. Conflitos resolvidos

| Tema | Opções nos documentos | Decisão | Por quê |
|---|---|---|---|
| Nome padrão do reino | "Reino de Aurora" (GD) × "Reino dos {sobrenome}" (UX) | Sugestão **"Reino de Aurora"**, editável no passo 1 | Funciona sem sobrenome e combina com a história |
| Cor do herói | Cor por classe (GD) × cor por *slot* do perfil (UX) | **Cor por slot**, a paleta AA da UX (`#1E5AA8`, `#8A3B9E`, `#23744A`, `#B8410E`); a classe dá só ícone e nome | Contraste já verificado; duas pessoas da mesma classe continuam distinguíveis |
| Curva de nível | `50·n·(n−1)` (ARQ) × `50 + 25·(n−1)` por nível (GD) | **GD**: total para nível n = `50(n−1) + 12,5(n−1)(n−2)`, máximo 50, depois Estrela de Lenda a cada 1.000 XP | Calibrada contra o XP semanal real dos templates |
| Moedas | `floor(XP total/5)` (ARQ) × 1 XP = 1 moeda (UX) × XP÷5 por tarefa (GD) | **GD**: cada tarefa validada dá `xp/5` moedas, mentoria dá +1; agradecimentos e bônus não dão moedas | Custos das recompensas (10–200) foram calibrados assim |
| Recompensas do onboarding | Custos 40–150 (UX) | Custos da escala GD (10–180) | Coerência com a economia |
| Mentoria | 50% do XP (ARQ) × card com as missões do irmão (UX) × só tarefas já feitas, +5 XP/+1 moeda, até 3/dia (GD) | **GD**. O mentor vê apenas tarefas do irmão já marcadas e toca "🤝 Eu ajudei"; o de 6 anos também pode apontar "Alguém te ajudou?" | Evita fiscalização: o mentor nunca vê o que está em aberto |
| Agradecimento | +5 XP para quem recebe (ARQ) × +2/+2 nos 5 primeiros envios do dia (GD) | **GD, com limites independentes**: +2 para quem envia (até 5 envios/dia) e +2 para quem recebe (até 5/dia vindos do mesmo remetente) | Valoriza também quem agradece. O teste de monotonicidade mostrou que um limite dependente da ordem podia tirar XP de alguém ao importar registros antigos |
| Streak | Dias seguidos com 1 folga (UX) × "Chamas da Semana", sem dias seguidos (GD) | **GD**: 7 lareiras por semana; 5 acesas = Semana Acesa (+15 XP). Contadores de longo prazo só sobem | Não existe sequência para "quebrar" |
| Meta da missão | 70% (ARQ) × 60% arredondado a 50, entre 300 e 3.000 (GD) | **GD** | |
| Bônus de missão | +30 XP (ARQ) × nenhum (GD) | **Nenhum**; a recompensa da missão é coletiva e real | Evita dobrar a recompensa |
| Dias da semana | 0–6 × ISO 1–7 | **ISO 1 = seg … 7 = dom**, semana começa na segunda | |
| Devolver tarefa | "Ainda não" (GD) × "Devolver" (UX) | Botão **"Ainda não"** nos pais: apaga a marcação, sem nenhum registro | Não pode haver estado de falha |
| Tarefas dos pais | Autovalidação | Quando um adulto marca (inclusive uma tarefa em dupla com o filho), ela já nasce validada | O adulto está presente e atesta |
| Tela do herói adulto | Exige PIN (UX) | Exige PIN; as crianças veem os pais no Salão, no Mural e na Semana | |

## 2. Simplificações deliberadas do MVP (registradas)

- **Mover tarefa na Semana muda a recorrência** ("todas as semanas"). Não existe exceção "só esta semana", que exigiria um modelo de exceções.
- **Tema "Noite"** (escuro) fica fora do MVP. Só o tema Pergaminho.
- **A Crônica da Semana** não é uma sequência animada de cartões: o próprio **Mural** é a crônica (missão, uma faixa por herói, Bastidores do Reino, mentorias e agradecimentos). Aos domingos, o Salão mostra o atalho "Crônica da Semana" para o Mural.
- **Mapa do Reino**: lista com cada lugar já visitado pelas missões e o maior estágio alcançado, tudo derivado das semanas anteriores.
- **Recompensa coletiva** só em 100%. A mini-celebração de 50% é apenas visual.
- **"Ritual do Selo"**: em vez de lembrete com horário, o Salão mostra um botão de selo com o número de pendentes, que abre o Painel dos Pais.
- **Baú dos adultos**: desligado por padrão, liga em Ajustes.
- **Tarefas "sob demanda"** dos adultos (consulta médica, reunião da escola) entram como atalhos do botão **"Registrar feito invisível"**.

## 3. Modelo de dados (resumo; os tipos ficam em `src/db/types.ts`)

- `members` — nome, papel (`adult`/`teen`/`child`), idade, tratamento (`o`/`a`), classe, papel no reino, slot de cor (0–3), avatar (emoji base + itens equipados por slot), voz ligada, ordem.
- `routines` — bloco de rotina (acordar, escola, trabalho, refeição, livre, dormir) com dias ISO, início e fim.
- `tasks` — tarefa recorrente: título, emoji, frase falada, categoria, tipo (`individual`/`shared`/`household`), responsáveis, dias, horário opcional, duração, XP, "proposta por" (12 anos).
- `completions` — o fato real. O id é determinístico (`taskId|data|slot`). Guarda cópia de título, emoji, categoria e tipo, os membros, o mentor (`helperId`), o status (`done`/`validated`) e o XP. Feitos invisíveis usam `taskId = adhoc:<uuid>`.
- `rewards`, `redemptions` (`requested` → `approved` → `delivered`, ou `returned` = moedas devolvidas).
- `thanks`, `unlocks` (conquistas, append-only), `missions` (uma por semana), `settings` (singleton).

**XP e moedas são derivados** das tabelas por funções puras em `src/domain/economy.ts`, nunca guardados no membro. Nenhuma função subtrai XP.

## 4. Telas e rotas (hash)

`#/` Salão · `#/heroi/:id` Aventura · `#/semana` · `#/bau` · `#/mural` · `#/ficha/:id` · `#/pais` · `#/bem-vindo`.

## 5. Fatias de construção

1. Dados e perfis (DB, seed de exemplo, Salão, troca de perfil, PIN)
2. Agenda semanal (grade tablet, linha do tempo celular, edição por arrastar e por formulário)
3. Tarefas e validação (Aventura 6, 12 e adulto, Painel dos Pais › Pendentes, mentoria)
4. Progressão (níveis, conquistas, itens, Ficha, celebração)
5. Recompensas (Baú, pedidos, aprovação)
6. Missão e Mural (missão semanal, agradecimentos, Mural/Crônica)
7. Onboarding (assistente de 8 passos → semana gerada → grade)
8. PWA e backup (service worker offline, persistência, exportar/importar JSON)

Cada fatia termina com `npm run build` e `npm test` verdes e verificação no navegador (Playwright).
