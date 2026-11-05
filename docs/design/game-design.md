# Game Design: Reino de Aurora

> Documento de referência para implementação. Todas as decisões são finais para o MVP. "XP" = experiência (progressão); "moedas" = moeda do Baú.

## 1. Universo e tom

- **Nome padrão do reino:** **Reino de Aurora** (a família renomeia no onboarding: "Como se chama o reino de vocês?"). Campo `reino.nome`, máx. 24 caracteres.
- **Fantasia central:** a casa é o reino; cada membro é um herói da mesma party. O reino "acorda" com a contribuição de todos. A tela inicial mostra o reino (paisagem SVG) com os 4 heróis lado a lado, cada um com sua classe e papel. Não é "a minha lista".
- **Tom:** aventura acolhedora, bem-humorada, sem vilões humanos. O "inimigo" é a **Névoa do Sono**, que cobre partes do reino e só some com contribuição. Ela nunca volta: o que foi restaurado fica restaurado.
- **A história só avança:**
  - Toda XP validada ilumina o reino (missão semanal + Mapa do Reino permanente).
  - Tarefa não feita **não gera nenhum evento visível**: não fica vermelha, não diz "atrasada", não aparece no Mural.
  - Não existe ação no app que subtraia XP, nível, conquista, item ou estágio de missão.
- **Linguagem:** 6 anos com frases de até 5 palavras e áudio; 12 anos e adultos com frases normais, sem diminutivos ("Missão concluída", não "Eba, que lindinho!").

## 2. Classes

As classes são identidade, cor e sugestão de templates. **Não dão bônus mecânico** (nenhuma pessoa ganha mais XP por ser de certa classe). O campo `papel` é um texto livre que já vem com uma sugestão (ex.: "Guardiã do Tesouro e Curandeira").

| id | Classe (pt-BR) | Ícone | Cor (hex) | Papel no reino (responsabilidades reais) |
|---|---|---|---|---|
| `alquimista` | Alquimista da Cozinha | 🧪 | `#E8742C` laranja | Cozinhar, planejar cardápio, compras de comida |
| `tesoureiro` | Guardião(ã) do Tesouro | 🪙 | `#D4A72C` dourado | Contas, orçamento, compras, documentos |
| `curandeiro` | Curandeiro(a) do Reino | 🌿 | `#3FA36B` verde | Saúde, médico, remédios, cuidar de pessoas e pets |
| `arquiteto` | Arquiteto(a) do Lar | 🔨 | `#B5653A` terracota | Limpeza pesada, consertos, roupa, organização da casa |
| `cavaleiro` | Cavaleiro(a) da Jornada | ⚔️ | `#3B6FD1` azul | Trabalho remunerado, levar e buscar, compromissos fora |
| `mago` | Mago(a) dos Pergaminhos | 📜 | `#7B4FC9` roxo | Estudo, leitura, agenda escolar, planejar a semana |
| `bardo` | Bardo/Barda da Alegria | 🎵 | `#D9487E` rosa | Tempo em família, lazer, festas, clima da casa |
| `escudeiro` | Escudeiro(a) | 🛡️ | `#2BA8A8` turquesa | Criança pequena que aprende um pouco de tudo e ajuda os heróis |

**Sugestões por perfil (o onboarding pré-seleciona e a família pode trocar):**
- **Adulto que cozinha:** Alquimista da Cozinha. **Adulto que cuida das finanças:** Guardião(ã) do Tesouro. **Adulto que leva e busca e cuida da saúde:** Curandeiro(a) ou Cavaleiro(a).
  - Regra do onboarding: a classe sugerida é a da categoria com mais XP planejado para aquele adulto.
- **12 anos:** Mago(a) dos Pergaminhos (padrão) ou Arquiteto(a) do Lar. Recebe também o selo **"Mentor(a)"** (seção 8).
- **6 anos:** Escudeiro(a) (padrão), com papel sugerido "Escudeiro(a) Ajudante do Reino".

## 3. Categorias de tarefa

