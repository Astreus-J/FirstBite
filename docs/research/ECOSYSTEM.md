# Cookie Chain — Mapeamento de Ecossistema

Data de acesso das fontes: 2026-09-14.
Todas as fontes são web (WebSearch/WebFetch) — não há acesso a terminal/RPC real neste ambiente, então nenhum dado abaixo foi validado por chamada RPC direta. Tratar como pesquisa documental, não como verificação técnica ao vivo.

## 0. Contexto crítico descoberto (não estava no briefing original)

**FirstBite muito provavelmente é uma submissão para o bounty "Create an App on Cookie Chain" no Superteam Earn.**

- FATO CONFIRMADO — Listing: https://superteam.fun/earn/listing/create-an-app-on-cookie-chain-app/ (acessado 2026-09-14)
  - Sponsor: Cookie Chain
  - Prêmio: US$ 1.000 USDC total (US$ 500 para 1º lugar, US$ 500 para 2º lugar)
  - Anúncio dos vencedores: 28/09/2026
  - Escopo declarado no listing: apenas "Create an App on Cookie Chain" — sem escopo técnico detalhado publicado na própria página (a página não lista requisitos de aceitação, nem exemplos de app).
  - **72 submissões registradas** no momento da coleta.
- FATO CONFIRMADO — Existe um repositório oficial do sponsor que centraliza as submissões: https://github.com/cookiechain/superteam-hackathon-submissions (README diz que reúne as entradas do bounty para revisão lado a lado e que os vencedores serão incorporados ao "Cookie Chain Apps Registry" público). Esse repo tinha 15 Pull Requests (submissões) visíveis via `gh api` em 2026-09-14 — bem menos que as 72 relatadas no listing, ou seja, a maioria das 72 submissões não abriu PR nesse repo (foram enviadas só pelo Superteam Earn) ou o repo não está totalmente sincronizado. **Isso é uma divergência não resolvida** — não presumir que os 15 PRs são a lista completa de concorrentes.

Implicação prática: os "concorrentes" mais relevantes para FirstBite não são apps genéricos do ecossistema Solana, e sim as ~72 outras submissões ao mesmo bounty, competindo pelo mesmo prêmio de US$ 1.000. Ver `COMPETITORS.md`.

## 1. O que é a Cookie Chain (tecnicamente)

| Aspecto | Informação | Status | Fonte |
|---|---|---|---|
| Tipo de rede | "Independent SVM (Solana Virtual Machine) network... not Solana, with its own validator set and genesis hash" | FATO CONFIRMADO (docs oficiais) | docs.cookiechain.wtf/getting-started (via WebFetch, 2026-09-14) |
| É L1, rollup ou appchain? | Documentação oficial não usa nenhum desses termos explicitamente. Se descreve como "community-operated SVM Layer 1 blockchain" em material de marketing (cookiechain.wtf) e como rede SVM independente nos docs. | INFERÊNCIA — provavelmente um L1 SVM standalone (fork/clone do Solana validator client), não um rollup nem um appchain com settlement em outra chain. Não há menção a L2/rollup/DA layer em nenhuma fonte. | cookiechain.wtf, docs.cookiechain.wtf |
| Consenso | "Solana-style consensus mechanism" | FATO CONFIRMADO (nível de detalhe baixo) | docs.cookiechain.wtf |
| Finalidade | "Sub-second finality... around 1 second block times"; um repo de bounty relata ~0,8s de block time observado on-chain | FATO CONFIRMADO nos docs oficiais + consistente com observação independente de terceiros (bounty submission) | docs.cookiechain.wtf; GitHub graylingops/cookiechain-capp |
| Genesis hash | `9wDaBRDgArEUpvhHxGguNkwozsZh4UpGZB9o2EoEcBB2` | Reportado por UMA submissão de bounty (não é fonte oficial do sponsor) | github.com/graylingops/cookiechain-capp (README) — **NOT VERIFIED contra fonte oficial**, apenas prior art de terceiro |
| RPC público | `https://rpc.cookiescan.io` | FATO CONFIRMADO — citado de forma consistente pelos docs oficiais e por múltiplas submissões independentes (cookie-tab, arisan, cookiechain-capp) | docs.cookiechain.wtf; múltiplos repos |
| WebSocket público | `wss://wss.cookiescan.io` | Citado de forma consistente por múltiplas submissões de terceiros, mas **não confirmado na doc oficial fetchada** (a página getting-started não trouxe o WS) | github.com/TheBenMeadows/cookie-tab, github.com/graylingops/cookiechain-capp |
| Taxa de transação | ~5.000–10.000 lamports por assinatura (≈0,000005–0,00001 COOK) | Consistente entre 3 fontes independentes (cookie-tab, arisan, cookiechain-capp) + citado em marketing oficial ("Avg Fee/TX: 0.000005 COOK") | cookiechain.wtf (homepage), + repos de terceiros |
| Deploy de programa | "dirt-cheap" / "pennies (~$0.05)" comparado à mainnet Solana | FATO CONFIRMADO (docs oficiais, sem número exato consistente — um WebSearch sintetizado citou "$0.05", não confirmado por fetch direto da doc) | docs.cookiechain.wtf (síntese); tratar valor exato como INFERÊNCIA |
| Compatibilidade | "SPL tokens, programs, and tooling work out of the box" | FATO CONFIRMADO | docs.cookiechain.wtf |
| Operação/governança | Comunitária, sem fundação controladora; multi-sig 6-de-10 citado no marketing; validador set em expansão | FATO CONFIRMADO (docs) para "community-operated, no foundation control"; o "6-of-10" é de fonte secundária (WebSearch synthesis) — **NOT VERIFIED diretamente por fetch** | docs.cookiechain.wtf; síntese WebSearch |

