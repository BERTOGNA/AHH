# UX Design — Reino da Família (PWA)

Documento para implementação direta (React + Tailwind). Decisões fechadas; onde houver dúvida, siga o que está aqui.
Nomes de exemplo: **Pai** (Guardião), **Mãe** (Alquimista), **Lia, 12** (Patrulheira), **Theo, 6** (Escudeiro). A cor pertence ao *slot* do perfil, não ao gênero.

---

## 1. Mapa de telas e navegação

**Premissa:** um aparelho compartilhado. Não existe "login": existe *perfil ativo*. Toda sessão começa e termina no Salão.

- Roteamento por hash (offline-safe): `#/`, `#/heroi/:id`, `#/semana`, `#/bau`, `#/mural`, `#/ficha/:id`, `#/pais`, `#/pais/tarefa/:id`, `#/bem-vindo`.
- Primeira abertura sem dados → `#/bem-vindo` (onboarding).
- Troca de perfil = tocar outro herói no Salão. Crianças entram direto; adultos pedem PIN de 4 dígitos.
- Modo pais fica destravado até: tocar "🔒 Sair do modo pais", trocar de perfil ou 5 min sem toque.
- Qualquer perfil volta sozinho ao Salão após **3 min ociosos** (aparelho da casa).
- Barra inferior (altura 72px, fixa, `safe-area-inset-bottom`):
  - Perfil 12 anos / adulto: 🗺️ Aventura · 🏰 Salão · 📅 Semana · 🎁 Baú · 📜 Mural (ícone 28px + rótulo 13px).
  - Perfil 6 anos: só 3 botões de 88px: 🗺️ Aventura · 🎁 Baú · 🏰 Salão (rótulo visível + falado ao tocar).
  - Avatar do perfil ativo no canto superior direito (56px) → Ficha do Personagem.
- No tablet paisagem (≥1024px) a barra vira trilho lateral esquerdo de 96px.

| Tela | Propósito | Elementos principais |
|---|---|---|
| **Salão do Reino** `#/` | Pertencimento: "este é o nosso reino" | Faixa-título com nome do reino ("Reino dos Silva") e data por extenso; **4 estandartes** de herói do mesmo tamanho (avatar 128px, nome, classe, *o que está fazendo agora*: 🏫 Escola / 💼 Trabalho / 🎮 Livre / 😴 Dormindo; selo ⏳ com número de pendentes só se houver); **Missão da Família** (ilustração em estágios + barra única dourada, sem divisão por pessoa); faixa "Acontecendo agora" (próximos 2 blocos de rotina da casa, ex.: "🍽️ 19h30 Jantar juntos"); últimos 3 agradecimentos; botão "🔒 Pais" no topo direito. Layout: 4 estandartes em linha no tablet, 2×2 no celular. |
| **Minha Aventura de Hoje** (6 anos) | Fazer as 3–5 missões sem ler | Avatar 96px + título falado; trilha de estrelas até o próximo nível; cartões ilustrados enormes; nada de números. Detalhe na seção 2. |
| **Aventura** (12 anos) | Autonomia e planejamento | Abas "Hoje" / "Minha semana" / "Mentoria"; lista densa; sequência; XP e nível. Seção 3. |
| **Aventura** (adulto) | Pais também jogam, diante da família | Lista igual à de 12 anos; tarefas marcadas ficam validadas na hora; atalho "✚ Registrar o que fiz" (trabalho invisível). Seção 4. |
| **Semana** `#/semana` | Ver onde os horários se cruzam | Grade 7 dias × 6h–22h com faixas por pessoa (tablet) ou dia + linha do tempo (celular). Seção 5. |
| **Baú de Recompensas** `#/bau` | Trocar 🪙 por recompensas reais | Saldo de 🪙 do perfil ativo; grade de cartões (emoji 64px, nome, custo); botão "Pedir"; seção "Recompensa do Reino" (desbloqueada pela missão coletiva). Para 6 anos: custo como pote de moedas enchendo, sem número. Gastar 🪙 nunca reduz XP nem nível. |
| **Mural do Reino** `#/mural` | Tornar visível o trabalho de todos | Semana atual; uma coluna (tablet) ou seção (celular) por herói com "O que fiz pelo reino" em linguagem natural ("🧾 Pagou as contas da casa"); **sem totais nem números por pessoa**; agradecimentos trocados; botão "💛 Agradecer" em cada item. |
| **Ficha do Personagem** `#/ficha/:id` | Identidade e progresso de longo prazo | Avatar 200px; nível + barra de XP (6 anos: estrelas); itens (slots: Cabeça, Mão, Companheiro); conquistas (grade de selos; bloqueadas em silhueta com dica, nunca "faltam X"); "Personalizar" (base, item equipado). Ficha de outro herói abre só leitura. |
| **Painel dos Pais** `#/pais` | Gestão (exige PIN) | Abas: **Pendentes** (validar), **Pedidos do Baú**, **Tarefas**, **Recompensas**, **Heróis**, **Ajustes** (backup exportar/importar JSON, trocar PIN, som, voz, título dos pais). Badge numérico nas abas com pendências. |
| **Bem-vindo** `#/bem-vindo` | Gerar 1ª semana em < 5 min | Assistente de 8 passos. Seção 9. |
| **Editor de tarefa** `#/pais/tarefa/:id` | Criar/editar tarefa | Emoji (grade de 40), título, "Como falar" (texto lido em voz alta, opcional), quem (1 pessoa / 2 = compartilhada / 🏠 Lar = qualquer um), dias (chips Seg–Dom), horário opcional (toggle + início/duração), XP (chips 5 · 10 · 20 · 30), "Precisa validar" (padrão: sim para crianças, não para adultos), Salvar/Excluir. Abre como folha inferior no celular, modal 560px no tablet. |