| id | Categoria | Ícone | Frase do Mural (fantasia) |
|---|---|---|---|
| `lar` | Casa & Lar | 🏠 | "cuidou das muralhas do castelo" |
| `comida` | Cozinha & Comida | 🍲 | "preparou poções e banquetes" |
| `pessoal` | Cuidado Pessoal | 🪥 | "se preparou para a aventura" |
| `estudo` | Estudo | 📚 | "estudou os pergaminhos" |
| `trabalho` | Trabalho | 💼 | "partiu em expedição para sustentar o reino" |
| `cuidado` | Cuidar de Alguém | 💞 | "cuidou de quem precisa (pessoas e bichos)" |
| `financas` | Finanças & Contas | 🪙 | "manteve o Tesouro em ordem" |
| `planejamento` | Planejar & Organizar | 🗺️ | "traçou o mapa da semana" (carga mental) |

**Como o trabalho invisível vira visível:**
1. **Trabalho remunerado** vira a tarefa "Expedição de trabalho" (20 XP/dia). Aparece na agenda como um bloco de horário, e no Mural como "⚔️ Mãe partiu em expedição 5 vezes".
2. **Contas, cardápio, lista de compras, marcar médico, reunião escolar e organizar agenda** viram templates próprios nas categorias `financas`, `planejamento` e `cuidado`.
3. **Botão "Registrar feito invisível"** (só em perfil adulto): cria e conclui na hora uma tarefa avulsa. O adulto escolhe a categoria, um título (com sugestões: "Resolvi pendência do banco", "Marquei consulta", "Respondi a escola", "Comprei presente do aniversário") e o XP (10 por padrão).
4. **No Mural do Reino**, cada adulto tem uma faixa **"Bastidores do Reino"** que lista em linguagem de fantasia o que fez em `trabalho`, `financas`, `planejamento` e `cuidado`.

## 4. Tipos de tarefa, fluxo e XP

**Tipos:**
- `individual`: tem 1 responsável.
- `compartilhada`: tem exatamente 2 responsáveis. Qualquer um dos dois marca "Fizemos juntos". Ao validar, **cada um recebe XP e moedas integrais**.
- `lar`: sem responsável fixo e listada em "Chamados do Lar". Qualquer membro toca "Eu faço!" (vira dele). Um 2º membro pode tocar "Eu ajudo!", e a tarefa vira compartilhada. Se ninguém pegar, a tarefa some no fim do dia sem registro e reaparece na próxima recorrência.

**Fluxo (estados de `TaskInstance`):** `aberta` → `feita` → `validada`.
- **Criança marca "feita".** Na hora há celebração (som, confete, voz "Muito bem!") e a barra de XP mostra um **brilho fantasma** com o XP a receber.
- **Pai ou mãe valida** com 1 toque no "Selo Real" ou com "Validar todas". Só então XP e moedas entram no ledger.
- **"Ainda não"** (alternativa do pai à validação) devolve para `aberta` sem notificação negativa. A criança só vê o cartão de volta com "Vamos terminar juntos?". Nada é registrado como falha.
- **Tarefas de adultos:** quando um adulto marca a própria tarefa como feita, ela fica `validada` na hora (autovalidação diante da família) e aparece com o selo dourado no Mural.
- **Instância não feita até 23:59:** permanece `aberta` no banco, não é exibida em nenhuma tela de histórico e não gera evento.

**XP por dificuldade (valores fixos, sem outro valor possível):**

| Dificuldade | XP | Moedas | Exemplo |
|---|---|---|---|
| Rápida | 5 | 1 | escovar dentes, arrumar cama (6a) |
| Normal | 10 | 2 | guardar brinquedos, levar o lixo |
| Grande | 20 | 4 | lição de casa, cozinhar o jantar |
| Épica | 30 | 6 | faxina, compras da semana, consulta médica |

**Moedas = XP ÷ 5.**

### Templates padrão

Legenda: ✔ = vem ligado no onboarding. "Sob demanda" = sem recorrência, criado quando necessário. Dias: Seg..Dom. Regra: os templates ✔ da criança de 6 anos somam no máximo 5 tarefas por dia, e o assistente avisa (sem bloquear) se o pai passar de 5.

**6 anos (10 templates)**

