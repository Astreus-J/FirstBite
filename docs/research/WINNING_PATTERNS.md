# Padrões de Projetos Vencedores — Hackathons Superteam / Solana (2024-2026)

> Pesquisa factual conduzida em 2026-09-14, via WebSearch e WebFetch. Nenhum
> critério de julgamento específico do bounty "Create an App on Cookie Chain" é
> inventado aqui — este documento trata de **padrões gerais observados em outros
> hackathons Superteam/Solana/Colosseum**, que servem apenas como
> **inferência estratégica** de como aumentar as chances do FirstBite, não como
> regra confirmada para este bounty específico (ver `HACKATHON.md` para o que é
> de fato exigido no bounty da Cookie Chain).

---

## 1. Exemplos concretos de projetos vencedores (2024-2026)

### Solana Cypherpunk Hackathon (Colosseum) — anunciado 13/12/2025
**FATO CONFIRMADO.** Fonte: https://blog.colosseum.com/announcing-the-winners-of-the-solana-cypherpunk-hackathon/ (acesso 2026-09-14).

- **Grande vencedor: Unruggable** — US$ 30.000. Hardware wallet + aplicativo
  companion para Solana. O artigo da Colosseum não detalha explicitamente os
  critérios de pontuação usados para escolher o vencedor.
- Vencedores por track (US$ 25.000 cada):
  - **Consumer**: Capitola — meta-agregador de mercados de previsão
  - **DeFi**: Yumi Finance — solução de "buy now, pay later" on-chain
  - **Infrastructure**: Seer — plataforma de debugging de transações
  - **RWA**: Autonom — oráculo especializado em ativos do mundo real
  - **Stablecoin**: MCPay — infraestrutura de pagamentos aberta
  - (track não identificado no fetch): attn.markets — protocolo de tokenização de receita de negócios

### Solana Radar Hackathon (Colosseum/Solana Foundation)
**FATO CONFIRMADO.** Fonte: https://solana.com/news/solana-radar-winners (acesso
2026-09-14). Mais de 10.000 participantes, 120+ países, 1.359 projetos finais
submetidos — citado como "o maior hackathon cripto até a data" pelo próprio artigo.

- **Grande campeão: Reflect** — US$ 50.000 + passes para o Breakpoint 2025. Plataforma
  de câmbio descentralizado com stablecoins lastreadas.
- Vencedores por categoria (US$ 30.000 cada): Pregame (apostas esportivas P2P),
  Txtx (runbooks para times de dev), Supersize (jogo multiplayer on-chain),
  Squeeze (long/short de tokens), SvachSakthi (rede cooperativa de energia
  renovável off-grid/DePIN), FXSwap (swap Forex↔stablecoin), AlphaFC (plataforma
  comunitária para times esportivos).
- Prêmios especiais (US$ 10.000 / 10.000 / 5.000): Lexicon (University Award),
  Attest Protocol (Public Goods Award), Endcoin (Climate Award).

### Outros vencedores citados em cobertura de imprensa
**FATO CONFIRMADO, com data/detalhe parcialmente NOT VERIFIED:**
- **TAPEDRIVE** — venceu o grande prêmio de um hackathon da Colosseum, endereçando
  o problema do custo de armazenamento de dados on-chain na Solana. Fonte:
  https://blockworks.com/news/solana-data-startup-wins-hackathon (acesso
  2026-09-14). Data exata do hackathon e valor do prêmio: **NOT VERIFIED** (não
  extraído do snippet retornado).
- **ORE** — venceu um hackathon Solana por volta de abril de 2024, com um
  mecanismo de mineração via proof-of-work sobre Solana; a cobertura destaca que
  isso ocorreu **apesar de o projeto ter causado disrupção na rede Solana** durante
  o período. Fonte: https://www.fxstreet.com/amp/cryptocurrencies/news/ore-wins-solana-hackathon-despite-disrupting-solanas-network-in-april-202405070737
  (acesso 2026-09-14). Isto é um dado ponto fora da curva: mostra que inovação
  técnica genuína e nativa da chain pode pesar mais que "polimento", mesmo com
  efeitos colaterais negativos — não deve ser lido como recomendação a seguir,
  apenas como evidência de que "uso real e não-trivial da blockchain" é valorizado.