---

## 2. Fluxo da criança de 6 anos (sem leitura)

1. **Achar o herói.** No Salão, o estandarte de Theo tem avatar 128px, moldura laranja-tijolo, item equipado (ex.: 🛡️) e o próprio rosto que ele escolheu. Ao tocar: fala "Olá, Theo! Vamos começar a aventura?" e abre a tela. (Reconhece por imagem + cor + item, nunca pelo nome escrito.)
2. **Ver as missões.** Fala automática ao abrir: "Você tem 4 missões hoje." Cartões:
   - Celular: 1 coluna; tablet: 2 colunas (paisagem: 3). Cartão mín. **300×220px**, raio 24px, borda 4px na cor do herói.
   - Emoji/ilustração **112px** no centro; título curto em 26px abaixo (para quem já reconhece palavras e para os pais).
   - Botão alto-falante 🔊 **72×72px** no canto superior direito.
   - Botão "feito" = círculo **104px** na base do cartão, borda tracejada vazia (estado *a fazer*).
   - Ordem: pelo horário; sem horário vai ao fim. Máx. 5; se houver mais, o app mostra as 5 primeiras.
3. **Ouvir a missão.** Tocar em qualquer área do cartão (fora do círculo) lê o campo "Como falar" (ou o título). Ex.: "Hora de arrumar a sua cama!" O 🔊 faz o mesmo (affordance explícita).
4. **Marcar como feita.** Tocar no círculo:
   - Carimbo animado: selo de cera âmbar com ⏳ cai sobre o círculo (escala 1.4→1, rotação −8°, 300ms) + 8 faíscas ✦.
   - Som "ding-ding" (WebAudio, 2 notas, 250ms) + `navigator.vibrate(30)` se ativado.
   - Fala: "Muito bem! Agora o Rei ou a Rainha vai ver." (usa o título configurado dos pais).
   - O cartão ganha fundo âmbar claro e fica em estado *aguardando* (forma: selo redondo com ampulheta — não depende de cor).
   - Desfazer: tocar o selo ⏳ → fala "Quer desfazer?" e aparecem dois botões de 88px: ↩️ (desfazer) e ✅ (manter). Some em 8s mantendo.
5. **Quando validada.** Se Theo estiver na tela (ou na próxima vez que abrir): o ⏳ vira ⭐ dourada (giro 360°, 600ms), a estrela "voa" até a trilha de estrelas no topo, fala "O Rei viu! Você ganhou uma estrela!". Se completar o nível: tela cheia com avatar brilhando + "Você subiu de nível!" + item novo apresentado e falado.
6. **Tudo feito.** Fala "Você fez todas as missões de hoje! O reino agradece." + confete leve. Tarefas não feitas: **nada acontece**. No dia seguinte somem; nenhum aviso.

