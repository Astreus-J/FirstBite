# Technical PoC — Resultados (Fase 22 / Research Gate #1)

Data: 2026-09-14.

## O que foi testado

Cenário exigido pela Fase 22 do plano: **Wallet A possui fundos. Wallet B possui 0 COOK. Wallet B deve conseguir participar de um Claim onde outra conta cobre a taxa.**

Transação testada: `[SystemProgram.transfer(A → B, amount), MemoProgram(assinado por B)]`, com `feePayer = A`, assinada por `[B, A]`. B nunca precisa ter saldo próprio para co-assinar sua parte — isso reproduz fielmente o mecanismo que o FirstBite precisa (claimer assina para provar que é o destinatário legítimo, sponsor assina e banca a taxa).

## Conexão real com a Cookie Chain (via RPC público, sem gasto de fundos)

Executado com `curl`/`solana-cli` direto contra `https://rpc.cookiescan.io`, sem depender de nenhuma fonte terciária:

| Item | Resultado medido | Compara com pesquisa documental prévia |
|---|---|---|
| `getHealth` | `"ok"` | — |
| `getVersion` | `solana-core 4.1.2` | **Confirma** o que terceiros relataram em `docs/research/HACKATHON.md` |
| `getGenesisHash` | `9wDaBRDgArEUpvhHxGguNkwozsZh4UpGZB9o2EoEcBB2` | **Confirma exatamente** o valor que só havia sido reportado por uma submissão de terceiro (`docs/research/ECOSYSTEM.md`, antes marcado NOT VERIFIED) — agora é FATO CONFIRMADO via RPC direto |
| `requestAirdrop` | Erro `-32600 Invalid request` | **Confirma** a ausência de faucet via RPC — consistente com o achado de que não há faucet oficial |
| `getMinimumBalanceForRentExemption(0)` | `890880` | Idêntico à constante padrão do Solana mainnet/devnet — Cookie Chain não alterou esse parâmetro de rent |
| `getMinimumBalanceForRentExemption(128)` | `1781760` | Consistente com a fórmula padrão de rent do Solana |
| `getSlot` (2 leituras, 100.000 slots de distância) | ~0,455s por slot em média | **Diverge** do "~0,8s" citado por uma submissão de terceiro em `docs/research/ECOSYSTEM.md` — este valor (medido diretamente) deve substituir aquele nos materiais de pitch. Mais rápido que o citado, o que é uma boa notícia (não um problema). |

## Execução end-to-end do mecanismo de sponsorship

**Não executado na Cookie Chain mainnet** — o usuário optou por não gastar COOK real neste momento (decisão registrada na conversa). Em vez disso, executado com sucesso em um `solana-test-validator` local (cliente Agave `2.3.0`, a mesma família de cliente da qual a Cookie Chain deriva, "solana-core"-compatível), usando airdrop gratuito para financiar a wallet sponsor de teste.

- Signature local: `bBKuDpzmSZEZmZ6qUHZR9nbHF7jfo5K94sKXGyJP3hZ25engKSrEv8uXyBKs1n9TsQubXRwtQMgKi8iLzXWTNy6`
- Sponsor antes: 1.000.000.000 → depois: 998.990.000 (delta: −1.010.000 = −1.000.000 transferido − 10.000 de fee)
- Receiver antes: 0 → depois: 1.000.000 (delta: +1.000.000, **zero fee pago pelo receiver**)
- Receiver começou com saldo genuinamente zero e conseguiu co-assinar a instrução normalmente.

## Veredito final do Research Gate #1

**CONFIRMADO — com uma ressalva explícita e não resolvida.**

- **Confirmado por teste real**: o mecanismo `feePayer != signer da instrução de negócio` funciona exatamente como esperado no cliente Agave (mesma base de código da Cookie Chain), incluindo a interação com o SPL Memo Program como um stand-in razoável para a instrução `claim` real do programa Anchor do FirstBite.
- **Confirmado por RPC direto na própria Cookie Chain** (sem gastar fundos): genesis hash, versão do cliente, ausência de endpoint de airdrop, e parâmetros de rent-exemption — tudo consistente com o comportamento padrão do Agave/Solana, sem nenhuma customização detectada que quebraria o mecanismo.
- **Não confirmado (pendente)**: o broadcast real de uma transação com `feePayer` de terceiro **na própria Cookie Chain mainnet**, e a validação de que a **Nightly Wallet** especificamente permite assinar uma transação onde ela não é o feePayer (isso só pode ser testado em um browser real com a extensão instalada — fora do alcance deste ambiente de sandbox).

## Ação recomendada antes de considerar o gate 100% fechado

1. Quando o usuário decidir financiar o endereço sponsor-test (`poc/keys/` — gerado localmente, nunca commitado), rodar `node poc/poc.mjs <sponsor> <receiver>` contra `https://rpc.cookiescan.io` (comportamento default do script) para obter uma signature real na mainnet da Cookie Chain, verificável no CookieScan.
2. Testar manualmente no browser, com a Nightly Wallet instalada, se `signTransaction` aceita uma transação onde `feePayer` é uma chave diferente da wallet conectada (o SDK da Nightly não documenta isso explicitamente — ver `docs/research/SPONSORSHIP.md`).
3. Repetir esse teste específico já dentro do fluxo real do programa Anchor (não mais com Memo Program como stand-in) assim que a instrução `claim` existir.

## Achado de produto derivado deste PoC

`amount_per_claim` no `Bite` **precisa ser ≥ 890.880 unidades nativas** (rent-exemption mínima para uma conta nova) — abaixo disso, o claim falha com "insufficient funds for rent" porque o runtime SVM não permite criar uma conta com saldo abaixo do rent-exempt. Isso vira uma validação obrigatória na instrução `create_bite` (rejeitar `amount_per_claim < RENT_EXEMPT_MINIMUM`) e uma regra de UX explícita no formulário de criação do Bite.
