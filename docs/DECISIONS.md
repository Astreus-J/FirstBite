# FirstBite — Decisões de Arquitetura e Stack (Fase 13)

Cada decisão documenta a alternativa considerada e por que foi escolhida. Versões checadas via `npm view <pacote> version` em 2026-09-14 — não citar de memória.

## Blockchain / On-chain

| Decisão | Escolha | Alternativa descartada | Motivo |
|---|---|---|---|
| Linguagem/framework do programa | **Rust + Anchor 0.32.1** (já instalado no ambiente: `anchor-cli 0.32.1`, `rustc 1.97.0`) | Programa nativo sem framework | Anchor reduz boilerplate de validação de contas/PDAs (constraints declarativas), essencial para um MVP seguro em prazo curto; é o padrão dominante nas submissões do próprio bounty inspecionadas (Arisan, Cookie Payouts, Crumbs). |
| Custódia de fundos | **PDA único (estado + saldo nativo na mesma conta)** — Arquitetura A | Vault separado (Arquitetura B); não-custodial (Arquitetura C) | Ver justificativa completa em `docs/ARCHITECTURE.md`. C foi descartada por quebrar o requisito de produto (claim assíncrono, creator offline). |
| Prevenção de duplicate claim | **`ClaimRecord` PDA por `(bite, claimer)`** | Lista de claimers dentro do `Bite` | Lista cresce sem limite e estoura tamanho/rent de forma imprevisível para Bites com `max_claims` alto. |

## Rede

| Decisão | Escolha | Fonte |
|---|---|---|
| RPC | `https://rpc.cookiescan.io` (mainnet) | Confirmado por FATO + testado diretamente via RPC nesta sessão (`getHealth: ok`, `getVersion: solana-core 4.1.2`) |
| Rede de desenvolvimento/testes | `solana-test-validator` local (Agave 2.3.0, mesma família de cliente) para testes automatizados e iteração rápida sem gastar COOK real | Validado no Technical PoC (`poc/RESULTS.md`) — parâmetros de rent idênticos aos da Cookie Chain |
| Explorer para links de transação | `https://cookiescan.io/tx/<signature>` | `docs/research/ECOSYSTEM.md` |

## Frontend

| Decisão | Escolha | Versão confirmada | Motivo |
|---|---|---|---|
| Framework | **Next.js** (App Router) | 16.3.5 (latest, checado via `npm view`) | Padrão de mercado para dApps, suporte a rotas de API para o Sponsor Service no mesmo projeto (reduz superfície de infra para o hackathon) |
| Linguagem | **TypeScript** | — | Tipagem reduz erros em código que lida com valores monetários/PDAs |
| Estilo | **Tailwind CSS** | — | Iteração rápida de UI sem escrever CSS customizado do zero, alinhado ao princípio "simplicidade > impressionar com componentes" |
| Cliente Solana/SVM | **`@solana/web3.js` v1** (`Connection`, `Transaction`, `PublicKey`) | Instalado e testado no PoC nesta sessão | Ecossistema real da Cookie Chain (todas as submissões de terceiro inspecionadas em `docs/research/ECOSYSTEM.md` e `COMPETITORS.md` usam v1, não `@solana/kit` v2) — menor risco de integração com wallet-adapter/Anchor client dado o prazo curto do hackathon. `@solana/kit` (8.3.0, confirmado existente e maduro) fica registrado como opção de migração pós-hackathon, não para o MVP. |
| Cliente do programa Anchor | **`@coral-xyz/anchor`** | 0.32.1 (bate com `anchor-cli` instalado) | Gerado automaticamente a partir do IDL do programa; evita escrever serialização manual de instruções |
| Conexão de wallet | **`@solana/wallet-adapter-react`** + **`@solana/wallet-adapter-base`** | 0.15.40 / 0.9.28 (checado via `npm view`) | Padrão React para múltiplas wallets; ainda mantido ativamente |
| Adapter específico Nightly | ~~`@nightlylabs/wallet-selector-solana`~~ → **`@solana/wallet-adapter-nightly`** | 0.1.21 — **correção feita durante a implementação (M2.2, 2026-09-14)**: `@nightlylabs/wallet-selector-solana` (o que esta linha originalmente previa, checado via `npm view` na Fase 13) está **deprecated no npm** ("no longer supported", junto com toda a família `@nightlylabs/wallet-selector-*`/`nightly-connect-*`). No lugar, existe `@solana/wallet-adapter-nightly`, mantido oficialmente no monorepo `anza-xyz/wallet-adapter` (o mesmo dos demais adapters `@solana/wallet-adapter-*`), publicado 4 dias antes desta implementação (2026-09-10) — um `BaseMessageSignerWalletAdapter` padrão, sem dependências além de `@solana/wallet-adapter-base`. | Lição registrada: pesquisa de versão de pacote (Fase 13) pode ficar desatualizada rapidamente num ecossistema que muda tão rápido — sempre reconferir `npm view <pacote> deprecated` no momento real da instalação (Fase 23), não confiar apenas na pesquisa da Fase 13. |
| QR Code | Biblioteca a definir na implementação (ex.: `qrcode` ou `qrcode.react`) — decisão de baixo risco, não bloqueante | — | Geração de QR é um problema resolvido e trivial; não há necessidade de pesquisa aprofundada aqui. |

## Backend / Sponsor Service

| Decisão | Escolha | Motivo |
|---|---|---|
| Necessidade de backend | **Sim, mínimo** | O princípio de segurança do projeto ("sponsor assina uma intenção que entende, nunca bytes arbitrários" — `docs/SECURITY.md`) exige que o backend monte a transação do zero a partir de uma intenção estruturada, nunca aceite uma transação pronta do cliente para assinar. |
| Implementação | **Next.js API Route** (mesmo projeto do frontend) | Evita um serviço separado/infra extra para o hackathon — alinhado ao princípio "prefira a arquitetura simples que funciona". Reavaliar como serviço dedicado só se surgir necessidade real de escala (não esperado no MVP). |
| Guarda da chave do sponsor | Variável de ambiente / secret manager da plataforma de deploy — nunca no repositório (`*.key`, `*-keypair.json`, `id.json` já no `.gitignore`) | Ver T13 em `docs/SECURITY.md`. |

## Infra / Deploy

| Decisão | Escolha | Motivo |
|---|---|---|
| Deploy do frontend+backend | Vercel (padrão para Next.js) — a confirmar na Fase de deploy | Zero-config para Next.js, adequado ao prazo do hackathon; alternativa (Railway/Render) só se surgir necessidade de processo long-running que a Vercel não atenda. |
| CI | GitHub Actions | Ver `docs/IMPLEMENTATION_PLAN.md` e configuração a criar na Fase 16. |

## Testes

| Decisão | Escolha | Motivo |
|---|---|---|
| Testes do programa Anchor | **`anchor test`** (mocha/chai padrão do Anchor) contra `solana-test-validator` local | Já validado nesta sessão que o `solana-test-validator` local se comporta de forma consistente com a Cookie Chain nos parâmetros que importam (rent, versão do cliente) — ambiente de teste confiável sem gastar COOK real. |
| Avaliação de LiteSVM/Mollusk | Considerar se os testes via `anchor test` ficarem lentos demais para iteração — não adotado por padrão no MVP para não adicionar uma ferramenta nova sem necessidade comprovada. | Princípio "não crie abstração antes de precisar". |