**Tamanhos (6 anos):** alvo mínimo **64×64px** (padrão interno 88px), espaçamento mín. 16px entre alvos. Texto mínimo **22px**, títulos 26–32px. Geral do app: alvo mínimo **48×48px**.

**Lido em voz alta (6 anos):** saudação ao entrar; quantidade de missões; título/"Como falar" de cada missão ao tocar; confirmação ao marcar; pergunta de desfazer; validação; nível novo e item; "todas feitas"; rótulos da barra inferior ao tocar; no Baú, nome da recompensa e "Falta pouco!" / "Você já pode pedir!"; agradecimentos recebidos ("A Mãe disse: obrigada por pôr a mesa!").

---

## 3. Fluxo 12 anos

- **Hoje:** lista de linhas de 64px (alvo do check 48px à esquerda), cada uma: emoji 28px, título 17px semibold, horário 14px, "+20 XP" à direita em ouro. Tarefas feitas descem para "Concluídas" com check ✓ e selo ⏳ ou ⭐. Topo: nível, barra de XP fina (8px), **Sequência 🔥 6 dias**.
- **Sequência sem punição:** conta dias com ≥1 tarefa validada; 1 dia de folga por semana não interrompe ("🛡️ Escudo de descanso"). Quando acaba, o contador simplesmente recomeça e a Ficha mostra "Melhor sequência: 12". Nunca exibir "você perdeu a sequência".
- **Minha semana:** mini-agenda de 7 dias só dela. Pode **criar tarefas próprias** (título, emoji, dia, horário opcional) que entram **direto com 10 XP**, etiqueta "✎ proposta por você"; os pais veem em Painel › Tarefas › "Novas" e podem ajustar XP ou dia. Pode **mover** dia/horário de qualquer tarefa dela (inclusive atribuídas), mas não excluir as atribuídas pelos pais.
- **Mentoria:** card "Mentora do Theo" com as missões de hoje dele (só ícones e estado). Botão "🤝 Ajudei" em cada missão dele → cria registro "Lia ajudou o Theo a guardar os brinquedos", vale XP de mentoria após validação, aparece no Mural e conta para a conquista "Mentora". Nunca mostra "Theo não fez".
- **Microcopy (bom ✅ vs infantilizado ❌):**
  - ✅ "Tarefa registrada. Aguardando validação." — ❌ "Ebaaa! Você é demais!!! 🎉🎉"
  - ✅ "Semana planejada. Bom ritmo." — ❌ "Que menina organizadinha!"
  - ✅ "Nível 8 · Patrulheira" — ❌ "Você é uma estrelinha nível 8!"
  - ✅ "Theo contou com você hoje." — ❌ "Você é a melhor irmãzona do mundo!"
  - ✅ "Nada pendente por aqui." — ❌ "Oba, tudo limpinho!"

---

## 4. Fluxo dos pais

- **Entrada:** tocar Pai/Mãe no Salão ou "🔒 Pais" → teclado numérico de PIN (botões 72px, 4 bolinhas). Erro: as bolinhas balançam e limpam, texto "PIN incorreto. Tente de novo." Sem bloqueio temporário (é a casa).
- **Validar (gesto decidido):** Painel › Pendentes, agrupado por herói. Cada linha: avatar 40px, emoji, título, "há 20 min", botão **"✓ Validar"** (altura 56px, mín. 120px, fundo ouro escuro, texto branco). **Um toque valida imediatamente** e mostra toast 5s "Validado · Desfazer". Ao lado: "💛" (64px) para validar + enviar agradecimento com frases prontas ("Obrigado por…", "Ficou ótimo!").
  - **"Validar todas (N)"** no topo de cada grupo e no topo geral → folha de confirmação com a lista e um botão "Validar N tarefas" (1 toque).
  - Swipe para a direita também valida, mas é atalho opcional; o botão é sempre visível.
  - Não existe "rejeitar". Existe "↩ Devolver" (menu ⋯), que volta a tarefa para *a fazer* sem mensagem negativa para a criança.
