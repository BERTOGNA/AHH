# Design System — Reino da Família (v2, "premium híbrido")

Substitui a seção 6 de `ux-design.md`. Direção escolhida pela família: **híbrido**.
- **Noite encantada** (índigo profundo + ouro luminoso) nos momentos de pertencimento e celebração: Boas-vindas, Salão do Reino, celebrações, PIN.
- **Marfim e joias** nas telas de uso diário (Aventura, Semana, Baú, Mural, Ficha, Painel), mais legíveis para a criança.

## Auditoria que motivou a v2

| Problema | Evidência | Decisão |
|---|---|---|
| Emoji fazendo papel de UI (nav, botões, estados) | 3 estilos de emoji misturados; 🧢 boné em todos os avatares | Ícones SVG próprios (`Icon`), selos e estrelas em SVG; emoji fica só no **conteúdo** (tarefas, rostos) |
| Bege sobre bege | `plaque` e fundo com quase o mesmo tom | Fundo marfim mais quente, cartões quase brancos com sombra em 3 níveis e borda fina |
| 3 vozes tipográficas brigando | Cinzel em todo título, Georgia nas frases, sans de sistema | 3 papéis com regras (abaixo) |
| Botões sem hierarquia | 45 `btn-ghost` × 32 `btn-gold`, ambos genéricos | 3 níveis: primário ouro, secundário tinta, terciário texto |
| Pastéis sem relação com o índigo/ouro | tints azul/lilás/verde/pêssego | Cores de **joia** profundas + tint para fundos |
| Missão = fila de emojis | 🌱🌷🪨🌷 | Cena ilustrada em SVG que evolui por estágio |

## Tokens

### Cor
| Token | Hex | Uso | Contraste |
|---|---|---|---|
| `night` | `#0F1230` | céu, Salão, celebrações | ivory 16,2 · gold-light 12,7 |
| `night-2` | `#1B2052` | painéis sobre a noite | ivory 13,6 |
| `night-3` | `#2A3170` | bordas/realces na noite | — |
| `moon` | `#B9B4D6` | texto secundário na noite | 9,2 sobre night |
| `bg` | `#F6F0E4` | fundo marfim | — |
| `surface` | `#FFFCF6` | cartões | — |
| `ink` | `#1E1A2B` | texto | 14,9 bg · 16,6 surface |
| `muted` | `#5B5468` | texto secundário | 6,4 bg |
| `line` | `#E3D8C3` | bordas e divisores (não-texto) | — |
| `gold` | `#D4A23F` | ouro metálico (preenchimentos, ícones, filetes) | ink sobre ele 7,3 |
| `gold-light` | `#F1D58A` | brilho, texto dourado sobre a noite | 12,7 sobre night |
| `gold-deep` | `#8A5A12` | texto dourado sobre claro | 5,8 surface |
| `wait` | `#FBEBC4` | fundo do estado "aguardando o selo" | ink 13+ |

**Joias dos heróis (por slot):** safira `#2550B8`, ametista `#7A3BA6`, esmeralda `#1D7350`, topázio `#B0501A`; tints `#E3EAFA`, `#F1E7F8`, `#DDF0E6`, `#FBE6D6`.
Texto branco sobre a joia: 5,2 a 7,2. Joia sobre bg: 4,6 a 6,3. Ouro-claro sobre a joia só em **texto grande** (≥24px bold; 3,7 a 5,0).
Vermelho nunca indica estado.

### Tipografia (3 papéis)
| Papel | Fonte | Onde | Regras |
|---|---|---|---|
| **Insígnia** | Cinzel 600/700 | nome do reino, nomes dos heróis, título de celebração | ≤ 30 caracteres; nunca em parágrafo; nunca na tela de 6 anos |
| **Título** | Fraunces (variável, empacotada) | títulos de tela e de seção, frases de história, falas da missão | caixa normal (sem caps), `opsz` automático, peso 600 |
| **Interface** | Plus Jakarta Sans (variável, empacotada) | todo o resto: botões, listas, rótulos, números | números `tabular-nums` |

Escala: 13 · 15 · 17 (base) · 20 · 24 · 30 · 38 · 48. Tela de 6 anos: mínimo 22, títulos 26–32 em Fraunces.

### Elevação
- `e1` cartão: `0 1px 2px rgb(30 26 43 / .06), 0 4px 14px rgb(30 26 43 / .06)`
- `e2` destaque/hover: `0 2px 4px rgb(30 26 43 / .08), 0 12px 30px rgb(30 26 43 / .10)`
- `e3` modal/celebração: `0 24px 60px rgb(15 18 48 / .35)`
- Na noite, "brilho": `0 0 0 1px rgb(241 213 138 / .25), 0 10px 40px rgb(0 0 0 / .35)`

### Raio, espaço e movimento
- Raio: 12 (controles), 20 (cartões), 28 (cartões de 6 anos), 999 (chips).
- Espaço: escala de 4 (4, 8, 12, 16, 24, 32, 48).
- Movimento: 160 ms (toque), 320 ms (carimbo), 600 ms (estrela), `cubic-bezier(.2,.9,.3,1.2)`; `prefers-reduced-motion` desliga partículas e rotações.

## Componentes