| Título | Emoji | Cat. | XP | Horário | Dias |
|---|---|---|---|---|---|
| Arrumar a cama ✔ | 🛏️ | lar | 5 | 07:00 | Todos |
| Escovar os dentes (manhã) | 🪥 | pessoal | 5 | 07:15 | Todos |
| Vestir-se sozinho(a) | 👕 | pessoal | 5 | 07:20 | Seg–Sex |
| Guardar a mochila e o tênis | 🎒 | lar | 5 | 12:30 | Seg–Sex |
| Leitura com alguém ✔ | 📖 | estudo | 10 | 16:00 | Seg–Sex |
| Guardar os brinquedos ✔ | 🧸 | lar | 10 | 18:00 | Todos |
| Ajudar a pôr a mesa ✔ | 🍽️ | comida | 10 | 19:00 | Todos |
| Levar o prato para a pia | 🥣 | comida | 5 | 19:40 | Todos |
| Dar comida ao bichinho | 🐶 | cuidado | 10 | 08:00 | Todos |
| Escovar os dentes (noite) ✔ | 🌙 | pessoal | 5 | 20:00 | Todos |

O conjunto ✔ soma ~260 XP e ~52 moedas por semana.

**12 anos (12 templates)**

| Título | Emoji | Cat. | XP | Horário | Dias |
|---|---|---|---|---|---|
| Arrumar o quarto ✔ | 🛏️ | lar | 10 | 07:00 | Todos |
| Lição de casa ✔ | 📚 | estudo | 20 | 15:00 | Seg–Sex |
| Estudar para prova | 🧠 | estudo | 30 | 16:00 | Sob demanda |
| Brincar/ler com o irmão(ã) | 🤝 | cuidado | 10 | 17:00 | Ter, Qui |
| Levar o lixo para fora ✔ | 🗑️ | lar | 10 | 19:30 | Seg, Qua, Sex |
| Lavar a louça do jantar ✔ | 🧽 | comida | 20 | 20:00 | Ter, Qui |
| Banho e higiene | 🚿 | pessoal | 5 | 20:30 | Todos |
| Preparar a mochila ✔ | 🎒 | estudo | 5 | 21:00 | Dom–Qui |
| Ler 20 minutos | 📖 | estudo | 10 | 21:15 | Todos |
| Cuidar das plantas | 🪴 | lar | 10 | 09:00 | Qua, Sáb |
| Estender/recolher roupa ✔ | 🧺 | lar | 10 | 10:00 | Sáb |
| Ajudar a cozinhar ✔ (compartilhada c/ adulto) | 🍳 | comida | 20 | 18:30 | Sáb |

O conjunto ✔ soma ~300 XP e ~60 moedas por semana.

**Adultos (15 templates; o onboarding pergunta "quem faz?" e distribui entre os dois)**

| Título | Emoji | Cat. | XP | Horário | Dias |
|---|---|---|---|---|---|
| Expedição de trabalho ✔ | 💼 | trabalho | 20 | 08:00–17:00 | Seg–Sex |
| Exercício / cuidar de si | 🏃 | pessoal | 10 | 06:30 | Seg, Qua, Sex |
| Preparar o café da manhã ✔ | ☕ | comida | 10 | 06:45 | Seg–Sex |
| Levar/buscar na escola ✔ | 🚗 | cuidado | 10 | 07:30 | Seg–Sex |
| Acompanhar a lição | 📚 | cuidado | 10 | 17:00 | Seg–Sex |
| Cozinhar o jantar ✔ | 🍲 | comida | 20 | 18:30 | Todos |
| Lavar a louça ✔ | 🧽 | comida | 10 | 20:00 | Seg, Qua, Sex |
| Lavar roupa ✔ | 🧺 | lar | 20 | 09:00 | Qua, Sáb |
| Revisar e pagar contas ✔ | 🪙 | financas | 20 | 20:30 | Sex |
| Compras da semana ✔ | 🛒 | comida | 30 | 10:00 | Sáb |
| Faxina da casa ✔ (tipo `lar`) | 🧹 | lar | 30 | 14:00 | Sáb |
| Planejar o cardápio da semana ✔ | 🗒️ | planejamento | 20 | 17:00 | Dom |
| Organizar a agenda da família ✔ | 🗓️ | planejamento | 10 | 20:00 | Dom |
| Consulta médica/dentista | 🩺 | cuidado | 30 | — | Sob demanda |
| Reunião ou recado da escola | 🏫 | planejamento | 10 | — | Sob demanda |