### Divergência relevante encontrada

Um WebFetch da homepage (cookiechain.wtf) retornou um "Token: $COOKCA, Contract Address: 36ZrtQoab5MhhySaP1YSTwUahSk6GRVUTtZ6cuVfm9e1, negociado na Jupiter" — isso **contradiz** a afirmação (também da mesma página e dos docs) de que COOK é o token nativo/gas da chain. É possível que:
(a) a extração do WebFetch tenha capturado um widget de "token em destaque" não relacionado ao COOK nativo (ex.: um memecoin lançado via MomoSwap, indexado na Jupiter via bridge), ou
(b) tenha havido erro de extração/alucinação do modelo intermediário do WebFetch.
**NOT VERIFIED** — recomendo re-checar manualmente a homepage antes de tomar qualquer decisão de produto baseada nisso. Não presumir que COOK tem um contract address SPL na Solana mainnet só por causa deste dado.

## 2. Token COOK — nativo ou SPL?

- FATO CONFIRMADO (múltiplas fontes independentes e consistentes): **COOK é o token nativo/gas da Cookie Chain**, análogo ao SOL na Solana — "Cookie Chain's gas token is native COOK, so there are no SPL token accounts and no ATAs" (repo Arisan, que movimenta COOK nativo em vaults PDA sem ATAs).
- Decimais: **9 decimais** — não está explicitamente escrito em nenhuma doc oficial fetchada, mas é **inferência forte e consistente** a partir de 3 fontes independentes de terceiros que calculam taxas: 5.000 lamports = 0,000005 COOK (5000 / 10^9). Se fosse outro número de decimais essas contas não baterim. Tratar como "praticamente certo, mas não citado literalmente pelo sponsor" (nenhuma doc diz "9 decimals" em texto).
- Existe também **sCOOK**: descrito como a representação do COOK no lado Solana, usada para bridging 1:1 via Hyperlane ("You acquire sCOOK on Solana and bridge it 1:1... via hyperlane.cookiescan.io"). **NOT VERIFIED em detalhe** se sCOOK é SPL Token clássico ou Token-2022 — nenhuma fonte especificou o padrão exato do mint na Solana. Isso é uma lacuna real para quem for implementar onboarding cross-chain.
- Havia um endereço citado como "Native COOK (wrapped mint)" = `So11111111111111111111111111111111111111112` num README de terceiro (cookie-tab) — esse é literalmente o mesmo endereço do "Wrapped SOL" na Solana mainnet. Isso é consistente com o padrão SVM em que o token nativo tem um "wrapped mint" reservado nesse endereço fixo para uso em contextos de SPL Token program — não é uma anomalia, é como Solana trata SOL/wSOL. Mas é prior art de terceiro, não confirmado pelo sponsor.

## 3. Explorer, bridge e APIs