### Padrão observado nas submissões já feitas ao PRÓPRIO bounty Cookie Chain
**FATO CONFIRMADO** (observação direta de READMEs de submissões reais, ver
`HACKATHON.md` seção Fontes para os links): as submissões já registradas em
`apps.json` e nos PRs do repositório oficial são, sem exceção observada,
**apps de escopo estreito e de uma única funcionalidade central**:
- *Cookie Tab*: link de pagamento/tip jar sem servidor, uma página pública que
  reconstrói o histórico a partir da chain.
- *Crumbs*: envia COOK nativo com memo on-chain, mostra estado da wallet Nightly.
- *Cookie Payouts*: pagamento em lote colando lista de endereço/valor.
- *CookieBot*: bot de Telegram para alertas de wallet/preço e tips em chat.
- *Cookie Jar / cookiechain-capp*: feed social onde cada post é uma transação
  SPL Memo real.
- *Cookie Pulse*: dashboard de analytics/portfolio.

Nenhuma dessas submissões tenta resolver múltiplos problemas ao mesmo tempo —
cada uma resolve **uma ação específica, verificável on-chain**. Isto é uma
inferência baseada em observação direta das submissões reais deste bounty (não
uma regra declarada pelo sponsor), mas é o dado mais diretamente aplicável ao
FirstBite, por ser do mesmo bounty.

---

## 2. Guia comunitário "How to Win a Colosseum Hackathon"

**FATO CONFIRMADO quanto ao conteúdo do guia, mas é preciso notar sua natureza:**
este é um guia **não-oficial**, mantido por um capítulo regional da Superteam
(SuperteamCanada) no GitHub, não um documento oficial da Superteam Earn ou da
Colosseum. Fonte: https://github.com/SuperteamCanada/how-to-win-colosseum-hackathon
(acesso 2026-09-14). Trechos literais relevantes:

- *"Working demo > perfect architecture"*
- *"Clear problem statement > impressive tech"*
- *"Deployed on devnet/mainnet > localhost screenshots"*
- Sobre escopo: recomenda minimalismo — *"Let's build one innovative swap
  mechanism and nail the UX"* em vez de um DEX completo com múltiplas features.
- Sobre o pitch: *"The pitch video is the first thing judges see. If they can't
  understand your project in 60 seconds, you've already lost."*
- Sobre uso real de blockchain: *"Build something that's only possible on
  Solana. Sub-second settlement, micro-transactions, compressed state."*
- Sobre a demo: *"Your demo IS your submission."* — recomenda deploy em
  devnet/testnet (nunca localhost), script de apresentação definido, gravação de
  backup, e uso de priority fees para evitar falha de transação durante o
  julgamento ao vivo.
- Recomenda equipes de 3+ pessoas (perfil técnico, frontend, não-técnico) — isto
  é uma recomendação de composição de equipe, não um requisito de elegibilidade.

---

## 3. Padrões gerais de avaliação da Superteam Earn (não específicos deste bounty)

**INFERÊNCIA ESTRATÉGICA**, sintetizada a partir de múltiplos resultados de busca
agregados (não foi possível atribuir cada frase a uma única URL fonte primária —
tratar como conhecimento geral do ecossistema, não como citação literal
verificada de um documento único):
- README eficaz: declarar o problema na primeira linha, mostrar a URL da demo
  ao vivo na segunda linha, incluir um GIF/screenshot na terceira linha, e só
  depois explicar setup técnico.
- Hackathons que exigem MVP tipicamente rejeitam submissões "apenas conceito"
  (concept-only) — esperam um protótipo funcional ou beta ativo/privado.
- Julgadores tendem a gastar poucos minutos por projeto (citação recorrente,
  porém não confirmada em fonte única verificável: "3-5 minutos por projeto");
  a recomendação prática é que o valor do projeto seja compreensível em
  segundos, não minutos.

Não foi possível localizar, nas páginas oficiais `superteam.fun/build/*`
acessadas, uma lista nomeada e estruturada de projetos vencedores com
justificativa de julgamento — essas páginas parecem ser aplicações client-side
(SPA) cujo conteúdo dinâmico (lista de vencedores por categoria) não é
renderizado para WebFetch. Marcado como **NOT VERIFIED** o conteúdo detalhado de:
- https://superteam.fun/build/past-hackathon-winners
- https://superteam.fun/build/past-hackathon-winners/Gaming
- https://superteam.fun/build/resources (menciona um vídeo "5 no-BS tactics to
  win the next Solana hackathon", mas o conteúdo do vídeo não foi acessível via
  WebFetch/WebSearch)

---

## 4. Por que projetos simples vencem projetos complexos