- **Pedidos do Baú:** cartão com recompensa, quem pediu, custo; "✓ Aprovar" (56px) e "Combinar depois" (secundário, mantém pendente). Aprovar desconta 🪙 e mostra "Aproveite!" para a criança.
- **Editar semana:** Painel › Tarefas (lista filtrável por herói) ou direto na Semana (modo pais permite arrastar/editar). Atalho "✚ Nova tarefa".
- **Próprias tarefas "diante da família":** no modo pais, marcar a própria tarefa = **validada na hora** (sem fila), com o mesmo carimbo e som das crianças, e entra no Mural ("💼 Pai: trabalho · 🍳 Fez o jantar"). Botão "✚ Registrar o que fiz" com chips rápidos de trabalho invisível: 🧾 Paguei contas · 🛒 Fiz compras · 🩺 Levei ao médico · 🧺 Lavei roupa · 🍳 Cozinhei · 📞 Resolvi um problema da casa. Cada registro vale XP e aparece no Mural com "💛 Agradecer" para as crianças.
- **Mural:** pais leem igual a todos; no tablet, uma coluna por herói com a lista da semana e agradecimentos; nenhuma contagem comparativa.

---

## 5. Agenda semanal

**Tipos de item:**
- **Bloco de rotina** (acordar, escola/trabalho, tempo livre, refeição, dormir): faixa de fundo na cor *tint* do herói, sem borda forte, ícone 18px no topo, padrão diagonal sutil para 😴 Dormir (`repeating-linear-gradient` 45°, 6px).
- **Tarefa**: "pílula" sobreposta ao bloco (altura mín. 28px tablet / 36px celular), fundo branco, borda esquerda 4px na cor do herói, emoji + título truncado. Tarefa sem horário aparece na faixa "Dia todo" no topo da coluna.
- **Momento juntos**: quando ≥3 pessoas estão em casa e livres/em refeição, uma faixa dourada atravessa a coluna do dia com "✦ Juntos". É o "onde os horários se cruzam".

**Tablet paisagem (≥1024px):**
- Coluna de horas 56px; 7 colunas de dia (Seg–Dom, hoje com fundo `--surface` e título em ouro). Cada dia tem **4 faixas finas** (uma por herói, na ordem fixa Pai · Mãe · Lia · Theo), separadas por 1px `--line`.
- Linhas: 6h–22h, **48px por hora** (768px de grade, rolagem vertical; abre rolada para a hora atual). Linha "agora" vermelho-tijolo 2px com bolinha.
- Topo: filtros por herói = chips com avatar 32px + nome (toggle; `aria-pressed`). Ao filtrar 1 pessoa, sua faixa ocupa a coluna inteira.
- Tocar um bloco/tarefa → painel de detalhe lateral (380px) com: quem, horário, recorrência, estado, "Editar" (só modo pais ou dono 12 anos).

**Celular retrato (<768px):**
- Topo: seletor de dia em chips (Seg…Dom, 44px de altura, 48px de largura, hoje marcado com ponto dourado) + setas de semana.
- Corpo: linha do tempo vertical 6h–22h, **64px por hora**, coluna de horas 44px + **4 colunas finas** (~70px cada em 375px) com avatar 28px no cabeçalho.
- Alternância "Linha do tempo | Lista" (segmented control). Lista = agrupada por herói, itens em ordem de horário, mais legível para leitura rápida.
- Entre 768–1023px (tablet retrato): 3 dias visíveis por vez com rolagem horizontal por *snap*.

**Edição:**
- Arrastar: pressionar 400ms (vibra 10ms) → o item "levanta" (sombra, escala 1.03) → arrastar move dia/horário com *snap* de 15 min; arrastar a borda inferior muda duração. Pointer Events, funciona com mouse e toque.
- **Alternativa sem arrastar (obrigatória):** tocar → "Editar" abre formulário: Dia(s) (chips), Início (seletor de hora em passos de 15 min), Duração (chips 15/30/45/60/90 min + personalizado), Pessoa. Atalhos no detalhe: "−15 min", "+15 min", "Mover para…" (lista de dias).
- Recorrentes: ao mover, perguntar "Só esta semana" / "Todas as semanas" (dois botões grandes, padrão = todas).