| Serviço | URL | Status |
|---|---|---|
| Explorer (CookieScan) | https://cookiescan.io | FATO CONFIRMADO, presente no registry oficial (`cookiechain/apps`) |
| Bridge (Hyperlane) | https://bridge.cookiescan.io e/ou https://hyperlane.cookiescan.io (ambas URLs aparecem em fontes diferentes) | FATO CONFIRMADO que o bridge existe e usa Hyperlane; **divergência de URL não resolvida** entre `bridge.cookiescan.io` (citado em cookie-tab/cookiechain-capp) e `hyperlane.cookiechain.wtf` / `hyperlane.cookiescan.io` (citado no registry oficial e docs). Confirmar a URL canônica antes de linkar em produção. |
| CookieScan DAS API | https://api.cookiescan.io | FATO CONFIRMADO — listada no registry oficial `cookiechain/apps` como "CookieScan DAS API — Public DAS Service for COOK. Provides enriched, indexed blockchain data for developers." |
| Cookie MCP | https://github.com/cookiechain/cookie-mcp (pacote npm `cookie-mcp`) | FATO CONFIRMADO — repositório sob a org oficial `cookiechain`, listado no registry oficial, publicado no MCP Registry e em mcpservers.org. Roda localmente via stdio, não-custodial. Permite a um agente de IA: ler mercado, swap, transferir COOK/SPL/Token-2022, criar ordens limit/stop, lançar tokens (MomoSwap), gerenciar liquidez, stake líquido (bCOOK), negociar NFTs (Baked Bazaar), bridging via Hyperlane, e resolver/registrar nomes `.cook` (CookOven). Não é uma "faucet API" nem tem função de claim/onboarding embutida. |
| CookOven (.cook names) | https://cookoven.xyz / https://book.cookoven.xyz | FATO CONFIRMADO — serviço de nomes de domínio on-chain, análogo a .sol |
| Onboarding portal | https://onboard.cookiechain.wtf | Mencionado em resultado de busca como o lugar para "adquirir sCOOK on Solana" antes de fazer bridge. **NOT VERIFIED diretamente** (não fiz fetch dessa URL específica) — checar antes de referenciar como oficial. |
| Faucet | — | **CONFIRMADO QUE NÃO EXISTE FAUCET OFICIAL.** Múltiplas fontes de terceiros dizem explicitamente "Cookie Chain still has no faucet" (repo cookiechain-capp, WebSearch sobre faucet). Novos desenvolvedores dependem de (a) bridge de sCOOK da Solana, ou (b) pedir COOK diretamente ao time da Cookie Chain, ou (c) "sponsor gas drips" pontuais que apps de bounty relatam ter recebido do sponsor para testes. Isso é um dado central para o FirstBite: **não existe infraestrutura de faucet nativa da chain** — qualquer "fee sponsorship" hoje é implementado por app individual, não pela chain. |

## 4. Wallets suportadas

- **Nightly** é a carteira "oficialmente" destacada: aparece no registry oficial `cookiechain/apps` como "The first COOK supported wallet." FATO CONFIRMADO.
- Nightly Wallet (docs.nightly.app) suporta redes SVM customizadas de forma **genérica**, via API `window.nightly.solana.changeNetwork({genesisHash, url})`, validando a rede pelo `genesisHash` obtido via RPC `getGenesisHash`. A documentação oficial da Nightly lista 8 ecossistemas suportados (Solana, Canton, Sui, IOTA, Polkadot, Aptos, Movement, EVM) — **Cookie Chain não é citada nominalmente** nessa doc; o suporte é por meio do mecanismo genérico de "custom SVM network", não por uma integração dedicada anunciada pela Nightly. Pacote SDK relevante: `selector-solana` (dentro do monorepo Nightly Connect SDK).
- Um repositório de bounty (Arisan) reporta um problema real de integração: "Wallet-adapter's `signTransaction` does not forward a chain identifier, and Nightly does not publish Cookie Chain through the Wallet Standard even while pointed at it. So a wallet may preview against the wrong network and warn that the transaction will fail. It will not." — ou seja, há hoje uma fricção de UX/segurança conhecida: a Nightly pode mostrar avisos incorretos de rede errada mesmo operando corretamente na Cookie Chain, porque a chain não está publicada no Wallet Standard. Isso é relevante para o fluxo de claim do FirstBite (risco de assustar usuário novo com aviso de "rede errada").
- Outra carteira listada no registry oficial, mas marcada `"live": false`: **Morsel Wallet** ("The native home of Cookie Chain assets... SOL, USDC and sCOOK included") — carteira nativa da Cookie Chain, ainda não lançada/live segundo o próprio registro oficial em 2026-09-14.

