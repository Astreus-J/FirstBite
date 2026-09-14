# FirstBite — Pitch (Fase 28)

Baseado no produto real e testado (não aspiracional — ver `docs/IMPLEMENTATION_PLAN.md` para o que está **Live** vs **Roadmap**). Estrutura e evidências de apoio em `docs/research/PITCH_RESEARCH.md`.

## Live vs Roadmap (não confundir na hora de falar)

**Live (implementado e testado, inclusive com a extensão Nightly real):**
- Criar um Bite (depositar COOK, gerar link/QR).
- Reivindicar um Bite com uma wallet Nightly.
- Taxa do claim patrocinada por um Sponsor Service — confirmado que uma wallet com **saldo genuinamente zero** completa o claim sem pagar nada.
- Histórico do creator com cancelamento/reembolso.

**Roadmap (não dizer que já existe):** Community Bite, Mystery Bite, Chain Bite, Cookie Trail, Campaigns, SDK público.

---

## Tagline (10s)

> **Getting onto a blockchain shouldn't start with a bridge.**
> FirstBite turns onboarding into a link.

## Elevator pitch (20s)

> Cookie Chain has no faucet — a brand-new wallet can't even pay for its first transaction. FirstBite fixes that with one link: a holder of COOK creates a "Bite," shares it, and the receiver — even with zero balance — connects Nightly and claims COOK with the fee sponsored. Zero to active Cookie Chain wallet in one click.

## Pitch de 60 segundos

> Every new Cookie Chain user hits the same wall on day one: there's no faucet, so a wallet with zero COOK can't pay the fee to do anything — not even to receive tokens someone else sends it. That's a real, documented problem — other builders in this same hackathon hit it too, one of them literally had to wait for a manual "gas drip" from the sponsor team just to demo their own app.
>
> FirstBite turns that wall into a link. Someone who already holds COOK creates a "Bite" — deposits COOK into an on-chain vault and gets a shareable link or QR code. They send it to a friend who's never touched Cookie Chain. That person opens the link, connects Nightly, and clicks Claim. Here's the part that matters: **the network fee for that claim is paid by our Sponsor Service, not by the new wallet** — so someone starting at a genuine zero balance ends the interaction as an active, funded Cookie Chain wallet. No bridge, no CEX, no asking the team for COOK.
>
> We didn't just build this — we proved it. We tested the exact mechanism with the real Nightly browser extension: a wallet with 0 SOL signed a transaction where a completely different account paid the fee, and walked away holding COOK. That's the one interaction this entire chain's growth depends on, and it works.

## Pitch de 2 minutos

Usar o pitch de 60s como base e adicionar:

1. **Diferencial** (20s): "This isn't a faucet. A faucet is the protocol handing out free tokens to anyone. FirstBite is peer-to-peer — someone who's already active on Cookie Chain is choosing to sponsor a specific person's entry. It's closer to an invite than a giveaway. And it's not just an idea — we checked: out of the ~65% of this bounty's other submissions we could inspect, pieces of this exist separately — one project sponsors fees inside closed invite-only groups, two others do payment links, a couple do batch airdrops — but nothing combines pull-based claiming, a genuinely zero-balance starting point, and automatic fee sponsorship in one link."

2. **Como funciona tecnicamente** (30s): "Under the hood: an Anchor program holds each Bite's deposit in its own PDA. Claiming creates a small on-chain record that makes double-claiming impossible by construction, not just by a check. Our Sponsor Service never signs a transaction handed to it by the browser — it independently reads the Bite's on-chain state, builds the claim instruction itself, and only then signs as the fee payer. That's the same security pattern production gasless-transaction services like Octane use."

3. **Impacto** (20s): "Three levels of value: a new user gets a frictionless first experience. A builder gets a way to onboard users straight into their own cApp without demanding a bridge step first. And Cookie Chain gets more activated wallets — which is the metric that actually predicts whether a new chain's ecosystem grows."

## Roteiro de demo (determinístico)

Ver `docs/PRODUCT.md`/backlog para o fluxo completo. Roteiro de tela por tela:

1. Wallet Creator conectada, com COOK.
2. "Create a Bite" → preencher valor (ex.: 0.01 COOK), 1 claim.
3. Bite criado → mostrar QR + link.
4. Trocar para uma wallet nova/zerada (ou nova aba/perfil do navegador).
5. Abrir o link — mostrar o valor **antes** de conectar (transparência).
6. Conectar Nightly.
7. Clicar "Claim".
8. Mostrar o estado de transação (preparing → awaiting signature → confirming → confirmed).
9. "Confirmed — welcome to Cookie Chain! 🎉" + saldo indo de 0 → valor do Bite.
10. Abrir o link do CookieScan da transação.

Esse é o momento "wow": **uma carteira que começou zerada, agora ativa na Cookie Chain, sem ter pago nada.**

---

## FAQ para jurados

Respostas refinadas com base no que o produto realmente faz e no que já foi validado tecnicamente (não mais rascunho — ver `docs/research/PITCH_RESEARCH.md` §4 para a versão original em pesquisa).

**"Isso não é só um faucet?"**
Não — um faucet distribui tokens de teste sem valor, de forma unilateral e impessoal. FirstBite é peer-to-peer: quem já tem saldo real decide patrocinar a entrada de uma pessoa específica. O ativo é o token de produção da chain, não um token de teste.

**"Por que precisa de blockchain? Não seria só um sistema de convite comum?"**
O ativo distribuído é o COOK nativo e o Claim é uma transação on-chain assinada pelo próprio destinatário — não um cupom off-chain resgatável num sistema centralizado. O problema que resolvemos (impossibilidade de pagar a própria primeira taxa) é, por definição, um problema nativo de blockchain — a solução precisa viver on-chain.

**"Como evita bots/Sybil farming de Bites?"**
Não resolvemos isso no MVP, e dizemos isso abertamente: quem cria um Bite arca com o custo (é o holder de COOK quem decide gastar, não o protocolo), o que já cria fricção econômica natural contra spam em massa. Sybil entre wallets diferentes reivindicando Bites diferentes continua sendo um risco aceito documentado (`docs/SECURITY.md`) — mitigação mais forte (limite por criador, cooldowns) é roadmap, não bloqueador de hackathon.

**"Quem paga a taxa patrocinada no longo prazo? Qual o modelo de negócio?"**
Honestamente, isso é roadmap, não uma resposta pronta: hoje o Sponsor Service é mantido por nós. Caminhos reais a explorar: um pequeno spread cobrado do criador do Bite, patrocínio da própria Cookie Chain como investimento em aquisição de usuários (dado que não existe faucet oficial hoje), ou parceria com builders que pagam para trazer usuários direto para seus cApps.

**"O sponsor pode ser drenado por um ataque?"**
Pensamos nisso especificamente: o Sponsor Service nunca assina uma transação vinda do cliente — ele lê o estado do Bite on-chain e constrói a instrução de claim ele mesmo, validando status, expiração e claim duplicado antes de assinar. Tem rate limiting básico por Bite. O pior caso de abuso custa ao sponsor o valor de uma taxa de rede por tentativa — baixo na Cookie Chain, mas documentado como risco a monitorar, não eliminado (`docs/SECURITY.md`).

**"Isso é só uma feature, não um produto?"**
Nosso posicionamento é como **onboarding primitive** — um rail que outros cApps da Cookie Chain podem usar para trazer usuários direto para dentro do próprio produto deles, não uma tela isolada. Roadmap inclui um SDK (`createBite()`, `claimBite()`) para isso.

**"O que já funciona de verdade, e o que é promessa?"**
Tudo descrito na seção "Live" acima está implementado, testado por testes automatizados (11/11 passando) e verificado manualmente com a extensão Nightly real contra um programa on-chain de verdade. Nada no pitch descreve uma feature que não existe.

**"Vocês testaram isso numa wallet de verdade, ou só simulado?"**
Com a extensão Nightly real, instalada no navegador, contra um validador com o programa implantado — não foi só uma simulação com uma wallet de teste. A transação está documentada com sua assinatura em `docs/research/SPONSORSHIP.md`.