### Botão (3 níveis)
| Variante | Classe | Visual | Use quando |
|---|---|---|---|
| Primário | `btn btn-primary` | gradiente ouro metálico, texto `ink`, brilho interno superior | a ação principal da tela (Validar, Começar, Salvar) |
| Secundário | `btn btn-secondary` | `ink` sólido (no claro) / ivory translúcido (na noite), texto claro | ações importantes mas não principais |
| Terciário | `btn btn-ghost` | só texto + borda fina `line`, fundo transparente | Desfazer, Voltar, Agora não |
Estados: hover (eleva e2 / clareia), active (escala .97), foco (anel 3px safira + halo surface), disabled (opacidade .45, sem sombra).
Altura mínima 48px; tela de 6 anos ≥ 64px (padrão 88).

### Ícone (`<Icon name size />`)
SVG de traço 1,75px, `stroke: currentColor`, grade 24. Sempre `aria-hidden`; o rótulo fica no botão.
Conjunto: castle, map, calendar, chest, scroll, lock, unlock, speaker, heart, seal, hourglass, star, check, plus, chevron-left/right, flame, coin, users, home, sparkle, close, undo, gear, shield, gift, clock, pencil, crown, trophy, book.

### Medalhão do herói (`Avatar`)
Bezel dourado em SVG (anel duplo com gradiente metálico), interior em gradiente radial da joia → tint, rosto (emoji base) a 56%. Itens equipados aparecem como **pingentes** dourados pequenos (ferramenta à direita, companheiro à esquerda). O chapéu inicial não é desenhado; chapéus desbloqueados aparecem como pingente no topo.

### Estandarte (`HeroBanner`, Salão)
Tecido na cor sólida da joia, com gradiente vertical sutil, franja dourada embaixo (recorte em V), filete dourado de 2px nas bordas, medalhão no topo, nome em Cinzel ouro-claro, classe em branco.

### Cena da missão (`MissionScene`)
SVG 16:9 por missão. Camadas: céu (claro na v. diária / noite no Salão), colinas, marco da missão (jardim, farol, ponte, ovo, biblioteca, banquete) com **5 estágios** (0/25/50/75/100%) que adicionam elementos; névoa que se dissipa a cada estágio. Nunca regride.

### Selo e estrela
- Selo de cera (aguardando): disco âmbar com relevo e ampulheta gravada (SVG).
- Estrela (validada): estrela de 5 pontas em ouro com brilho (SVG).
Ambos reconhecíveis pela **forma**, não só pela cor.

### Chip, campo, cartão
- `chip`: 48px, borda `line`, selecionado = `night` sólido com texto ivory.
- `field`: 48px, fundo surface, borda `line`, foco safira.
- `card` (antigo `plaque`): surface + e1 + borda 1px `line` + raio 20; `card-gilded` adiciona filete dourado interno para destaques.

## Do / Don't
| ✅ Faça | ❌ Não faça |
|---|---|
| Emoji só no conteúdo (tarefa, rosto, recompensa) | Emoji em navegação, estados ou botões de sistema |
| Uma ação primária (ouro) por área | Vários botões ouro lado a lado |
| Fraunces em títulos de tela | Cinzel em títulos de seção ou parágrafos |
| Joia sólida com texto branco | Texto pequeno colorido sobre tint |

## Auditoria de acessibilidade da v2 (WCAG 2.1 AA)

Feita no app rodando (Chromium, 1180×820, 390×844 e zoom de 200%), varrendo o contraste calculado de cada texto renderizado, os alvos de toque, os nomes acessíveis e o foco.

| Achado | Critério | Correção |
|---|---|---|
| Ouro metálico `#D4A23F` usado como **texto** ("+20 XP", dia de hoje, XP no Painel): 2,3:1 | 1.4.3 | Todo texto dourado sobre claro usa `gold-deep` (5,8:1); o ouro metálico fica só para preenchimentos e ícones |
| Contador das abas do Painel com texto branco sobre ouro: 2,3:1 | 1.4.3 | Texto em tinta sobre ouro (7,3:1) |
| Branco a 80% sobre o estandarte topázio: 3,9:1 | 1.4.3 | Tecido mais escuro na área do texto; texto branco pleno (≥ 5,2:1) |
| Conquistas bloqueadas com opacidade de 55% | 1.4.3 | Opacidade removida; o estado bloqueado é indicado pelo cadeado e pelo fundo |
| Avatar do cabeçalho na tela de 6 anos com 56–60px | 2.5.5 (meta do projeto: 64px) | 64px |
| "Sair do modo pais" com 44px de largura no celular; botão de 44px em Ajustes | 2.5.5 | 48px |
| Rolagem horizontal na Ficha no celular | 1.4.10 | Grade de estatísticas em 1 coluna abaixo de 480px |

Resultado depois das correções: 0 textos reprovados nas telas de fundo sólido; nenhuma rolagem horizontal em 390px nem com zoom de 200%; foco visível em todos os passos de Tab; nenhum botão sem nome.
Os fundos com gradiente (noite, estandartes) foram verificados pela tabela de contraste acima, no pior ponto do gradiente.
Exceções conscientes: os blocos finos da grade semanal no tablet (ver `docs/PLANO.md`) e as caixas de seleção de Ajustes, cujo alvo é a linha inteira do rótulo (48px).
