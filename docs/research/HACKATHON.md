# Pesquisa: Bounty "Create an App on Cookie Chain" (Superteam Earn)

> Pesquisa factual conduzida em 2026-09-14. Todas as afirmações estão marcadas como
> **FATO CONFIRMADO** (com fonte), **INFERÊNCIA ESTRATÉGICA** (dedução razoável mas
> não declarada pelo sponsor) ou **NOT VERIFIED** (não encontrado / não confirmado).
> Ferramentas usadas: WebFetch (renderiza o listing como Markdown; o site da Superteam
> Earn é uma SPA — parte do conteúdo dinâmico pode não ter sido capturado) e WebSearch.

---

## Descrição

**FATO CONFIRMADO.** Título do listing: **"Create an App on Cookie Chain"**.
Sponsor: **Cookie Chain**. Tipo: **Bounty** (não é chamado de "hackathon" no listing
em si, embora o repositório oficial de submissões o trate como parte de um processo
tipo hackathon). Habilidades pedidas no listing: **Frontend, Backend, Blockchain**.
Participação: global/aberta.
Fonte: https://superteam.fun/earn/listing/create-an-app-on-cookie-chain-app/ (acesso 2026-09-14).

**FATO CONFIRMADO.** O objetivo declarado (via repositório oficial que cataloga as
submissões, mantido pelo sponsor) é: construir um app ("cApp") que rode na Cookie
Chain — cobrindo frontend, backend e/ou componentes on-chain — e submetê-lo tanto
pelo listing da Superteam Earn quanto por um Pull Request no repositório
`cookiechain/superteam-hackathon-submissions`, que adiciona a entrada ao arquivo
`apps.json` (citado como fonte de verdade para o "Cookie Chain Apps Registry" público).
Fontes:
- https://github.com/cookiechain/superteam-hackathon-submissions (acesso 2026-09-14)
- https://raw.githubusercontent.com/cookiechain/superteam-hackathon-submissions/main/README.md (acesso 2026-09-14)

**FATO CONFIRMADO.** Cookie Chain é descrita (site oficial) como uma rede
**SVM (Solana Virtual Machine)**, "community-operated", com execução rápida e taxas
baixas, "solana-core 4.1.2"-compatível segundo relatos de submissões de terceiros
(ver seção Links/Recursos). Token nativo: **COOK** (9 decimais). O site oficial
menciona "fixed 1B supply, ~110% equity-backed reserves, 6-of-10 multi-sig governance".
Fonte: https://www.cookiechain.wtf/ (acesso 2026-09-14).

---

## Obrigatório

Com base no README do repositório oficial de submissões (que é a única fonte
encontrada com uma lista explícita de requisitos de aceite — o próprio listing da
Superteam Earn não apresenta uma seção estruturada de requisitos):

**FATO CONFIRMADO** — para uma entrada em `apps.json` ser aceita, ela precisa ter:
- `id` único, em kebab-case minúsculo
- `title`, `shortDescription`, `description`
- `category` (categoria única primária) e `tags`
- `links.website` e `links.github` (obrigatórios)
- `media.logo` (PNG/JPG/SVG/WEBP, recomendado 512×512px)
- `team[].name` (pelo menos um membro nomeado)
- Todas as mídias devem estar hospedadas como URLs `raw.githubusercontent.com`
  **dentro do próprio repositório da submissão/PR** — citação literal: *"Hotlinking
  to X, Imgur, IPFS, or your own host is not accepted."*