Cada adulto fica com ~350–450 XP por semana. A família típica planeja **~1.350 XP/semana**.

## 5. Economia

**XP (progressão)**
- O ledger de XP é append-only e só aceita valores positivos. Nível, título e itens derivam dele.
- **Fontes de XP:** tarefa validada, mentoria (seção 8), agradecimento (seção 9) e bônus da Fogueira (seção 10).

**Moedas (Baú)**
- Ao validar uma tarefa, a pessoa recebe moedas = XP ÷ 5. Mentoria dá +1 moeda. Agradecimentos e bônus não dão moedas.
- **Saldo** = moedas ganhas − moedas trocadas. O saldo nunca fica negativo, porque o resgate exige saldo ≥ custo.
- **Resgate:** criança pede (`pedido`) e as moedas ficam **reservadas**. O pai aprova (`aprovado` → `entregue`) ou toca "Agora não". Neste caso as moedas voltam integralmente e a criança vê "Guardado para outra hora".
- **Como apresentar o gasto (não é punição):**
  - O verbo é sempre **"trocar"**, nunca "gastar" ou "perder". O botão diz "Trocar por este tesouro".
  - A animação mostra as moedas voando para dentro do baú e o tesouro saindo ("Tesouro conquistado!"), com som festivo. Não há número negativo, não há cor vermelha, não há "−20".
  - O perfil mostra **"Moedas ganhas desde sempre: N"**, um contador que só sobe e é o número de destaque. O saldo atual aparece menor, como "Na bolsa: N".
  - XP e nível não mudam com resgates. Isso é dito explicitamente na primeira troca: "Seu nível continua o mesmo, você só trocou moedas por um tesouro."
- **Pais:** ganham XP sempre e acumulam moedas internamente sempre. A UI de moedas e Baú para adultos só aparece se a opção **"Baú dos adultos"** estiver ligada nas configurações (padrão: **desligada**). Ligada, o outro adulto aprova os resgates.

**Curva de nível**
- XP para ir do nível `n` ao `n+1`: **`50 + 25·(n−1)`** (50, 75, 100, 125…).
- XP total para chegar ao nível `n`: **`50·(n−1) + 12,5·(n−1)·(n−2)`**.
- Valores de referência (XP total para atingir o nível): N2 = 50, N5 = 350, N10 = 1.350, N20 = 5.225, N30 = 11.600, N50 = 31.850.
  - No ritmo de ~260 XP/semana, a criança de 6 anos chega ao N5 em ~1,5 semana e ao N10 em ~5 semanas.
- **Nível máximo do MVP: 50.** Depois do 50, a XP continua contando e a cada 1.000 XP a pessoa ganha uma **Estrela de Lenda ⭐** (contador no perfil).

**Títulos por faixa** (a forma masculina ou feminina segue `perfil.tratamento`):

| Níveis | Título |
|---|---|
| 1–4 | Aprendiz do Reino |
| 5–9 | Explorador(a) |
| 10–14 | Protetor(a) |
| 15–19 | Herói / Heroína |
| 20–29 | Campeão / Campeã do Lar |
| 30–39 | Mestre / Mestra do Reino |
| 40–49 | Lenda de Aurora (usa o nome do reino) |
| 50 | Pilar do Reino |

**Recompensas (cadastradas pelos pais; custo em moedas, faixa permitida 5–300)**
- Referência de ganho: a criança de 6 anos junta ~50 moedas por semana e a de 12 anos ~60.
- **Pequena (10–20 moedas, 2–3 dias):** escolher a sobremesa (15), 20 min a mais de tela (15), escolher a música do carro por um dia (10), história extra antes de dormir (10).
- **Média (30–60 moedas, ~1 semana):** escolher o jantar de sábado (40), escolher o filme da noite em família (35), dormir 30 min mais tarde na sexta (30), passeio ao parque escolhido (50), convidar um amigo para brincar (60).
- **Grande (100–200 moedas, 2–4 semanas):** cinema (120), passeio especial de dia inteiro (180), brinquedo ou livro novo (150).
- Cada recompensa pode ser visível para "todos" ou só para perfis específicos (campo `paraPerfis`), sem mostrar o saldo dos outros.

