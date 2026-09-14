# FirstBite — Product Spec (Fase 9)

> Your first bite of Cookie Chain. 🍪

## Problema (validado, não hipotético)

A Cookie Chain **não tem faucet oficial** (confirmado por RPC direto: `requestAirdrop` retorna `Invalid request`; confirmado também por múltiplas submissões de terceiro do próprio bounty — ver `docs/research/ECOSYSTEM.md`). Uma wallet nova, com 0 COOK, não consegue pagar a própria primeira taxa de transação — não há como sequer tentar usar um cApp da Cookie Chain sem primeiro conseguir COOK por um bridge manual da Solana ou pedindo diretamente ao time da chain. Um projeto do próprio bounty (`cookiechain-capp`/"Cookie Jar") relatou publicamente ter ficado bloqueado esperando um "sponsor test-gas drip" — evidência direta, dentro do próprio ecossistema, de que essa fricção é real e conhecida.

## Solução

FirstBite deixa qualquer holder de COOK criar um **Bite**: um link/QR Code que outra pessoa — mesmo com 0 COOK — pode abrir, conectar a Nightly, e reivindicar COOK. A taxa de rede desse claim é patrocinada, então a pessoa sai da experiência com uma wallet ativa na Cookie Chain sem nunca precisar ter feito um bridge antes.

## Personas

| Persona | Dor | Como usa o FirstBite |
|---|---|---|
| **Novo usuário** | Nunca usou Cookie Chain, não tem COOK, não sabe o que é bridge | Recebe um link/QR, conecta Nightly, clica em "Claim", pronto |
| **Builder** | Quer levar usuários para seu cApp sem exigir bridge antes da primeira experiência | Gera Bites para distribuir junto com o link do próprio cApp |
| **Comunidade** | Quer distribuir pequenos valores de COOK para membros | Cria um Community Bite (stretch goal) com N claims |
| **Evento/hackathon** | Quer colocar dezenas de pessoas on-chain rapidamente | Gera um QR único e projeta na tela |
| **Creator** | Quer recompensar sua comunidade | Cria Bites individuais ou em lote |
| **Cookie Chain (o ecossistema)** | Quer mais activated wallets | Cada Bite reivindicado é uma wallet nova ativa na rede |

## North Star Metric

**Activated wallets**: uma wallet que recebeu seu FirstBite e depois realizou pelo menos uma outra interação na Cookie Chain (ex.: outra transação, uso de outro cApp). Medido via leitura pública on-chain (histórico de transações da wallet destinatária após o claim), não via tracking invasivo.

## Escopo do MVP (MoSCoW)

### MUST (necessário para submissão/MVP)

- Landing page que explica o produto em ~5 segundos ("Give someone their first 🍪").
- Conectar Nightly Wallet.
- Creator informa `amount total`, `número de claims`, `valor por claim` (validado ≥ rent-exempt minimum, ver `poc/RESULTS.md`), `expiration` opcional.
- Depósito dos fundos em uma conta PDA program-owned (Arquitetura A, ver `docs/ARCHITECTURE.md`).
- Geração de link compartilhável + QR Code.
- Página de Claim: abrir link, conectar Nightly, ver detalhes do Bite, assinar, receber COOK.
- Prevenção de duplicate claim via `ClaimRecord` PDA por `(bite, claimer)`.
- Observabilidade do estado da transação (preparing → awaiting signature → submitted → confirming → confirmed/failed), com erros legíveis, não stack traces crus.
- Link para a transação no CookieScan.
- Histórico simples do creator (Bites criados e status).
- Fee sponsorship — **quando tecnicamente viável no fluxo real com Nightly** (ver ressalva no Research Gate #1, `docs/research/SPONSORSHIP.md`); se a Nightly não permitir assinar com `feePayer` alternativo no teste em browser, o fallback documentado é a instrução `claim` devolver ao claimer um pouco mais de COOK do que o custo da própria fee, de forma que o claimer pague a fee com uma fração do valor recebido — ainda resolve "preciso ter COOK para começar", só que via um passo técnico diferente. Essa decisão de fallback é tomada no momento em que o teste em browser acontecer, não antes.

### SHOULD (melhora significativamente o produto)

- Preencher todos os campos que aumentam qualidade percebida no registro oficial da Cookie Chain (`apps.json`): logo, screenshots, vídeo demo.
- Analytics simples e claramente rotulados como on-chain vs off-chain: Bites criados, COOK distribuído, claimers únicos, taxa de sucesso de claim.
- Mensagem de aviso própria explicando por que a Nightly pode mostrar "rede errada" incorretamente durante o claim (fricção de UX documentada em `docs/research/ECOSYSTEM.md` — Nightly não publica Cookie Chain no Wallet Standard).

### COULD (stretch goals, só depois do MVP funcionar)

- **Community Bite**: um Bite para várias pessoas (ex.: 50 COOK / 100 claims / 0,5 COOK cada).
- **Mystery Bite**: valor revelado só após o claim.
- **Chain Bite**: parte do valor recebido vira automaticamente um novo Bite para o claimer compartilhar, criando uma corrente de onboarding.
- **Cookie Trail**: visualização do caminho percorrido pelos Bites.
- **Campaign**: builders criam campanhas de onboarding para seus próprios cApps.

### WON'T (fora do hackathon)

DAO, token próprio, NFT collection, marketplace, swap próprio, chat, AI, gamificação complexa, app mobile nativo, sistema de followers, rede social, múltiplas chains, analytics gigante.

## Posicionamento

**Onboarding primitive para a Cookie Chain** — não um faucet genérico. Diferencial defensável (ver `docs/research/COMPETITORS.md`, rodada 2, ~65% das 72 submissões inspecionadas, nenhuma combina os quatro elementos): **link pull-based + claim por desconhecido + zero-balance genuíno + fee patrocinada em um único fluxo**. O pitch deve citar nominalmente os concorrentes mais próximos (Arisan — fee sponsorship fechado por convite; Cookie Tab/Sprinkle — link+QR mas para pagamento, não claim; Oven Mitt — carteira de sessão para agentes, não para onboarding humano) para mostrar recombinação deliberada, não alegação vaga de ineditismo.

## Definition of Done — MVP

Ver checklist completo em `docs/SUBMISSION.md` (a ser criado na Fase 12/21).