**FATO CONFIRMADO** — critérios de aceite/avaliação declarados no README (não é
uma rubrica com pesos/pontuação, é uma lista de "deve cumprir"):
- O app deve **rodar na Cookie Chain** ("mainnet or a clearly documented testnet
  deployment")
- Deve ter uma **URL pública funcional** (não basta o repositório)
- Deve ter **código-fonte real no GitHub**, com commits do período do hackathon
- Citação literal: *"Ship something usable, not a landing page or a mockup"*
- Submissões de spam, forks não modificados e entradas enganosas são rejeitadas

**FATO CONFIRMADO** — processo de submissão: fork do repositório, adicionar os
arquivos de mídia, incluir a entrada no `apps.json`, abrir um Pull Request. O README
valida isso como o mecanismo de catalogação, mas afirma explicitamente: *"Official
Submission: Entries must be submitted through the Superteam Earn listing... though
this repository catalogs all submissions."* — ou seja, **a submissão oficial e
vinculante ao prêmio é via botão "Submit Now" no listing da Superteam Earn**; o PR
no GitHub parece ser o mecanismo real usado pela maioria dos participantes observados
(há PRs reais de outros participantes) para entrar no registro público, mas não há
confirmação de que o PR por si só garanta elegibilidade ao prêmio sem a submissão no
Earn.
Fonte: https://raw.githubusercontent.com/cookiechain/superteam-hackathon-submissions/main/README.md (acesso 2026-09-14).

**NOT VERIFIED** — não há, em nenhuma fonte encontrada, exigência de uso obrigatório
de um SDK específico da Cookie Chain, de um programa on-chain específico, de uma
carteira específica, ou de qualquer biblioteca proprietária. A única "exigência
técnica implícita" é rodar sobre a rede Cookie Chain (RPC/endereço de rede — ver
seção Links/Recursos).

---

## Recomendado

**INFERÊNCIA ESTRATÉGICA**, com base em como submissões reais já aceitas se
comportam (observação de projetos no `apps.json` e em buscas — ver
`WINNING_PATTERNS.md`) e no padrão geral de bounties da Superteam:
- Usar a **carteira Nightly**, citada como a carteira "preferida"/nativa em múltiplas
  submissões de terceiros para Cookie Chain (CookieFlow, CookieForge, Cookie Jar,
  CookieDash). Phantom/Solflare aparentemente também funcionam adicionando a Cookie
  Chain como rede SVM customizada apontando para o RPC oficial — mas isso vem de
  descrições de submissões de terceiros, não da documentação oficial do sponsor, e
  por isso é classificado como **INFERÊNCIA**, não FATO CONFIRMADO.
- Preencher todos os campos opcionais do schema (`demo`, `docs`, `video`,
  `media.banner`, `media.screenshots`, perfis X/GitHub do time) — aumentam a
  qualidade percebida da entrada no registro público.
- Deploy documentado (mainnet ou testnet "clearly documented") com instruções
  claras de como verificar a transação on-chain no explorer oficial.

**FATO CONFIRMADO (recursos técnicos oficiais/community, ver seção Links)**:
- RPC: `https://rpc.cookiescan.io`
- Explorer: `https://cookiescan.io`
- Suporte de dúvidas: Telegram `@TheCookieNetChain` (citado diretamente no listing
  da Superteam Earn) e também um Discord oficial (`discord.gg/dP6EjZeSJW`, citado no
  site oficial `cookiechain.wtf`).

---

## Diferenciais

**INFERÊNCIA ESTRATÉGICA** (não há critério de julgamento pontuado publicado pelo
sponsor; isto é dedução a partir da linguagem do README + padrão do ecossistema
Solana/Superteam, documentado em `WINNING_PATTERNS.md`):
- Resolver uma fricção **real e específica** da própria Cookie Chain, não uma
  feature genérica de qualquer chain SVM.