## 6. Loops

**Diário (6 anos)**
1. Na tela "Quem é você?", toca no próprio avatar grande.
2. A tela "Hoje" mostra de 3 a 5 cartões gigantes (emoji, ilustração e áudio automático ao tocar).
3. Faz a tarefa e toca ✅. Recebe celebração imediata e o brilho fantasma de XP.
4. Na próxima vez que abrir após uma validação: "O Selo Real chegou!", com a barra de XP enchendo e moedas caindo.
5. À noite, opcionalmente toca 💖 e escolhe alguém para agradecer.

**Diário (12 anos)**
1. De manhã, vê o dia e as **Chamas da Semana**.
2. Marca as tarefas ao longo do dia.
3. À tarde, pode registrar mentoria nas tarefas que o irmão já marcou.
4. À noite, vê a XP validada e o progresso da missão. Tem o atalho "Agradecer" no Mural.

**Diário (pais)**
1. Marcam as próprias tarefas (autovalidadas) e usam "Registrar feito invisível".
2. Às 20:30 (horário configurável), um lembrete interno no app abre o **"Ritual do Selo"**: lista de pendentes com "Validar todas", feito diante dos filhos, em ~1 minuto.
3. Enviam agradecimentos.

**Semanal (a semana vai de segunda 00:00 a domingo 23:59, no horário local)**
- **Segunda (1ª abertura):** revelação da nova **Missão da Semana**, com a cena da Névoa e a meta.
- **Durante a semana:** cada validação move a barra coletiva. Ao cruzar um estágio, aparece uma animação para todos na próxima abertura de qualquer perfil.
- **Domingo, a partir das 17:00: "Crônica da Semana"**, uma sequência de 5–7 cartões narrados:
  1. O que foi restaurado na missão (estágio atingido, sempre celebrado).
  2. Um cartão por herói, na ordem fixa da família e nunca ordenado por desempenho: categoria mais forte, quantas tarefas fez, item ou conquista nova.
  3. "Bastidores do Reino": o trabalho invisível dos adultos.
  4. Agradecimentos trocados na semana.
  5. "Quem vocês querem agradecer hoje?"
- **Domingo (planejamento):**
  - O de 12 anos planeja parte da própria semana: move as próprias tarefas de dia ou horário e escolhe até 2 tarefas extras do catálogo de templates. Os pais confirmam.
  - Os pais ajustam a grade.

## 7. Missão semanal da família

- **Meta:** `round50(0,6 × XP planejado da família para a semana)`, limitada a [300, 3000]. Família típica: 0,6 × 1.350 ≈ **800 XP**. A meta é calculada na segunda 00:00 e não muda durante a semana.
- **Progresso** = soma de toda XP validada (de todos os membros, todas as fontes) com data na semana. Só cresce.
- **Estágios fixos:** 0 / 25 / 50 / 75 / 100%. Acima de 100% aparece o efeito "Reino transbordando ✨" e a barra fica dourada, sem prêmio extra.
- **Recompensa coletiva:**
  - Ao chegar em **50%**: mini-celebração. O padrão é "Sobremesa escolhida em família", editável.
  - Ao chegar em **100%**: a recompensa da missão.
  - As duas ficam registradas no Baú como "Tesouro da Família" e não custam moedas. Os pais marcam como "entregue".
- **Se não completar:** a missão **termina no domingo**, celebrada pelo que foi restaurado: "Restauramos 72% do Jardim! As flores e o caminho voltaram." Não aparece a palavra "falhou", nem "faltou", nem contagem do que faltou.
  - Cada missão vira um **Lugar** no **Mapa do Reino** (permanente), com o maior estágio já alcançado.
  - Quando a mesma missão volta na rotação, o lugar começa de 0 na barra semanal, mas o visual do Mapa nunca regride.
- **Rotação:** as 6 missões abaixo em ordem, em ciclo. Os pais podem escolher outra na segunda.

