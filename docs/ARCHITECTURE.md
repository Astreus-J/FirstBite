# FirstBite — Arquitetura On-Chain (Fase 8)

Status: rascunho técnico baseado em pesquisa documental (ver `docs/research/`). Ainda não validado por teste empírico na Cookie Chain (isso é o Technical PoC, Fase 22, pendente de execução com wallet financiada do usuário).

## Premissas confirmadas pela pesquisa (não presumidas)

- **COOK é o token nativo/gas da Cookie Chain**, análogo a SOL na Solana — não há SPL Mint, não há ATAs. Fonte: `docs/research/ECOSYSTEM.md` §2 (múltiplas fontes de terceiros consistentes; nenhuma doc oficial nega isso, embora nenhuma o declare literalmente em uma única frase).
- Cookie Chain é descrita oficialmente como rede SVM ("Solana Virtual Machine"), "SPL tokens, programs, and tooling work out of the box" — ou seja, o modelo de contas, rent, PDAs e o System Program se comportam como em Solana. Fonte: `docs/research/HACKATHON.md` (docs.cookiechain.wtf, fetch direto).
- Decimais do COOK: **9, por inferência forte** (consistente entre 3 fontes independentes que calculam fees), nunca declarado literalmente pelo sponsor. Tratar como quase certo mas não blindado — validar lendo o `Cluster`/`getAccountInfo` real no PoC.
- Não existe faucet nem paymaster genérico oficial da chain — qualquer sponsorship de fee hoje é mantida por app individual (ver `docs/research/ECOSYSTEM.md` §3, item Faucet).

Como COOK se comporta exatamente como SOL/lamports nativo, a arquitetura correta para guardar fundos de um "Bite" é a mesma usada para guardar lamports nativos em Solana: **uma conta owned pelo próprio programa (PDA), sem token account, sem mint** — não uma vault de SPL Token com `TokenAccount`/ATA, que seria o modelo errado aqui.

## Comparação de arquiteturas para custódia dos fundos do Bite

### Arquitetura A — PDA program-owned account guarda o saldo nativo diretamente

O `Bite` é uma única conta PDA (seed determinística, ex.: `["bite", creator.key(), bite_id]`), criada e financiada (`init` + transferência de lamports/COOK nativo) pelo creator via `system_program::transfer` ou CPI equivalente. O próprio programa é o `owner` da conta, então só ele pode debitar o saldo (mover lamports para fora exige que a conta de origem seja owned pelo programa que assina a instrução, ou usar `**lamports.borrow_mut()` diretamente dentro da mesma invocação do programa — padrão padrão em Anchor para contas nativas).

- **Prós**: uma única conta por Bite, sem CPI extra ao System Program para o transfer de saída (ajuste direto de lamports é permitido entre contas owned pelo mesmo programa), custo de rent mínimo, modelo mental simples ("essa conta É o cofre").
- **Contras**: a conta do Bite acumula tanto o estado (creator, remainingAmount, claimedCount, expiration...) quanto os fundos — se o layout de dados crescer, o cálculo de rent-exemption muda; é preciso ter cuidado para não permitir que a conta seja fechada/realloc enquanto ainda há saldo não reivindicado.
- **Compatibilidade com Anchor**: direta — é o padrão descrito na documentação e cookbook do Anchor para "native SOL vault as PDA", plenamente aplicável a COOK nativo por ser tecnicamente o mesmo mecanismo (lamports nativos do runtime SVM).

### Arquitetura B — Conta de estado (PDA pequena, só dados) + PDA "vault" separado (só lamports, sem dados)

O `Bite` vira duas contas: uma PDA de estado (`bite_state`, guarda `creator`, `amountPerClaim`, `maxClaims`, `claimedCount`, `expiration`, `bump`) e uma PDA "vault" separada e vazia de dados (`bite_vault`, seeds `["vault", bite_state.key()]`), que só existe para segurar os lamports nativos.

- **Prós**: separa claramente "estado que pode crescer/mudar" de "dinheiro" — mais fácil de auditar (o vault nunca tem lógica, só saldo), mais fácil de fazer refund/close do vault de forma isolada sem tocar no estado, e é o padrão mais comum em programas Anchor de produção que lidam com custódia de fundos (reduz superfície de erro em cálculos de rent quando o estado é atualizado).
- **Contras**: duas contas por Bite = duas rent-exemptions a cobrir (mais lamports imobilizados, ainda que pequenos), uma PDA extra para derivar e validar em cada instrução (`has_one`/`seeds` constraints adicionais no Anchor).