- Uma achado de pesquisa diretamente relevante ao FirstBite: uma submissão de
  terceiro (`graylingops/cookiechain-capp`, também chamada "Cookie Jar") relatou
  em seu próprio README que sua carteira de demonstração ficou "gas-gated pending
  the sponsor test-gas drip" e que em **2026-09-13** "the sponsor COOK gas drip
  landed" — ou seja, **o próprio ecossistema relata que carteiras novas não têm
  como conseguir COOK para pagar a primeira taxa** (sem faucet público — ver
  citação abaixo). Isso é evidência (de uma fonte terciária, não do sponsor
  oficialmente, mas factual quanto ao que essa submissão relata) de que a fricção
  de "carteira com saldo zero não consegue pagar gas" é um problema conhecido e
  discutido dentro do próprio hackathon — o que valida o problema central do
  FirstBite, mas também indica que **pelo menos um outro projeto já tangencia essa
  dor** (sponsorship de gas), então o FirstBite precisa se diferenciar na execução
  (ex: onboarding via QR/link para usuário final, não apenas destravar a wallet de
  demo do próprio operador).
  Fonte: https://github.com/graylingops/cookiechain-capp (acesso 2026-09-14, README do projeto).
- Citação literal encontrada na mesma fonte sobre ausência de faucet: novos
  usuários precisam obter COOK via "community bridge from Solana" ou "direct
  request to the Cookie Chain team (no faucet available)". **Isto é uma afirmação
  de uma submissão de terceiro, não da documentação oficial do sponsor** — trate
  como indício forte, não como fato institucional confirmado pela Cookie Chain.

---

## Não informado

Itens explicitamente **NOT VERIFIED** após pesquisa direta no listing, no
repositório oficial e em buscas:
- **Deadline exato de submissão** (data de fechamento). Só foi encontrada a data de
  **anúncio dos vencedores**: 28 de setembro de 2026. O listing mostra status
  "Open" sem contagem regressiva capturável via WebFetch.
- Critérios de julgamento com pesos/pontuação (ex: "40% inovação, 30% execução...").
  Não existe rubrica publicada — apenas a lista de "deve cumprir" citada acima.
- Se equipes (times) são permitidas além de indivíduos — o schema `team[]` aceita
  múltiplos membros, mas não há regra explícita de tamanho máximo de equipe.
- Se há limite de uma submissão por pessoa/equipe.
- Se o prêmio é por submissão, por pessoa ou por equipe.
- SDK, framework ou linguagem obrigatória — nenhuma exigência encontrada além de
  "rodar na Cookie Chain".
- Conteúdo técnico completo da documentação oficial (`docs.cookiechain.wtf`): o
  menu mostra seções ("Architecture", "COOK token", "Validators", "Bridge",
  "Developer Guide", "Cookie Jar", "Ecosystem Programs", "Getting Started") mas o
  conteúdo interno dessas páginas não pôde ser extraído via WebFetch (site parece
  ser uma SPA que não renderiza conteúdo estático para o crawler).
- Endereço exato do contrato/mint nativo do token COOK na própria Cookie Chain
  (o endereço `36ZrtQoab5MhhySaP1YSTwUahSk6GRVUTtZ6cuVfm9e1` encontrado é citado no
  contexto de compra via Jupiter, o que sugere ser uma representação em Solana, não
  necessariamente o mint nativo da L1 Cookie Chain — **NOT VERIFIED** qual é qual).
- Genesis hash oficial da rede (`9wDaBRDgArEUpvhHxGguNkwozsZh4UpGZB9o2EoEcBB2`) foi
  citado apenas por uma submissão de terceiro, não por fonte oficial do sponsor —
  **NOT VERIFIED** contra a documentação oficial.

---

## Datas/Prazos