---

## 6. Sistema visual

**Conceito:** "Livro de crônicas da casa" — pergaminho quente, tinta sépia, ouro envelhecido, estandartes de tecido por herói. Nada de roxo-neon genérico, nada de gradiente de app.

**Tokens (tema claro "Pergaminho", padrão).** Contrastes medidos (WCAG):

| Token | Hex | Uso | Contraste |
|---|---|---|---|
| `--bg` | `#F5ECD7` | fundo pergaminho | — |
| `--surface` | `#FFF8E8` | cartões/placas | — |
| `--ink` | `#2A1E14` | texto principal | 13.8:1 em bg |
| `--ink-muted` | `#5E4B39` | texto secundário | 7.0:1 em bg |
| `--line` | `#C9B48A` | bordas/divisores (não-texto) | decorativo |
| `--gold` | `#8A5B00` | texto/ícones dourados, botão Validar (texto branco) | 5.0:1 em bg; branco sobre ele 5.9:1 |
| `--gold-bright` | `#D9A62E` | brilhos, estrelas, barras (nunca texto sobre claro) | 7.3:1 sob ink |
| `--night` | `#1C1F3A` | faixa-título do Salão, overlays | parchment sobre ele 13.7:1 |
| `--hero-1` Pai | `#1E5AA8` (tint `#DCE6F4`) | moldura, faixa | 5.8:1 em bg; branco 6.8:1 |
| `--hero-2` Mãe | `#8A3B9E` (tint `#EEDDF1`) | idem | 5.6:1; branco 6.6:1 |
| `--hero-3` 12 anos | `#23744A` (tint `#D7ECDD`) | idem | 4.9:1; branco 5.7:1 |
| `--hero-4` 6 anos | `#B8410E` (tint `#F8DFCF`) | idem | 4.7:1; branco 5.5:1 |
| `--wait` | `#8A5B00` sobre `#FBE7B5` | estado aguardando ⏳ | ink sobre fundo âmbar |

Regra: texto sobre *tint* é sempre `--ink` (cores de herói sobre tint ficam entre 4.3 e 5.4 — use-as só em borda/ícone ali). Texto branco sobre a cor sólida do herói é sempre permitido.

**Tema "Noite" (opcional, Ajustes):** bg `#1C1F3A`, surface `#282C4F`, ink `#F5ECD7`, muted `#CDBFA3`, gold `#E2B44A`, heróis `#8DB8F2` `#D59BE6` `#7DD3A0` `#F5A274` (todos ≥ 6.1:1 sobre surface).

**Tipografia:**
- Display (títulos, nomes de herói, níveis): **Cinzel** 600/700 empacotada via `@fontsource/cinzel` (woff2 local, pré-cacheada pelo service worker — nada de Google Fonts em runtime). Fallback: `"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif`. Cinzel é só maiúsculas visuais → usar em até ~30 caracteres; nunca em parágrafos nem na tela de 6 anos (lá, display = fallback serif em caixa normal, 28–32px).
- Texto: pilha de sistema `ui-rounded, "SF Pro Rounded", system-ui, "Segoe UI", Roboto, "Noto Sans", sans-serif` (zero bytes, ótima leitura). Números com `font-variant-numeric: tabular-nums`.
- Escala: 13 / 15 / 17 (base adulto e 12 anos) / 20 / 24 / 32 / 40. 6 anos: 22 / 26 / 32. `line-height` 1.4 texto, 1.15 títulos.