**Esta seção inteira é INFERÊNCIA ESTRATÉGICA.** Não existe, em nenhuma fonte
encontrada nesta pesquisa, uma declaração oficial da Superteam ou da Cookie Chain
afirmando literalmente que "projetos simples vencem". A conclusão abaixo é
deduzida combinando: (a) as citações literais do guia comunitário de hackathon
(seção 2), (b) o padrão observado nas submissões reais já feitas a este mesmo
bounty (seção 1, último bloco), e (c) o requisito explícito do sponsor Cookie
Chain de que o app deve ser "usable, not a landing page or a mockup" (ver
`HACKATHON.md`).

Racional da inferência:
1. **Tempo de avaliação é curto e o número de submissões é alto.** O próprio
   bounty já tinha entre 68 e 72 submissões observadas nesta pesquisa, para um
   prêmio de apenas US$ 1.000 dividido entre 2 vencedores. Um escopo pequeno,
   mas 100% funcional e fácil de verificar em minutos (conectar wallet, assinar
   uma transação, ver o resultado no explorer), tem maior probabilidade de ser
   corretamente compreendido e testado pelo avaliador do que um projeto amplo
   com múltiplas features, onde uma falha em qualquer parte compromete a
   primeira impressão.
2. **O requisito "ship something usable, not a landing page or a mockup" penaliza
   diretamente escopos grandes demais para o prazo do hackathon** — a chance de
   um MVP amplo ficar incompleto ou instável no prazo é maior do que a de um MVP
   estreito e sólido.
3. **Todas as submissões já registradas neste bounty específico seguem o padrão
   de escopo único** (memo transaction, tip jar, batch payout, bot de telegram) —
   isto não prova causalidade com vitória (ainda não há vencedores anunciados,
   deadline em 28/09/2026), mas mostra que o "MVP enxuto e verificável on-chain"
   é a norma comportamental dos próprios competidores, o que por si só eleva a
   barra de comparação: um projeto mais amplo precisa estar tão polido quanto os
   estreitos em cada uma de suas partes, ou risca parecer incompleto por
   comparação.
4. **Fricção de avaliação ao vivo**: guias de hackathon Solana (seção 2)
   recomendam explicitamente evitar dependência de infraestrutura frágil durante
   o julgamento (ex.: usar priority fees para não falhar a transação na frente do
   avaliador) — quanto menor o número de partes móveis (menos features, menos
   integrações externas), menor o risco de falha ao vivo.

**Implicação direta para o FirstBite** (inferência estratégica, não regra do
bounty): a ideia de "sponsorship da primeira taxa via link/QR Code para uma
wallet com saldo zero" já é, por natureza, um escopo estreito e de uma única
ação verificável on-chain (uma transação patrocinada, visível no explorer) — o
que está alinhado com o padrão observado. O risco estratégico a evitar é
expandir o escopo do MVP para além dessa ação central (ex.: adicionar
dashboard de analytics, sistema de pontos, múltiplos tokens) antes de a ação
principal estar robusta e demonstrável ao vivo sem falhas.

---

## Fontes

Todas acessadas em **2026-09-14**:
1. https://blog.colosseum.com/announcing-the-winners-of-the-solana-cypherpunk-hackathon/ — vencedores Cypherpunk Hackathon
2. https://solana.com/news/solana-radar-winners — vencedores Solana Radar Hackathon
3. https://blockworks.com/news/solana-data-startup-wins-hackathon — TAPEDRIVE
4. https://www.fxstreet.com/amp/cryptocurrencies/news/ore-wins-solana-hackathon-despite-disrupting-solanas-network-in-april-202405070737 — ORE
5. https://github.com/SuperteamCanada/how-to-win-colosseum-hackathon — guia comunitário (não oficial)
6. https://superteam.fun/build/past-hackathon-winners e subpáginas — conteúdo dinâmico não capturável via WebFetch (marcado NOT VERIFIED)
7. https://superteam.fun/build/resources — menção a recurso em vídeo não acessado
8. Submissões reais do bounty Cookie Chain, listadas em detalhe em `HACKATHON.md` (Cookie Tab, Crumbs, Cookie Payouts, CookieBot, Cookie Jar, Cookie Pulse)
9. WebSearch agregada: `Superteam Earn hackathon winning project README judging criteria simple MVP 2025 2026`; `Solana Colosseum hackathon 2025 winner grand prize project name announcement`; `superteam.fun/build hackathon winners list examples project names`