- **FATO CONFIRMADO**: Anúncio dos vencedores — **28 de setembro de 2026** ("as
  scheduled by the sponsor"). Fonte: WebFetch do listing e do README do repositório
  oficial, ambos acessados em 2026-09-14.
- Data de publicação do bounty: **NOT VERIFIED**.
- Deadline de submissão: **NOT VERIFIED** (distinto da data de anúncio de vencedores).
- Contagem de submissões observada no momento do acesso: entre 68 e 72 (variação
  entre duas capturas na mesma sessão de pesquisa, o que indica que o número muda
  em tempo real e não deve ser tratado como estático).

---

## Prêmios

**FATO CONFIRMADO**:
- Pool total: **1.000 USDC**
- 2 vencedores: **1º lugar 500 USDC**, **2º lugar 500 USDC**
- Não há prêmios adicionais (menções, tracks especiais, etc.) documentados neste
  listing especificamente — diferente de hackathons maiores da Colosseum/Superteam
  Build citados em `WINNING_PATTERNS.md`.

---

## Links/Recursos oficiais

**FATO CONFIRMADO** (com fonte e data de acesso 2026-09-14 para todos):
- Listing Superteam Earn: https://superteam.fun/earn/listing/create-an-app-on-cookie-chain-app/
- Repositório oficial de submissões/registro: https://github.com/cookiechain/superteam-hackathon-submissions
- Site institucional: https://www.cookiechain.wtf/
- Documentação (nav apenas, conteúdo não extraído): https://docs.cookiechain.wtf
- Explorer: https://cookiescan.io
- RPC: https://rpc.cookiescan.io
- Bridge (site institucional): https://bridge.cookiescan.io
- Bridge Hyperlane (citado em README de submissão de terceiro, não confirmado no
  site oficial): https://hyperlane.cookiescan.io
- Investor page: https://invest.cookiechain.wtf
- Discord: discord.gg/dP6EjZeSJW (citado no site oficial)
- Twitter/X oficial: @TheCookieChain (citado no site oficial)
- Suporte para dúvidas do bounty: Telegram @TheCookieNetChain (citado no listing)

**INFERÊNCIA / menor confiança** (citados apenas em READMEs de submissões de
terceiros, não em fonte primária do sponsor):
- WSS RPC: `wss.cookiescan.io` (grafia exata do endpoint não confirmada em fonte
  oficial)
- Genesis hash: `9wDaBRDgArEUpvhHxGguNkwozsZh4UpGZB9o2EoEcBB2`
- Wallet recomendada: Nightly

---

## Fontes

Todas acessadas em **2026-09-14**:
1. https://superteam.fun/earn/listing/create-an-app-on-cookie-chain-app/ — listing oficial do bounty
2. https://github.com/cookiechain/superteam-hackathon-submissions — repositório/registro oficial
3. https://raw.githubusercontent.com/cookiechain/superteam-hackathon-submissions/main/README.md — regras de submissão (texto literal)
4. https://raw.githubusercontent.com/cookiechain/superteam-hackathon-submissions/main/apps.json — schema e exemplos reais de entradas
5. https://www.cookiechain.wtf/ — site institucional da Cookie Chain
6. https://docs.cookiechain.wtf — documentação (apenas estrutura de navegação capturada)
7. https://github.com/graylingops/cookiechain-capp — submissão de terceiro ("Cookie Jar"), fonte da evidência sobre ausência de faucet e "gas drip" do sponsor
8. https://github.com/HaydernCenterpoint/crumbs-cookie-chain — submissão de terceiro (Crumbs)
9. https://github.com/tenk-earn/cookie-capp — submissão de terceiro
10. https://github.com/AtharvDhiman/cookie-pulse e https://github.com/peterviktor97-ctrl/cookie-pulse — submissões de terceiro (Cookie Pulse)
11. https://github.com/sanjay3226/CookieForge — submissão de terceiro (CookieForge)
12. https://github.com/waniyaro/cookiedash — submissão de terceiro (CookieDash)
13. WebSearch queries realizadas (sem URL única, resultados agregados): `"Cookie Chain" superteam earn hackathon "create an app"`; `"Cookie Chain" blockchain COOK token hackathon`; `Cookie Chain docs RPC endpoint Nightly wallet SVM github`; `"cookiechain" OR "Cookie Chain" onboarding new wallet sponsor gas fee first transaction`; `site:x.com "Cookie Chain" superteam bounty app` (nenhum post de X/Twitter específico foi retornado por esta última busca).