**Texturas e ornamentos (CSS puro):**
- Fundo: `--bg` + `radial-gradient(circle at 15% 10%, rgb(255 255 255 / .55), transparent 45%), radial-gradient(circle at 85% 95%, rgb(138 91 0 / .08), transparent 50%)` + ruído SVG inline (`feTurbulence baseFrequency=.9`, opacidade .05) como data-URI.
- Placa/cartão: fundo `--surface`, raio 16px (6 anos: 24px), `border: 1px solid var(--line)`, `box-shadow: inset 0 0 0 3px var(--surface), inset 0 0 0 4px rgb(201 180 138 / .6), 0 2px 0 rgb(42 30 20 / .08), 0 8px 24px rgb(42 30 20 / .08)` (filete duplo de manuscrito). Cantos com `✦` 10px em `--gold-bright` via `::before/::after` nos cartões de destaque.
- Estandarte do herói: retângulo com `clip-path: polygon(0 0,100% 0,100% 88%,50% 100%,0 88%)`, faixa superior 8px na cor sólida do herói, corpo na tint.
- Divisor de seção: SVG inline de linha com losango central (`— ◆ —`) em `--line`.
- Faixa-título do Salão: `--night` com estrelas pontuais (3–4 `radial-gradient` 1px) e o nome do reino em Cinzel `--gold-bright`.

**Ícones:** emoji (offline, coloridos). Conjunto canônico — rotina: ⏰ acordar, 🏫 escola, 💼 trabalho, 📚 estudo, 🎮 livre, 🍽️ refeição, 😴 dormir; tarefas: 🛏️ 🧸 🍽️ 🪥 🧺 🪴 🐶 🗑️ 🧽 🍳 🛒 🧾 🚗 🤝 📚; jogo: ⭐ XP/estrela, 🪙 moeda, ⏳ aguardando, ✅ validada, 🔥 sequência, 🏆 conquista, 🎁 baú, 📜 mural, 🏰 salão, 💛 agradecer, 🔒 pais, 🔊 ouvir. Ícones de interface (setas, fechar, ⋯) em SVG inline 24px, `stroke: currentColor`, 2px.

**Avatar composto** (componente `Avatar size=…`): círculo; fundo `radial-gradient` da tint do herói para `--surface`; borda 6px (≥96px) / 3px (<96px) na cor sólida + anel interno 2px `--gold-bright`; **emoji base** centralizado a 58% do tamanho; **item equipado** em medalhão 36% no canto inferior direito (fundo `--surface`, borda 2px `--gold`); **companheiro** opcional 30% no canto inferior esquerdo. Bases sugeridas: 🧙‍♀️ 🧙‍♂️ 🧝‍♀️ 🧝‍♂️ 🦸‍♀️ 🦸‍♂️ 🧚 🤴 👸 🦊 🦁 🐻 🐼 🦄 🐸 🐲. Itens: 🛡️ 🗡️ 🏹 🪄 👑 🎩 🔮 🧪 📖 🪶 🧭. Companheiros: 🐉 🦉 🐈 🐕 🐢 🦔.

**Animações:** carimbo do selo (300ms, `cubic-bezier(.2,.9,.3,1.3)`), estrela validada (600ms), faíscas ✦ (8–12 partículas `--gold-bright` + cor do herói, 900ms, CSS keyframes), barra de missão enchendo (800ms ease-out), nível novo (brilho pulsante 2× no avatar). Nada em loop infinito. `@media (prefers-reduced-motion: reduce)`: sem partículas, sem rotação/escala; só fade 150ms e troca de ícone.

---

## 7. Acessibilidade e legibilidade

- Contraste AA em todo texto (tabela acima); componentes não-texto ≥ 3:1 (bordas de botões usam `--ink-muted` ou cor sólida do herói).
- Tamanhos: base 17px (mín. 15px para metadados); 6 anos mín. 22px. Respeitar zoom do sistema (usar `rem`).
- Foco visível: `outline: 3px solid var(--hero-1); outline-offset: 3px` + `box-shadow: 0 0 0 6px var(--surface)`; no tema Noite, outline `--gold`. Nunca `outline: none` sem substituto.
- ARIA: estandartes `<button aria-label="Theo, Escudeiro. 2 missões aguardando validação.">`; cartão de missão `aria-label="Arrumar a cama. A fazer."`; botão de marcar `aria-pressed`; celebrações em região `aria-live="polite"`; modais com `role="dialog"` e foco preso; grade da Semana com `role="grid"` e cada bloco descrevendo "Lia, escola, segunda, 7h às 12h30".
- Nada só por cor: herói = avatar + nome + cor; estados = forma (círculo vazio / selo ⏳ / estrela ⭐ / ✓) + texto (visível para adultos e 12 anos, `sr-only` para 6 anos).
- Voz (Web Speech API): `speechSynthesis` com `lang="pt-BR"`; escolher voz cujo `lang` começa com `pt-BR`, senão `pt`; `rate 0.95`, `pitch 1.05`; `cancel()` antes de cada fala. Carregar vozes em `voiceschanged`. **Fallback silencioso:** sem API ou sem voz pt → esconder botões 🔊 e desligar auto-leitura; nada de erro na tela. Ajuste "Voz" (liga/desliga) por perfil; padrão ligado só para 6 anos.
- Háptico: `if ('vibrate' in navigator)` → 30ms ao marcar, `[20,40,20]` ao validar, 10ms ao iniciar arrasto. Ajuste "Vibração" (padrão ligado).
- Som: WebAudio sintetizado (sem arquivos); ajuste "Sons" (padrão ligado), volume 0.4.
- Alvos: 48px geral, 64px (padrão 88px) no perfil 6 anos; espaçamento ≥ 8px (6 anos: 16px).

