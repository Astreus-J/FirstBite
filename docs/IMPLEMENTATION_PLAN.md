# FirstBite — Implementation Plan / Backlog (Fase 21)

Critical path: Research → sponsorship PoC → on-chain Bite → create → claim → confirmação de transação → frontend → deploy → submissão. Prioridade sempre: **working demo > feature count**.

Status possíveis: `TODO`, `IN PROGRESS`, `DONE`, `BLOCKED`.

## Milestone 0 — Research

| ID | Objetivo | Branch | Status |
|---|---|---|---|
| M0.1 | Auditoria de repositório e Skills | `feature/research-foundation` | DONE |
| M0.2 | Pesquisa do bounty, ecossistema, concorrentes, sponsorship, pitch | `feature/research-foundation` | DONE |
| M0.3 | Technical PoC do fee sponsorship | `feature/research-foundation` | DONE (mecanismo confirmado localmente; broadcast real na Cookie Chain pendente de fundos — ver `poc/RESULTS.md`) |
| M0.4 | Product Spec, arquitetura on-chain, threat model, decisões de stack | `feature/research-foundation` | DONE |

## Milestone 1 — Programa Anchor (core)

| ID | Objetivo | Branch | Depende de | Arquivos | Critério de aceite | Teste |
|---|---|---|---|---|---|---|
| M1.1 | Inicializar workspace Anchor (`anchor init`) | `feature/anchor-program` | M0.4 | `programs/`, `Anchor.toml`, `Cargo.toml` | `anchor build` roda sem erro | DONE — precisou fixar `[package.metadata.solana] tools-version = "v1.54"` no `Cargo.toml` do programa (o platform-tools default v1.48 do Solana CLI 2.3.0 tem rustc 1.84, incompatível com uma dependência transitiva do anchor-lang 0.32.1 que exige edition2024) |
| M1.2 | Instrução `create_bite` | `feature/anchor-program` | M1.1 | `programs/first_bite/src/instructions/create_bite.rs` | Cria PDA `Bite` com seeds `[b"bite", creator, bite_id]`, valida `amount_per_claim >= rent-exempt minimum`, transfere depósito total do creator para o PDA | DONE — `anchor test`: 9/9 passing |
| M1.3 | Instrução `claim` | `feature/anchor-program` | M1.2 | `.../claim.rs` | Cria `ClaimRecord` PDA `[b"claim", bite, claimer]` (falha se já existir), valida `status == Active`, valida `expiration` se definido, transfere `amount_per_claim` do PDA do Bite para o claimer, incrementa `claimed_count` (checked) | DONE — cobre claim válido, zero-balance claimer real, duplicate claim, Bite depletado, Bite expirado |
| M1.4 | Instrução `cancel_bite` | `feature/anchor-program` | M1.2 | `.../cancel_bite.rs` | Só o `creator` original pode cancelar (constraint customizada com erro `Unauthorized`); devolve saldo remanescente + rent e fecha a conta (`close = creator`) | DONE — cobre cancelamento pelo creator correto e rejeição de terceiros |
| M1.5 | Overflow/underflow safety pass | `feature/anchor-program` | M1.2–M1.4 | mesmos arquivos | Toda aritmética usa `checked_add`/`checked_sub`, sem `unwrap()` silencioso em caminho de produção | DONE — `cargo clippy -- -D warnings` limpo, `cargo fmt --check` limpo, nenhum `unwrap()`/`panic!` no código de instrução |
| M1.6 | Rodar `solana-vulnerability-scanner` sobre o programa | `feature/anchor-program` | M1.5 | — | Nenhum finding CONFIRMED sem mitigação documentada | DONE — nenhum finding nos 6 padrões cobertos; ver `docs/SECURITY.md` |

## Milestone 2 — Wallet integration (frontend base)