| id | Missão | Ícone | 0% | 25% | 50% | 75% | 100% | Recompensa coletiva |
|---|---|---|---|---|---|---|---|---|
| `jardim` | Restaurar o Jardim do Reino | 🌷 | Terra seca, névoa, cerca caída | Brotos verdes surgem | Flores e caminho de pedras | A fonte volta a jorrar | Jardim florido, borboletas, banco da família | Piquenique em família |
| `farol` | Reacender o Farol de Aurora | 🗼 | Farol apagado no nevoeiro | Janelas acendem | Escada iluminada | Chama no topo | Feixe de luz cruza o céu, barquinhos chegam | Noite de cinema em casa com pipoca |
| `ponte` | Reconstruir a Ponte do Rio Cristal | 🌉 | Ponte quebrada | Pilares de pé | Tábuas no lugar | Corrimão e lanternas | Ponte completa, carroça atravessa | Passeio de bicicleta ou no parque |
| `dragao` | Chocar o Ovo do Dragão Guardião | 🥚 | Ovo frio na névoa | Ovo aquece e brilha | Primeiras rachaduras | Olhinho espiando | Dragãozinho nasce e voa sobre o reino | Noite de jogos de tabuleiro com sobremesa |
| `biblioteca` | Encher a Biblioteca Encantada | 📚 | Estantes vazias, teia | 1ª estante cheia | Lustre acende | Livros voando | Biblioteca viva, coruja na janela | Ida à biblioteca/livraria, cada um escolhe um livro |
| `banquete` | Preparar o Grande Banquete | 🍰 | Mesa vazia, lareira fria | Lareira acesa | Pães e frutas na mesa | Bolo no forno | Banquete servido, bandeirolas | Cozinhar juntos a receita escolhida pelas crianças |

## 8. Mentoria (12 anos → 6 anos)

- **Configuração:** perfis com a flag `mentor` (padrão: a criança de 12 anos) podem mentorar perfis com a flag `aprendiz` (padrão: a de 6). Adultos não recebem XP de mentoria.
- **Duas formas de criar uma mentoria:**
  1. **O pequeno pede o crédito.** Ao marcar ✅, a criança de 6 anos vê "Alguém te ajudou?" com os avatares grandes e pode tocar no do irmão ou pular.
  2. **O mentor registra.** Na aba Mentoria do 12 anos, aparecem **apenas tarefas do aprendiz que já estão `feita` ou `validada` hoje**. O mentor toca "Eu ajudei 🤝".
     - O mentor nunca vê tarefas abertas ou não feitas do irmão, então não há fiscalização.
- **Regras:**
  - A tarefa continua 100% do aprendiz, com XP e moedas integrais para ele.
  - O mentor recebe **+5 XP e +1 moeda** por mentoria quando a tarefa do aprendiz é validada.
  - Limite de **3 mentorias com XP por dia**. A partir da 4ª, a mentoria é registrada e conta para conquistas, mas não dá XP.
  - Uma tarefa aceita no máximo uma mentoria.
- **Proibições:**
  - O mentor não pode marcar, desmarcar, validar nem comentar tarefas do aprendiz.
  - Não existe tela "o que falta para o irmão fazer".
- **Visível:** a tarefa mostra "com ajuda de 📜 [nome]". O Mural tem a seção "Mentorias da semana". A partir de 1 mentoria, o perfil do mentor exibe o selo "Mentor(a) do Reino".

## 9. Agradecimentos

- **Quem envia:** qualquer perfil para qualquer outro, nunca para si mesmo. Pode ser ligado opcionalmente a uma tarefa validada da semana. Não há limite de envios.
- **XP:** **+2 XP para quem envia e +2 XP para quem recebe**. Só os **5 primeiros envios por dia de cada remetente** geram XP; os seguintes são entregues normalmente, sem XP. Agradecimentos não geram moedas.
- **6 anos:** escolhe o avatar, depois um dos ícones de mensagem rápida (lido em voz alta), depois envia. Sem digitação.
- **12 anos e adultos:** mensagem rápida ou texto livre (máx. 140 caracteres) + 1 emoji.
- **Entrega:** na próxima abertura do perfil destinatário aparece um cartão "Uma carta chegou! 💌" (com áudio para o de 6 anos). Depois fica no Mural em ordem cronológica.
  - Não existe contagem por pessoa nem ordenação por quem recebeu mais.