---

## 8. Microcopy pt-BR (strings-chave)

Proibido em qualquer lugar: "falhou", "atrasado", "perdeu", "errado", "não cumpriu", "pendente há X dias" para crianças, rankings ("1º lugar").

| Chave | Texto |
|---|---|
| `salao.titulo` | "Reino dos {família}" |
| `salao.missao` | "Missão da semana: {missão}" |
| `salao.agora` | "Acontecendo agora" |
| `salao.escolha` | "Quem vai jogar?" (falado ao abrir em modo família) |
| `kid.saudacao` | "Olá, {nome}! Vamos começar a aventura?" |
| `kid.contagem` | "Você tem {n} missões hoje." |
| `kid.feito` | "Muito bem! Agora o {Rei/Rainha} vai ver." |
| `kid.aguardando` | "Esperando o {Rei ou a Rainha} ver." |
| `kid.validado` | "O {Rei} viu! Você ganhou uma estrela!" |
| `kid.tudo` | "Você fez todas as missões de hoje! O reino agradece." |
| `kid.desfazer` | "Quer desfazer?" |
| `teen.feito` | "Tarefa registrada. Aguardando validação." |
| `teen.validado` | "Validada · +{xp} XP" |
| `teen.sequencia` | "Sequência: {n} dias" |
| `teen.vazio` | "Nada pendente por aqui. Que tal planejar amanhã?" |
| `teen.nova` | "Tarefa adicionada à sua semana." |
| `teen.mentoria` | "Theo contou com você hoje." |
| `adulto.registrar` | "Registrar o que fiz" |
| `adulto.registrado` | "Registrado no Mural. A família vai ver." |
| `pais.validar` | "Validar" |
| `pais.validarTodas` | "Validar todas ({n})" |
| `pais.validado` | "Validado · Desfazer" |
| `pais.vazio` | "Tudo validado. O reino está em dia." |
| `pais.devolver` | "Devolver para fazer" |
| `bau.pedir` | "Pedir esta recompensa" |
| `bau.pedido` | "Pedido enviado! Seus pais vão ver." |
| `bau.faltaPouco` | "Falta pouco!" |
| `bau.aprovado` | "Aproveite!" |
| `mural.titulo` | "O que cada um fez pelo reino" |
| `mural.agradecer` | "Agradecer" |
| `mural.obrigado` | "{de} agradeceu {para}: “{texto}”" |
| `mural.vazio` | "A semana está começando. Cada tarefa feita aparece aqui." |
| `missao.concluida` | "Missão cumprida! Juntos, vocês {resultado}." |
| `nivel.novo` | "Novo nível! {classe} nível {n}" |
| `geral.ainda` | "Ainda dá tempo." (só para o dia atual, nunca em dias passados) |
| `pin.erro` | "PIN incorreto. Tente de novo." |

Tarefas não feitas em dias passados **não são mostradas** em nenhuma tela de criança; no Painel dos Pais aparecem apenas em Tarefas › histórico, como "não marcada", sem destaque.

---

## 9. Onboarding (8 passos, meta < 5 min)

Regras: barra de progresso com 8 marcos (✦), "Voltar" sempre, "Pular — usar sugestão" em todo passo; todo campo vem pré-preenchido com padrão sensato, então tocar "Próximo" 8 vezes já gera uma semana utilizável. Rascunho salvo a cada passo (IndexedDB).

