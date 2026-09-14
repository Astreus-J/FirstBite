# FirstBite

> Your first bite of Cookie Chain. 🍪

## O que é

Onboarding primitive para a Cookie Chain (rede SVM): um holder de COOK cria um "Bite" (deposita COOK em um PDA), gera um link/QR, e outra pessoa — mesmo com 0 COOK — conecta a Nightly Wallet e reivindica COOK com a taxa de rede patrocinada. Submissão para o bounty Superteam Earn "Create an App on Cookie Chain".

Contexto de produto completo: `docs/PRODUCT.md`. Pesquisa e evidências: `docs/research/`. Não repita pesquisa já documentada — leia antes de assumir algo sobre a Cookie Chain, Nightly, ou o bounty.

## Arquitetura resumida

- **Programa Anchor** (Rust): um PDA por `Bite` (estado + saldo nativo de COOK na mesma conta — Arquitetura A, `docs/ARCHITECTURE.md`), e um PDA `ClaimRecord` por `(bite, claimer)` para impedir claim duplicado.
- **Frontend**: Next.js + TypeScript + Tailwind, `@solana/wallet-adapter-react` + `@solana/wallet-adapter-nightly` para conectar a Nightly (o pacote `@nightlylabs/wallet-selector-solana` cogitado na pesquisa inicial está deprecated — ver `docs/DECISIONS.md`).
- **Sponsor Service**: rota de API do próprio Next.js. Monta a transação `claim` do zero a partir de `{bite_pubkey, claimer_pubkey}`, nunca assina uma transação vinda do cliente. Ver `docs/SECURITY.md`.
- Detalhes e alternativas descartadas: `docs/DECISIONS.md`.

## Comandos essenciais

- `anchor build` / `anchor test` — programa (usa `solana-test-validator` local; nunca precisa de COOK real).
- `npm run dev` / `npm run test` / `npm run lint` (dentro de `app/`) — frontend local.
- `node poc/poc.mjs <sponsor-keypair> <receiver-keypair> [amount]` — reexecuta o Technical PoC do fee sponsorship. Default aponta para `rpc.cookiescan.io`; `POC_RPC_URL=http://127.0.0.1:8899` para rodar local.

## Regras críticas de segurança

1. **O sponsor nunca assina uma transação montada pelo cliente.** O backend sempre reconstrói a transação do zero a partir de uma intenção estruturada e valida contra o estado on-chain antes de assinar como `feePayer`. Nunca confiar em `amount`/`recipient` vindo do payload do cliente — sempre ler do estado on-chain do `Bite`.
2. **Chave privada do sponsor nunca chega ao frontend nem ao repositório.** Vive só em variável de ambiente/secret manager no backend. `*.key`, `*-keypair.json`, `id.json`, `poc/keys/` estão no `.gitignore` — nunca remover essas entradas.
3. `amount_per_claim` de um Bite deve ser `>= 890_880` unidades nativas (rent-exempt minimum confirmado por teste real — ver `poc/RESULTS.md`) — validar isso tanto on-chain (`create_bite`) quanto no formulário do frontend.
4. Toda aritmética no programa usa operações `checked_*` (nunca overflow/underflow silencioso).
5. Ameaças mapeadas e suas mitigações: `docs/SECURITY.md` — qualquer instrução nova do programa precisa passar por essa lista antes de ser considerada pronta.

## GitFlow

`main` (só releases estáveis) ← `develop` (integração) ← `feature/<nome>`. Nunca commitar direto em `main`; evitar commit direto em `develop`. `release/v1.0.0` sai de `develop` quando o MVP estiver `DONE` em `docs/IMPLEMENTATION_PLAN.md`, depois `release → main` (tag `v1.0.0`) e `release → develop`. Conventional Commits (`feat(programa): ...`, `fix(claim): ...`, `docs: ...`, `security: ...`) — nunca `update`/`fix stuff`/`final`.

Antes de merge de qualquer feature branch: lint, typecheck, testes, build, revisão de diff (`code-review` skill).

## Definition of Done (resumo — checklist completo em `docs/IMPLEMENTATION_PLAN.md` e `docs/SUBMISSION.md`)

Nightly conecta → creator cria Bite → fundos protegidos on-chain → link/QR funciona → wallet com 0 COOK testada de verdade → claim confirma → COOK recebido → duplicate claim impedido → CookieScan mostra a transação → testes passam → security review feito → app e GitHub públicos → README completo → program address documentado.

## O que NÃO fazer neste projeto

Sem DAO, token próprio, NFT collection, marketplace, swap próprio, chat, AI, gamificação complexa, app mobile nativo, rede social, múltiplas chains no MVP (ver `docs/PRODUCT.md`, seção WON'T). Não apresentar hipótese de pesquisa como fato — seguir a mesma disciplina de `docs/research/` (FATO CONFIRMADO / INFERÊNCIA ESTRATÉGICA / NOT VERIFIED) em qualquer documentação nova.