## 5. Registry oficial de apps/ecossistema

FATO CONFIRMADO: existe um registry oficial mantido pelo sponsor em `https://github.com/cookiechain/apps`, arquivo `apps.json`, cujo conteúdo alimenta páginas oficiais/ecossistema. Snapshot em 2026-09-14 (20 entradas, campo `live` indica status):

| App | Categoria (`tag`) | live | Descrição |
|---|---|---|---|
| CookieScan | Infra | true | Block explorer |
| Hyperlane Bridge | Infra | true | Bridge Solana ↔ Cookie Chain |
| Nightly Wallet | Wallet | true | Carteira principal suportada |
| DefiLlama | Infra | true | Dashboard de TVL/volume |
| Bake Your Stake | Infra | true | Staking de COOK |
| CookieSwap | DeFi | true | DEX nativa |
| Candy Shop | DeFi | true | Agregador de rotas DeFi |
| Metaplex | Infra | true | Padrão de tokens/NFTs |
| Cookie Quads | Infra | true | Fork do Squads v4 (multisig) |
| Cookiebox | DeFi | true | Liquidity hub (pools, LP, claim de fees) |
| CookieScan DAS API | Infra | true | API de dados indexados |
| MomoSwap | DeFi | **false** | Launchpad de bonding curve |
| Morsel Wallet | Wallet | **false** | Carteira nativa (ainda não live) |
| CookOven | DeFi | true | Hub de domínios `.cook` e dApps |
| CookBook | Infra | true | Registro de domínios `.cook` |
| Cookie Lock | Infra | true | Locks/vesting de tokens (SPL e Token-2022) |
| Cookie Chat | AI | true | Assistente de IA |
| GORBOY | Meme | true | Memecoin gamificado |
| Sesamians | NFT | true | Coleção NFT |
| Baked Bazaar | NFT | true | Marketplace de NFT |
| GorWeld | Meme | **false** | Jogo de solda no browser + NFTs |
| Cookie MCP | Infra | true | MCP server oficial para agentes de IA |

**Nenhuma dessas 20 entradas do registry oficial é uma ferramenta de faucet, claim-link, onboarding com QR, ou fee-sponsorship dedicada.** Essas categorias de produto simplesmente não existem hoje no registry oficial — o que é evidência a favor de um espaço em aberto para o FirstBite, mas ver `COMPETITORS.md` para as ~15+ submissões de bounty (que ainda não entraram no registry oficial porque o bounty ainda não terminou — anúncio em 28/09/2026).

## 6. Lacunas / pontos que precisam de validação antes de codar

1. **NOT VERIFIED**: número exato de decimais do COOK (inferido como 9, nunca declarado literalmente pelo sponsor).
2. **NOT VERIFIED**: padrão exato do token sCOOK na Solana (SPL clássico vs Token-2022).
3. **NOT VERIFIED**: URL canônica do bridge (`bridge.cookiescan.io` vs `hyperlane.cookiescan.io` vs `hyperlane.cookiechain.wtf` — três variantes apareceram em fontes diferentes).
4. **NOT VERIFIED**: genesis hash oficial (só temos o valor reportado por uma submissão de terceiro, não por doc do sponsor).
5. **NOT VERIFIED**: divergência do "$COOKCA / contract address / Jupiter" na homepage — pode ser ruído de extração, não presumir que é real sem checagem manual.
6. **Confirmado, mas com fricção conhecida**: Nightly não publica Cookie Chain no Wallet Standard, então avisos de "rede errada" podem aparecer mesmo em transações corretas — isso deve ser tratado explicitamente na UX de claim do FirstBite (ex.: aviso próprio explicando isso, para não assustar o usuário novo).
7. **Confirmado**: não existe faucet oficial da chain. Qualquer sponsorship de fee hoje é ad-hoc, mantido por cada app individualmente (ex.: "operator demo wallet" com gas drip pontual do sponsor). Isso significa que o FirstBite precisaria manter sua própria carteira "relayer/sponsor" com saldo de COOK — não há um serviço de paymaster genérico oficial da Cookie Chain (diferente do que existe oficialmente no ecossistema Solana mainnet via Solana Cookbook "Fee Sponsorship" e produtos como Blink Labs "Gas Sponsorship").