1. **"Quem mora neste reino?"** — Nome do reino (texto, sugestão "Reino dos {sobrenome}"); 4 linhas fixas: nome + idade (stepper) + papel (Adulto/Criança, inferido pela idade). Título dos pais na validação: chips "Rei/Rainha" · "Pai/Mãe" · "Guardiões".
2. **"Escolham seus heróis"** — por pessoa: grade de bases do avatar (16 opções, 72px), classe (chips: Guardião 🛡️, Alquimista 🧪, Patrulheira 🏹, Escudeiro 🗡️, Maga 🪄, Bardo 🪶). Cor do herói é atribuída pelo slot e mostrada na moldura.
3. **"Que horas cada um acorda e dorme?"** — por pessoa, dois seletores de hora (passos de 15 min) com padrões: adultos 6h30/23h, 12 anos 6h45/22h, 6 anos 7h/20h30. Toggle "Fim de semana diferente" (+ dois seletores).
4. **"Escola e trabalho"** — por pessoa: tipo (🏫 Escola / 💼 Trabalho / 🏠 Em casa), chips Seg–Dom (padrão Seg–Sex), início/fim (padrão escola 7h–12h30, trabalho 9h–18h). Botão "Copiar para…" outra pessoa.
5. **"Quem cuida do quê na casa?"** — templates por faixa etária com checkboxes (linha 56px, emoji + título + dias sugeridos editáveis por chips):
   - 6 anos (marque 3–5): 🛏️ Arrumar a cama · 🧸 Guardar os brinquedos · 🍽️ Ajudar a pôr a mesa · 🪥 Escovar os dentes · 🧺 Roupa no cesto · 🪴 Regar a planta · 🐶 Dar comida ao pet.
   - 12 anos: 🍽️ Lavar a louça · 🛏️ Organizar o quarto · 🗑️ Levar o lixo · 📚 Dever de casa · 🥪 Preparar o lanche · 👕 Dobrar roupas · 🤝 Mentoria do irmão.
   - Adultos: 🍳 Fazer o jantar · 🛒 Compras · 🧾 Pagar contas · 🧺 Lavar roupa · 🚗 Levar à escola · 🧽 Limpar banheiro · 🩺 Saúde da família.
   - Compartilhada: tocar "＋👤" numa tarefa para adicionar uma segunda pessoa. XP já vem do template.
6. **"Recompensas do Baú"** — checkboxes com custo editável (stepper de 🪙): 🍕 Escolher o jantar (50) · 🎬 Cinema em família (150) · 🎲 Noite de jogos escolhida por mim (60) · 🌳 Passeio no parque (100) · 📺 30 min extras de tela (40) · 🍦 Sorvete (40). Missão da família: escolher 1 de 3 ("Restaurar o Jardim do Reino" 🌱→🌳, "Reconstruir a Ponte" 🌉, "Acender o Farol" 🗼) e a recompensa coletiva.
7. **"PIN dos pais"** — teclado numérico 72px; digitar 4 dígitos e confirmar. Texto: "Só os adultos usam este PIN para validar e configurar."
8. **"Esta é a semana do reino"** — prévia da Semana gerada (somente leitura, com filtros); resumo "{n} tarefas · {m} recompensas · Missão: {missão}"; botões "Ajustar algo" (volta ao passo) e **"Começar a aventura"** → confete → Salão.

---

## Checklist rápido para o front-end

- [ ] Tokens CSS acima em `:root` e `[data-theme="noite"]`; Tailwind consome via `theme.extend.colors` com `var(--…)`.
- [ ] Componentes: `Avatar`, `HeroBanner`, `QuestCard` (variante kid/teen/adult), `SealStatus` (todo/aguardando/validada), `BigButton`, `PinPad`, `WeekGrid`, `DayTimeline`, `Sheet`, `Toast` com desfazer, `Speak` (hook `useSpeech`).
- [ ] Ociosidade: 3 min → Salão; 5 min → trava modo pais.
- [ ] Nenhuma tela mostra comparação numérica entre membros nem estado negativo.