| ID | Objetivo | Branch | Depende de | Critério de aceite | Teste |
|---|---|---|---|---|---|
| M2.1 | Scaffold Next.js + Tailwind | `feature/nightly-wallet` | M0.4 | `npm run dev` sobe uma página em branco estilizada | DONE — `app/` (Next.js 16.3.5, TS, Tailwind, App Router) |
| M2.2 | Integrar `@solana/wallet-adapter-react` + adapter Nightly, apontando para a Cookie Chain via RPC | `feature/nightly-wallet` | M2.1 | Botão "Connect Nightly" conecta e mostra o endereço da wallet | DONE — usamos `@solana/wallet-adapter-nightly` (pacote oficial `anza-xyz/wallet-adapter`, publicado 2026-09-10), **não** `@nightlylabs/wallet-selector-solana` como o `DECISIONS.md` original previa (esse pacote está deprecated no npm — "no longer supported"). Verificado com Playwright headless: página renderiza, modal lista "Nightly" como opção, zero erros de console. |
| M2.3 | Testar em browser real se a Nightly aceita assinar transação com `feePayer` != wallet conectada | `feature/nightly-wallet` | M2.2 | Resultado documentado em `docs/research/SPONSORSHIP.md` (fecha o Research Gate #1 de vez) | **BLOCKED — requer browser real com a extensão Nightly instalada e uma wallet do usuário**; não executável neste sandbox (sem GUI/extensão). Aguardando o usuário. |

## Milestone 3 — Create Bite (frontend + integração)

| ID | Objetivo | Branch | Depende de | Critério de aceite | Teste |
|---|---|---|---|---|---|
| M3.1 | Formulário de criação (amount, claims, valor por claim, expiration) com validação client-side espelhando as constraints on-chain | `feature/create-bite` | M1.2, M2.2 | Formulário rejeita valores abaixo do rent-exempt mínimo antes de enviar | manual |
| M3.2 | Chamar `create_bite` via Anchor client, assinado pela wallet do creator | `feature/create-bite` | M3.1 | Transação confirma e aparece no CookieScan | manual + `run` skill |
| M3.3 | Gerar link compartilhável + QR Code | `feature/qr-sharing` | M3.2 | Link contém o `bite_pubkey`; QR renderiza e escaneia corretamente | manual |

## Milestone 4 — Claim (frontend + sponsorship)

| ID | Objetivo | Branch | Depende de | Critério de aceite | Teste |
|---|---|---|---|---|---|
| M4.1 | Página de Claim: ler estado do Bite a partir do link, mostrar detalhes (valor, claims restantes, expiration) | `feature/claim-bite` | M3.3 | Estado lido corretamente via RPC | manual |
| M4.2 | Sponsor Service (Next.js API Route): recebe `{bite_pubkey, claimer_pubkey}`, valida contra o estado on-chain, monta a transação `claim` do zero, define `feePayer` = sponsor, assina como sponsor | `feature/sponsored-transactions` | M2.3, M1.3 | Backend nunca aceita transação pronta do cliente (ver T1/T2 em `docs/SECURITY.md`) | testes de integração simulando payloads maliciosos (T1–T4) |
| M4.3 | Fluxo completo de claim: claimer assina sua parte, backend completa e submete | `feature/sponsored-transactions` | M4.2 | Wallet com 0 COOK completa um claim de ponta a ponta na Cookie Chain real | manual, com wallet nova de verdade — **este é o momento "wow" da demo** |
| M4.4 | Fallback documentado se M2.3 confirmar que a Nightly não aceita `feePayer` alternativo | `feature/sponsored-transactions` | M2.3 | Fallback implementado (claim devolve valor líquido já descontando a fee que o claimer paga) — só se necessário | manual |

## Milestone 5 — UX polish / observabilidade

| ID | Objetivo | Branch | Depende de | Critério de aceite | Teste |
|---|---|---|---|---|---|
| M5.1 | Estados de transação visíveis (preparing/awaiting signature/submitted/confirming/confirmed/failed) | `feature/transaction-feedback` | M4.3 | Nenhum estado "travado" sem feedback visual | manual |
| M5.2 | Tratamento de erro legível (não expor stack trace/RPC bruto) | `feature/transaction-feedback` | M5.1 | Mensagens de erro compreensíveis para usuário leigo | manual |
| M5.3 | Aviso próprio sobre possível alerta incorreto de "rede errada" da Nightly | `feature/transaction-feedback` | M2.3 | Aviso aparece só se a fricção documentada em `docs/research/ECOSYSTEM.md` §4 se confirmar em teste real | manual |
| M5.4 | Landing page final + histórico do creator | `feature/transaction-feedback` | M3.2 | Homepage comunica o produto em ~5s (revisão com Skill `impeccable`) | manual |

## Milestone 6 — Testes e Security Review

| ID | Objetivo | Branch | Depende de | Critério de aceite | Teste |
|---|---|---|---|---|---|
| M6.1 | Cobertura de testes completa do programa (todas as ameaças T1–T15 de `docs/SECURITY.md` com teste correspondente onde aplicável on-chain) | `release/v1.0.0` | M1.x | Suite `anchor test` verde | CI |
| M6.2 | Segunda revisão de segurança com contexto limpo (subagent/Skill separado) | `release/v1.0.0` | M6.1 | Nenhum finding crítico sem mitigação | `solana-vulnerability-scanner` + `security-review` |
| M6.3 | CI GitHub Actions (lint, typecheck, build frontend; fmt, clippy, `anchor test` para o programa) | `release/v1.0.0` | M6.1 | Pipeline verde em PR | CI |

## Milestone 7 — Deploy e Submissão

| ID | Objetivo | Branch | Depende de | Critério de aceite | Teste |
|---|---|---|---|---|---|
| M7.1 | Deploy do programa na Cookie Chain mainnet | `release/v1.0.0` | M6.2 | Program ID documentado, verificável no CookieScan | manual |
| M7.2 | Deploy do frontend+backend (Vercel) | `release/v1.0.0` | M7.1 | URL pública funcional | manual |
| M7.3 | README final completo | `release/v1.0.0` | M7.2 | Segue estrutura da Fase 26 | revisão |
| M7.4 | PR para `cookiechain/superteam-hackathon-submissions` + submissão no listing Superteam Earn | `release/v1.0.0` → `main` | M7.3 | Checklist de `docs/SUBMISSION.md` 100% `PASS` nos itens obrigatórios | checklist |
| M7.5 | X thread | `main` | M7.4 | Publicada | manual |

## Notas de GitFlow

- `feature/*` sai de `develop`, volta para `develop` via PR (com `code-review` skill antes do merge).
- `release/v1.0.0` sai de `develop` quando M1–M5 estiverem `DONE`; recebe só fixes/docs/config de produção.
- `release/v1.0.0` → `main` (tag `v1.0.0`) e → `develop` ao final.
- `hotfix/*` só se algo crítico quebrar após o deploy inicial.