- **Mensagens rápidas:**
  1. 💖 Obrigado(a) por ter feito isso!
  2. 🍲 A comida estava uma delícia!
  3. 🤝 Obrigado(a) pela ajuda!
  4. 🏠 A casa ficou linda!
  5. 💼 Obrigado(a) por trabalhar pela família!
  6. 🌟 Você fez minha semana melhor!
  7. 📚 Obrigado(a) por me ensinar!
  8. 🚗 Obrigado(a) por me levar!

## 10. Chamas da Semana (streak sem punição)

- **Quem vê:** perfis de 12 anos e adultos. Escondido para o de 6 anos.
- **Regra:**
  - O cartão mostra 7 lareiras (Seg–Dom).
  - Uma lareira **acende** 🔥 no dia em que a pessoa tem ≥1 tarefa validada com data daquele dia.
  - Dias sem chama mostram a lareira com lenha pronta, em visual neutro e sem texto. Nada "apaga" nem "quebra".
- **Semana Acesa:** atingida quando a semana chega a **5 chamas**. Dá +15 XP de **Bônus da Fogueira**, uma vez por semana.
- **Progresso longo prazo (cumulativo, nunca zera):**
  - **"Fogueira do Reino"** = total de Semanas Acesas desde sempre.
  - **"Dias de chama"** = total de dias com chama desde sempre.
  - Não existe contagem de semanas consecutivas.
- **Linguagem:** "4 chamas esta semana. Mais uma acende a Fogueira." Nunca "você perdeu a sequência".

## 11. Conquistas (20)

Todas as conquistas são calculadas a partir de dados do próprio perfil: XP, tarefas validadas, mentorias, agradecimentos e missões. Nenhuma compara membros. Uma conquista desbloqueada é permanente.

| id | Nome | Ícone | Condição |
|---|---|---|---|
| `primeira_tarefa` | Primeiro Passo | 👣 | ≥1 tarefa validada |
| `tarefas_10` | Mãos à Obra | ✋ | ≥10 tarefas validadas |
| `tarefas_50` | Pilar da Casa | 🏛️ | ≥50 tarefas validadas |
| `tarefas_100` | Coração do Reino | ❤️ | ≥100 tarefas validadas |
| `cozinha_10` | Aprendiz de Alquimia | 🧪 | ≥10 validadas na categoria `comida` |
| `lar_15` | Guardião(ã) das Muralhas | 🏰 | ≥15 validadas em `lar` |
| `estudo_15` | Leitor(a) de Pergaminhos | 📜 | ≥15 validadas em `estudo` |
| `cuidado_10` | Coração Cuidador | 💞 | ≥10 validadas em `cuidado` |
| `financas_5` | Tesouro em Dia | 🪙 | ≥5 validadas em `financas` |
| `planejamento_5` | Cartógrafo(a) | 🗺️ | ≥5 validadas em `planejamento` |
| `juntos_5` | Dupla Lendária | 👫 | ≥5 tarefas `compartilhada` validadas como responsável |
| `chamado_5` | Voluntário(a) do Lar | 🙋 | ≥5 tarefas `lar` pegas ("Eu faço/ajudo") e validadas |
| `gratidao_5` | Voz da Gratidão | 💌 | ≥5 agradecimentos enviados |
| `gratidao_rec_10` | Querido(a) do Reino | 🌟 | ≥10 agradecimentos recebidos |
| `mentor_1` | Primeira Mentoria | 🦉 | ≥1 mentoria com tarefa validada |
| `mentor_10` | Mestre Mentor(a) | 🎓 | ≥10 mentorias com tarefa validada |
| `missao_1` | Restaurador(a) | 🌷 | ≥1 missão a 100% em semana com ≥1 XP próprio |
| `missao_3` | Herói das Missões | 🏆 | ≥3 missões a 100% com participação |
| `semana_acesa` | Fogueira Acesa | 🔥 | ≥1 Semana Acesa (5 chamas) |
| `nivel_10` | Protetor(a) do Reino | 🛡️ | nível ≥10 |

## 12. Itens de personagem (16)

- **Slots:** `chapeu`, `ferramenta`, `companheiro`, `capa`. Há 1 item equipado por slot.
- **Itens iniciais:** todo perfil começa com o Gorro de Aprendiz e a Capa de Viagem.
- **Arte:** emoji sobre o avatar SVG. As capas são um `path` SVG com a cor indicada.
- **Ao desbloquear:** aparece o cartão "Novo item!" com o botão "Equipar".

