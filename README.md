# Reino da Família

Agenda semanal e jogo de aventura para a família inteira. A casa é o **reino**, cada pessoa é um **herói** da mesma party — pais incluídos — e a história só avança quando cada um faz a sua parte.

PWA instalável, feito para tablet e celular, que funciona offline. **Nenhum dado sai do aparelho**: sem conta, sem login, sem servidor.

## Como rodar

Requer Node 20+.

```bash
npm install
npm run dev        # desenvolvimento: http://localhost:5173
npm test           # testes da lógica do jogo e do banco (Vitest)
npm run build      # build de produção em dist/ (com service worker)
npm run preview    # serve o build: http://localhost:4173
npm run e2e        # passeio completo no navegador (precisa do preview rodando e do Playwright)
```

Para instalar no tablet/celular, sirva o `dist/` por **https** (qualquer hospedagem estática; o app usa caminhos relativos e roteamento por `#`) e use "Adicionar à tela inicial". Em `localhost` o service worker também funciona.

> Para gerar de novo os ícones depois de mudar `public/icon.svg`: `NODE_PATH=$(npm root -g) npm run icons` (usa o Chromium do Playwright).

## Como usar

1. **Primeira abertura** — escolha **Começar** (assistente de 8 passos, ~3 minutos: quem mora no reino, heróis, horários, escola/trabalho, quem cuida do quê, baú e missão, PIN dos pais, revisão da semana) ou **Usar família de exemplo** para conhecer o app (PIN `1234`).
2. **Salão do Reino** (tela inicial) — os quatro heróis lado a lado, o que cada um está fazendo agora, a Missão da Família e os últimos agradecimentos. Toque no seu herói para jogar. Crianças entram direto; adultos digitam o PIN.
3. **Aventura de hoje**
   - **6 anos**: cartões grandes com ícone, toque para ouvir, toque no círculo para marcar. Cai um selo ⏳; quando os pais validam, vira ⭐. Nada precisa ser lido.
   - **12 anos**: lista das tarefas, Chamas da Semana, "Minha semana" (planeja, move e propõe tarefas próprias) e "Mentoria" (registra quando ajudou o irmão).
   - **Adultos**: as próprias tarefas (validadas na hora, diante da família) e **Registrar feito invisível** — contas, médico, escola, compras — que aparece no Mural.
4. **Painel dos Pais** (🔒 Pais / Ritual do Selo) — validar com um toque (com Desfazer), "Validar todas", "Ainda não" (devolve sem registro negativo), pedidos do Baú, tarefas, recompensas, heróis, missão e ajustes.
5. **Semana** — grade da família (dias × horas, uma faixa por pessoa, faixas douradas "✦ Juntos" onde os horários se cruzam). No modo pais, segure e arraste para mover; ou toque para editar, ±15 min e "Mover para…".
6. **Baú** — trocar moedas por recompensas reais definidas pelos pais. Trocar nunca reduz XP nem nível.
7. **Mural do Reino** — o que cada um fez na semana, em linguagem de fantasia, com os **Bastidores do Reino** (trabalho invisível dos adultos), mentorias, agradecimentos e o Mapa do Reino.

### Novidades depois do MVP

- **Heróis ilustrados**: cada membro monta o seu personagem (pele, cabelo, rosto, detalhes) na Ficha → Personalizar; a roupa vem da classe.
- **Ilustrações das tarefas** em todos os cartões, listas e na grade.
- **Crônica da Semana** (Mural → Crônica): a semana contada em cartões narrados.
- **Missão que evolui**: cada estágio que a família cruza é celebrado com a cena nova.
- **Exceções da semana**: na Semana, toque numa tarefa → "Neste dia não precisa" ou mova escolhendo "Só nesta semana".
- **Instalar no aparelho**: botão na abertura e em Ajustes (no iPhone/iPad, instruções do "Adicionar à Tela de Início").
- **Lembrete de backup** gentil para os pais a cada 14 dias.
- **Sugestões para o 12 anos** assumir tarefas extras na própria semana.
- **Tema noite** (Ajustes › Aparência: Claro, Noite ou Automático das 19h às 6h).
- **Quadro da semana para imprimir** (Semana → Imprimir quadro): uma folha A4 para a geladeira; para os pequenos, só desenhos.
- **Compromissos pontuais** na Semana (consulta, aniversário, reunião): valem só na data marcada.
- **"Como fazer?"**: passo a passo curto em cada tarefa (lido em voz alta para a criança; lista para o 12 anos; editável pelos pais).
- **Recompensas por herói**, **cartas de agradecimento** para todos, **modo boa-noite** da criança, **Jornada do Reino** (XP da família por semana) e **visão detalhada de um dia** na Semana.

### Backup

Painel dos Pais → **Ajustes** → **Exportar backup (JSON)**. Para restaurar: **Importar backup** → confirmar "Substituir tudo". Como os dados vivem só neste aparelho, exporte de tempos em tempos e guarde o arquivo em lugar seguro.

## Documentação

- [`docs/GUIA-DOS-PAIS.md`](docs/GUIA-DOS-PAIS.md) — **comece por aqui**: como apresentar o reino às crianças e os rituais do dia e da semana.
- [`docs/PLANO.md`](docs/PLANO.md) — plano consolidado: decisões, conflitos resolvidos e simplificações do MVP (**este manda**).
- [`docs/design/game-design.md`](docs/design/game-design.md) — design do jogo: universo, classes, economia de XP e moedas, missões, conquistas, itens, mentoria e checklist anti-punição.
- [`docs/design/design-system.md`](docs/design/design-system.md) — design system v2 (premium híbrido): tokens, tipografia, componentes e auditoria de acessibilidade.
- [`docs/design/ux-design.md`](docs/design/ux-design.md) — fluxos por perfil, acessibilidade e textos.
- [`docs/design/architecture.md`](docs/design/architecture.md) — stack, modelo de dados, offline e backup.

## Estrutura

```
src/
  main.tsx, App.tsx, router.ts (hash), state.tsx (dados ao vivo + sessão), index.css (tema)
  db/        types, db (Dexie), actions (todas as escritas), backup, seed (assistente e família de exemplo)
  domain/    lógica pura e testada: levels, economy (XP/moedas derivados), schedule, achievements, week
  data/      catálogos: classes, categorias, templates por idade, missões, conquistas, itens
  screens/   Kingdom (Salão), Adventure (6/12/adulto), Week, Chest, Mural, CharacterSheet, Parents, Welcome
  components/ Avatar, WeekGrid, TaskEditor, ThanksModal, PinPad, Modal, Nav…
  lib/       datas locais, voz (Web Speech), som (WebAudio), vibração, PIN, persistência
```

**Princípios no código**: XP e moedas são **derivados** dos registros (nunca guardados nem subtraídos); um teste garante que nenhum novo registro diminui o XP de ninguém. Tarefa não feita simplesmente não gera registro. Nenhuma tela ordena membros por desempenho.

## Fora do MVP

Sincronização entre aparelhos, contas online e notificações push.