### Arquitetura C — Apenas a wallet do creator, sem PDA de custódia (não-custodial até o claim)

Ao invés de depositar fundos antecipadamente em um vault do programa, o "Bite" seria só um registro de intenção (estado assinado pelo creator com os parâmetros do claim), e o claim executaria uma transferência direta da wallet do creator para o claimer no momento da assinatura — exigindo que o creator co-assine (ou pré-autorize via delegate) cada claim individual em tempo real.

- **Prós**: nenhum fundo fica custodiado pelo programa; elimina inteiramente a superfície de ataque de "drenar o vault".
- **Contras**: quebra a proposta de valor central do FirstBite — o creator precisaria estar online/assinando toda vez que alguém reivindica, o que não é compatível com "gerar um link/QR e compartilhar" (o cenário de uso é assíncrono, potencialmente dias depois, com o creator offline). Descartada por não atender ao requisito de produto.

## Decisão

**Escolhida: Arquitetura A (PDA único, estado + saldo na mesma conta)** para o MVP do hackathon, com a ressalva de reavaliar a Arquitetura B caso o `BiteState` cresça o suficiente (ex.: se `ClaimRecord` por claimer precisar ser embutido no mesmo layout) para justificar a separação. Justificativa alinhada ao princípio do projeto ("prefira B [a solução simples que funciona] a uma arquitetura impressionante com 15 componentes" — nomenclatura do brief, não desta seção): menos contas para derivar/validar por instrução, menos rent total imobilizado, e o padrão é bem documentado no ecossistema Anchor/Solana para custódia de saldo nativo via PDA — não é uma escolha exótica.

Modelo de dados inicial do `Bite` (revisão do modelo conceitual do briefing, ainda sujeito a otimização de tamanho/custo depois de medir com `anchor build`):

```
Bite {
    creator: Pubkey,        // 32 bytes
    bite_id: u64,           // 8 bytes — parte da seed, permite múltiplos Bites por creator
    amount_per_claim: u64,  // 8 bytes — em lamports nativos (menor unidade do COOK)
    max_claims: u32,        // 4 bytes
    claimed_count: u32,     // 4 bytes
    expiration: i64,        // 8 bytes — unix timestamp, 0 ou Option<i64> = sem expiração
    status: BiteStatus,     // 1 byte (enum: Active, Depleted, Expired, Cancelled)
    bump: u8,               // 1 byte
}
```

**Prevenção de duplicate claim**: além de `claimed_count < max_claims`, cada claim bem-sucedido precisa registrar que aquele claimer específico já reivindicou — senão a mesma wallet poderia reivindicar N vezes até `max_claims` se acabar (Sybil trivial dentro do próprio Bite). Duas opções a decidir na implementação:
1. Uma PDA `ClaimRecord` por `(bite, claimer)` (seeds `["claim", bite.key(), claimer.key()]`), criada no primeiro claim daquele par — sua própria existência é a prova de "já reivindicado" (o Anchor rejeita `init` sobre conta já existente). Custo: uma conta pequena a mais por claimer, mas é o padrão mais seguro e auditável.
2. Uma lista de claimers dentro do próprio `Bite` — descartada: cresce sem limite, estoura o tamanho máximo de conta e o custo de rent de forma imprevisível para Bites com `max_claims` alto (ex.: Community Bite com 100 claims).

**Decisão**: usar a opção 1 (`ClaimRecord` por PDA), documentada aqui para a Fase de modelagem detalhada do programa (antes da implementação em Rust).

## Refund / cancelamento

O creator deve poder cancelar um Bite não totalmente reivindicado e recuperar `remaining_amount = (max_claims - claimed_count) * amount_per_claim`, fechando a conta do Bite (`close = creator` no Anchor) para recuperar também o rent. Isso exige uma instrução `cancel_bite` com constraint `has_one = creator` e verificação de que o signer é exatamente o creator original — detalhado no threat model (`docs/SECURITY.md`).

## Pendências para validar no Technical PoC (não decidíveis só por pesquisa documental)

1. Confirmar que `system_program::transfer` (ou ajuste direto de lamports) funciona sem restrição adicional no runtime da Cookie Chain (esperado que sim, por ser "solana-core"-compatível, mas não testado).
2. Confirmar o valor real de rent-exemption mínimo na Cookie Chain (pode divergir do valor de mainnet Solana se os parâmetros de genesis forem diferentes).
3. Confirmar decimais reais do COOK lendo uma conta/transação real (a inferência de 9 decimais precisa ser validada, não assumida no código de produção).