| id | Item | Slot | Visual | Desbloqueio |
|---|---|---|---|---|
| `gorro_aprendiz` | Gorro de Aprendiz | chapeu | 🧢 | inicial |
| `capa_viagem` | Capa de Viagem | capa | SVG `#8B6B4A` | inicial |
| `escudo_madeira` | Escudo de Madeira | ferramenta | 🛡️ | nível 3 |
| `gatinho` | Gatinho Companheiro | companheiro | 🐱 | nível 5 |
| `capa_rubi` | Capa Rubi | capa | SVG `#C0392B` | nível 8 |
| `chapeu_mago` | Chapéu Estrelado | chapeu | 🎩 + ✨ | nível 10 |
| `raposa` | Raposa Esperta | companheiro | 🦊 | nível 15 |
| `varinha` | Varinha de Aurora | ferramenta | 🪄 | nível 20 |
| `coroa_ouro` | Coroa Dourada | chapeu | 👑 | nível 30 |
| `capa_real` | Manto Real | capa | SVG `#5B2C83` com borda `#D4A72C` | nível 40 |
| `colher_pau` | Colher Encantada | ferramenta | 🥄 | conquista `cozinha_10` |
| `vassoura` | Vassoura Mágica | ferramenta | 🧹 | conquista `lar_15` |
| `coruja` | Coruja Sábia | companheiro | 🦉 | conquista `mentor_1` |
| `coroa_flores` | Coroa de Flores | chapeu | 🌸 | conquista `missao_1` |
| `capa_estrelas` | Capa das Estrelas | capa | SVG `#1F3A6B` com estrelas | conquista `gratidao_5` |
| `dragaozinho` | Dragãozinho | companheiro | 🐲 | conquista `missao_3` |

## 13. Checklist anti-punição / anti-competição (QA)

- [ ] Nenhuma ação, automática ou manual, reduz XP, nível, conquista, item, chamas acesas ou estágio de missão. Os ledgers de XP aceitam apenas valores > 0.
- [ ] Nenhuma tela ou texto usa as palavras "atrasada", "falhou", "perdeu", "faltou", "errou", "castigo", "punição" ou "penalidade".
- [ ] Nenhum número negativo ou "−N" aparece na UI, nem mesmo ao trocar moedas no Baú.
- [ ] A cor vermelha não é usada para indicar estado de tarefa, saldo ou progresso.
- [ ] Tarefas não feitas de dias passados não aparecem em nenhuma tela (nem histórico, nem Mural, nem Crônica).
- [ ] "Ainda não" (pai) devolve a tarefa sem notificação, ícone ou registro negativo.
- [ ] O resgate recusado ("Agora não") devolve 100% das moedas reservadas.
- [ ] Não existe ranking, pódio, "melhor da semana", "MVP" ou ordenação de membros por XP, tarefas, moedas ou agradecimentos. Listas de membros usam sempre a ordem fixa da família.
- [ ] Não existe gráfico ou tela que coloque números de dois filhos lado a lado para comparação. O Mural mostra cada membro em sua faixa própria, sem barra relativa.
- [ ] O saldo de moedas de um perfil só é visível para o próprio perfil e para os adultos.
- [ ] Nenhuma conquista ou item depende de superar outro membro.
- [ ] O placar da missão é único e coletivo.
- [ ] Missão incompleta é exibida como "Restauramos X%" com o que voltou. Não aparece "faltou Y%".
- [ ] As Chamas da Semana não têm contagem de dias consecutivos nem mensagem de sequência quebrada. O dia sem chama tem visual neutro.
- [ ] O mentor não vê tarefas abertas do aprendiz e não consegue marcar, desmarcar ou comentar tarefas dele.
- [ ] Agradecimentos não são contados nem ordenados por destinatário no Mural.
- [ ] Toda celebração do perfil de 6 anos funciona sem leitura: ícone, animação e áudio (com fallback silencioso).
- [ ] Os textos do perfil de 12 anos não usam diminutivos nem tom infantil.
- [ ] O trabalho dos adultos (`trabalho`, `financas`, `planejamento`, `cuidado`) aparece no Mural e na Crônica em "Bastidores do Reino".
