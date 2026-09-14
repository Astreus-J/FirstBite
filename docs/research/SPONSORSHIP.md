# Research Gate #1 — Fee Sponsorship (feePayer ≠ Wallet) na Cookie Chain

Data da pesquisa: 2026-09-14
Escopo: viabilidade técnica de Wallet B (0 COOK) assinar um "Claim" enquanto uma conta Sponsor paga a taxa de rede.

---

## Resumo Executivo

A pergunta central — "é possível um usuário com 0 tokens nativos assinar uma transação enquanto outra conta paga a taxa (`feePayer != wallet do usuário`)?" — tem resposta **CONFIRMADA como padrão nativo e documentado do protocolo Solana/SVM**, com múltiplas implementações de produção no ecossistema (Octane, Kora, Circle Gas Station, Privy, Dynamic, Tempo) comprovando que o padrão não é apenas teoricamente possível, mas amplamente usado.

O ponto **não confirmado** é o comportamento específico da **Cookie Chain** e da **Nightly Wallet** para esse fluxo exato — nenhuma das duas publica documentação que trate explicitamente de `feePayer` diferente do signer conectado. A Cookie Chain é descrita pela própria documentação e por terceiros como "SVM tooling works if you point it at the Cookie RPC" (ou seja, reutiliza o cliente/tooling padrão da Solana), o que é evidência indireta forte de compatibilidade, mas não uma declaração oficial testada.

Portanto, o veredito do Research Gate #1 é **CONFIRMADO em nível de protocolo SVM/Solana padrão**, e **NOT VERIFIED especificamente para a implementação da Cookie Chain e para a Nightly Wallet** (nenhuma restrição foi encontrada na documentação de nenhuma delas, mas nenhuma confirmação explícita também foi encontrada).

---

## Research Gate #1 — Veredito e Evidências

### Veredito: **CONFIRMADO** (em nível de protocolo SVM padrão) — com ressalva de "NOT VERIFIED para Cookie Chain/Nightly especificamente"

### Evidências primárias

1. **Solana Cookbook — Fee Sponsorship** (fonte oficial, `solana.com/developers/cookbook/transactions/fee-sponsorship`, acesso 2026-09-14): declara textualmente que "Fee sponsorship is a native feature in Solana that allows for one account to pay transaction fees for another account", com fluxo: (1) construir a transação com as instruções desejadas, (2) definir `feePayer` = chave pública do sponsor, (3) o sponsor assina para autorizar o pagamento, (4) enviar a transação assinada. Isso é comportamento **nativo do protocolo**, não um hack de biblioteca.

2. **Modelo de múltiplos signers do SDK Rust da Solana** (`docs.rs/solana-sdk` — `Transaction::partial_sign`): "To sign with only some of the required signers, use `Transaction::partial_sign`... Partially signing a transaction with specified accounts requires that all accounts correspond to either the fee payer or a signer account in the transaction instructions." Isso confirma no nível do runtime/SVM que o fee payer é apenas mais um signer possível, desacoplado da lógica de negócio da instrução — exatamente o mecanismo necessário para "usuário assina o claim, sponsor assina e paga a taxa".

3. **Padrões de produção existentes no ecossistema**: Octane (`github.com/anza-xyz/octane`, mantido hoje sob a org anza-xyz, ex-Solana Labs) é um relayer gasless de produção cujo fluxo documentado é: usuário monta a transação, assina parcialmente (`partialSign`), serializa com `requireAllSignatures: false`, envia ao relayer, que valida e assina como fee payer, then broadcasts. Outros exemplos corroborantes: Kora (relayer audit­ado pela Solana Foundation), Circle Gas Station, Privy, Dynamic, Tempo — todos documentam exatamente o padrão "fee payer diferente do usuário final" como recurso nativo do SVM, não uma gambiarra.

Essas três evidências, combinadas, tornam o mecanismo tecnicamente **CONFIRMADO** como possível em qualquer chain SVM que não tenha explicitamente removido essa capacidade do runtime (nenhuma evidência de que a Cookie Chain o tenha feito — ver seção "Cookie Chain").

---

## Mecanismo Técnico (fee payer / partial signing)

### Como funciona no nível de transação

Uma transação Solana/SVM tem uma lista de contas, onde a **primeira conta assinante é sempre tratada como o fee payer** (essa é a convenção usada pelas ferramentas — ex.: `Transaction.feePayer` no `@solana/web3.js`, e confirmada indiretamente pela documentação de multi-signer do Shyft: "the fee payer will be used as... the first signer will be used as the transaction fee payer account"). Não há exigência de que o fee payer seja também o autor/beneficiário da instrução de negócio (o "claim").

### Fluxo de assinatura em duas etapas (client-side + backend/sponsor)

Usando `@solana/web3.js` (legacy) — padrão documentado pelo Solana Cookbook e por tutoriais como Shyft:

```ts
// 1. Backend/app monta a transação com a instrução de claim
const tx = new Transaction({
  feePayer: sponsorPublicKey,       // Sponsor paga a taxa
  recentBlockhash: (await connection.getLatestBlockhash()).blockhash,
}).add(claimInstruction);           // instrução que transfere COOK do PDA/vault -> Wallet B

// 2. Wallet B assina PRIMEIRO sua parte (autoriza o claim, não a taxa)
const partiallySignedTx = await walletB.signTransaction(tx); // via Nightly adapter

// 3. Serializa permitindo assinaturas incompletas
const serialized = partiallySignedTx.serialize({ requireAllSignatures: false });

// 4. Backend recupera a transação e assina como fee payer
const recovered = Transaction.from(serialized);
recovered.partialSign(sponsorKeypair);

// 5. Envia à rede — agora com as duas assinaturas presentes
await connection.sendRawTransaction(recovered.serialize());
```

Em `@solana/kit` (o sucessor oficial do web3.js, antigo "web3.js v2"), o equivalente é `setTransactionMessageFeePayer` / `setTransactionMessageFeePayerSigner` para definir o pagador e `partiallySignTransactionMessageWithSigners` para assinatura parcial — a API mudou de nome mas o modelo de multi-signer com fee payer independente é preservado (fonte: `solanakit.com/api/functions/setTransactionMessageFeePayerSigner`, `solanakit.com/docs/advanced-guides/signers`).

### Durable Nonce (opcional, não obrigatório para este fluxo)

A documentação oficial (`solana.com/docs/core/transactions/durable-nonces`, acesso 2026-09-14) descreve nonces duráveis como um mecanismo que substitui o `recentBlockhash` por um valor de nonce armazenado on-chain, removendo a janela de expiração de ~150 slots e permitindo assinatura offline / envio postergado. Isso é útil se o "claim" precisar ser pré-assinado por Wallet B e enviado pelo sponsor depois (ex.: fluxo assíncrono), mas **não é um requisito** para o padrão básico de fee sponsorship — um blockhash recente comum já funciona se o fluxo for síncrono. Nota: a própria doc da Solana já sinaliza que durable nonces "may be deprecated in a future release", o que é um ponto de atenção para decisões de arquitetura de longo prazo.

---

## Nightly Wallet — Capacidades Confirmadas vs. Não Confirmadas

### Confirmado
- A Nightly Wallet possui um adapter oficial compatível com o padrão `@solana/wallet-adapter` da Solana (`@solana/wallet-adapter-nightly`, também replicado em `github.com/nightly-labs/solana-adapter`), expondo `signTransaction()` que recebe um objeto `Transaction` do `@solana/web3.js`.
- A documentação oficial da Nightly (`docs.nightly.app/docs/solana/solana/sign_transaction/`, acesso 2026-09-14) mostra um exemplo em que `tx.feePayer = publicKey` é setado para a própria conta conectada — ou seja, o exemplo padrão da documentação usa auto-pagamento, mas isso é a escolha do exemplo, não uma restrição declarada da API.
- A Cookie Chain lista Nightly como carteira "Built-in support" / "preferred multi-chain wallet" (via `docs.cookiechain.wtf` e projetos de terceiros do ecossistema, ex. `cookieflow-svm`).

### NÃO Confirmado (declarado explicitamente aqui para evitar alucinação)
- **Não foi encontrada nenhuma declaração explícita**, nem na documentação da Nightly (`docs.nightly.app`, `connect.nightly.app`) nem no código-fonte público consultável via WebFetch, dizendo que `signTransaction` suporta ou proíbe `feePayer != wallet conectada`.
- **Também não foi encontrada nenhuma restrição documentada** proibindo esse cenário. A ausência de menção é consistente com o comportamento padrão esperado de qualquer wallet adapter compatível com `@solana/wallet-adapter`: a wallet apenas assina as mensagens/contas onde ela é signatária declarada na transação — ela não teria motivo técnico para inspecionar ou vetar o campo `feePayer` quando esse campo aponta para outra chave que não a sua.
- Não foi possível obter (via fetch público) o corpo completo do arquivo-fonte `adapter/src/index.ts` do repositório `nightly-labs/solana-adapter` para citar a implementação literal do `signTransaction`. Essa é uma lacuna de verificação — recomenda-se um teste manual empírico (testnet da Cookie Chain) antes de assumir compatibilidade total em produção.

**Conclusão desta seção**: comportamento **plausível e sem barreira documentada**, mas classificado como **NOT VERIFIED por ausência de confirmação direta da Nightly** — recomenda-se teste empírico (Research Gate seguinte) antes de comprometer arquitetura de produto a isso.

---

## Padrões Existentes no Ecossistema (relayers / Octane / etc.)

O padrão "usuário assina, sponsor paga a taxa" é maduro e usado em produção:

| Projeto | Modelo | Fonte |
|---|---|---|
| **Octane** (anza-xyz, ex-Solana Labs) | Relayer HTTP open-source; usuário paga em SPL token, Octane paga SOL como fee payer | github.com/anza-xyz/octane |
| **Kora** | Fee relayer auditado pela Solana Foundation; zero SOL necessário, paga em qualquer SPL token | bex.co/blog (2026-08-05), citado via busca |
| **Circle Gas Station** | "How Fee Payers Can Enable Gasless Transactions on Solana" — serviço de fee payer gerenciado | circle.com/blog |
| **Privy / Dynamic / Tempo** | Documentação de SDKs de wallet-as-a-service com suporte nativo a `feePayer` sponsor | docs.privy.io, dynamic.xyz/docs, tempo.xyz/developers/docs |
| **Solana Pay** | Não é sponsorship de fee diretamente, mas usa o mesmo modelo de transação parcialmente construída e assinada por partes distintas |  (mencionado no contexto, não verificado em profundidade nesta pesquisa) |

Isso corrobora que o padrão pretendido pela Cookie Chain/FirstBite não é uma invenção arriscada, mas replica arquitetura testada em produção há vários anos no ecossistema Solana.

---

## Ameaças de Segurança Identificadas

O risco central do padrão é: **o sponsor não pode assinar cegamente qualquer transação que o cliente construa**, sob pena de:

1. **Instruction injection** — o cliente adiciona instruções extras não relacionadas ao "claim" (ex.: drenar outro recurso, transferir para endereço arbitrário) e o sponsor, ao assinar como fee payer, paga a taxa de uma transação maliciosa executada atomicamente junto com o claim legítimo.
2. **Uso indevido da conta do fee payer como conta gravável** — se o sponsor não validar isso, uma instrução poderia declarar a conta do próprio sponsor como `writable` e tentar drenar lamports/tokens dela.
3. **Replay / duplicação** — reenvio da mesma transação assinada para gerar múltiplos claims ou múltiplos débitos de taxa do sponsor (DoS/spam contra o sponsor).
4. **Transações que falham propositalmente** — abuso para gastar o orçamento de fee do sponsor sem resultado útil (spam/DoS).

### Mitigações confirmadas em implementações reais (Octane, fonte: `github.com/anza-xyz/octane/blob/master/docs/library.md` e README, acesso 2026-09-14)

- `validateTransaction`: valida metadados da transação antes da assinatura (fee payer, fee, quantidade de assinaturas esperadas).
- `validateInstructions`: **verifica que nenhuma instrução usa a conta do fee payer como writable** — mitigação direta contra drenagem da conta do sponsor.
- Simulação prévia (`simulateTransaction`) antes de assinar/broadcast, para detectar transações que falhariam on-chain, duplicadas, ou de origem inconsistente ("duplicated transactions, fee payer source and failing transactions detection using simulation").
- Rate limiting e regras de negócio específicas por "action" (ex.: `createAccountIfTokenFeePaid` exige que a instrução de fee e a de criação de conta correspondam exatamente ao padrão esperado) — ou seja, o sponsor **não assina bytes arbitrários**, ele assina apenas transações que batem com um "shape" pré-definido e conhecido (uma allowlist de padrões de instrução), o que operacionaliza o princípio "sponsor signs an intent it understands, never arbitrary bytes".

### Recomendação de design para o Claim da FirstBite/Cookie Chain

Com base nas evidências acima, a implementação do backend/sponsor deveria, no mínimo:
- Construir o esqueleto da transação no **backend** (não confiar em transação vinda pronta do cliente), fixando o programa, a instrução (`claim`), as contas envolvidas (PDA/vault, Wallet B, mint COOK) e os valores.
- Validar que a única conta com permissão de assinatura de "negócio" é Wallet B, e que nenhuma instrução declara a conta do sponsor como writable além do necessário para pagar a taxa.
- Simular a transação (`simulateTransaction`) antes do broadcast final.
- Aplicar rate limiting por wallet/IP para evitar abuso do orçamento de gas do sponsor.
- Nunca aceitar bytes de transação arbitrários assinados apenas pelo cliente sem revalidação de "shape" no backend antes do sponsor assinar.

---

## Cookie Chain — Particularidades Conhecidas

**Fontes oficiais localizadas**: `cookiechain.wtf`, `invest.cookiechain.wtf`, `docs.cookiechain.wtf/getting-started` (acesso 2026-09-14).

Achados confirmados:
- Cookie Chain é descrita como um "community-operated SVM Layer 1", com RPC pública em `https://rpc.cookiescan.io`, explorer em `cookiescan.io`, bridge comunitária multi-sig em `hyperlane.cookiescan.io`/`bridge.cookiescan.io`.
- Fee base declarada: **0.000005 COOK por assinatura** (5.000 lamports), citada tanto no site institucional quanto por projetos terceiros (`cookcost` no GitHub, que compara custos de transação da Cookie Chain contra a mainnet Solana) — o valor coincide com a constante padrão de fee-per-signature do SVM, e a observação de terceiros é de que a Cookie Chain "has no auction on top of it" (sem priority fee dinâmico/leilão adicional).
- Wallet Nightly é oficialmente listada como suportada ("Built-in support for Nightly Wallet (Cookie Chain's preferred multi-chain wallet)").
- A documentação oficial getting-started **não** detalha explicitamente mecanismos de fee sponsorship, peculiaridades do runtime SVM, ou qualquer modificação ao modelo padrão de fee payer.

**Achados NÃO oficiais, mas indicativos (repositórios de terceiros do ecossistema/hackathon Cookie Chain)**:
- Múltiplos apps construídos por outros times no mesmo hackathon (`cookie-tab`, `cookiechain-capp`) **não implementam** fee sponsorship via `feePayer` alternativo — em vez disso, usam o modelo padrão onde "the fee payer is the payer's own wallet" e resolvem o problema de "carteira sem COOK" via bridge/faucet manual ("Bridge a small amount of COOK from Solana", "sponsor test-gas drip"). Isso **não prova que o padrão feePayer-sponsor seja impossível na Cookie Chain** — apenas indica que nenhum concorrente observado o implementou ainda, o que pode ser oportunidade (diferencial competitivo) ou pode sinalizar um obstáculo desconhecido não documentado que vale testar cedo.

**Declaração explícita exigida pela tarefa**: **NOT VERIFIED para a Cookie Chain especificamente** quanto a (a) qualquer restrição de runtime ao uso de `feePayer` distinto do signer de negócio, e (b) comportamento exato da Nightly Wallet nesse cenário quando conectada à Cookie Chain. A avaliação acima se baseia em comportamento padrão SVM/Solana documentado e no fato de que a própria comunidade descreve a Cookie Chain como reutilizando "familiar SVM tooling" e validador compatível com ferramentas Solana padrão, mas nenhuma fonte oficial testou ou declarou este fluxo específico.

---

## Fontes

- Solana Cookbook — Fee Sponsorship: https://solana.com/developers/cookbook/transactions/fee-sponsorship (acesso 2026-09-14)
- Solana Docs — Durable Nonces: https://solana.com/docs/core/transactions/durable-nonces (acesso 2026-09-14)
- Solana Docs — Fees: https://solana.com/docs/core/fees (acesso 2026-09-14)
- Solana SDK (Rust) — `Transaction::partial_sign`: https://docs.rs/solana-sdk/latest/solana_sdk/transaction/struct.Transaction.html (acesso 2026-09-14)
- Shyft Docs — How to sign Transactions using multiple signers on Solana: https://docs.shyft.to/dev-guides/solana/transactions/how-to-sign-transactions-using-multiple-signers-on-solana (acesso 2026-09-14)
- @solana/web3.js — Transaction class: https://solana-foundation.github.io/solana-web3.js/classes/Transaction.html (acesso 2026-09-14)
- Solana Cookbook — Offline Transactions: https://solana.com/developers/cookbook/transactions/offline-transactions (acesso 2026-09-14)
- Solana Kit — `setTransactionMessageFeePayerSigner`: https://www.solanakit.com/api/functions/setTransactionMessageFeePayerSigner (acesso 2026-09-14)
- Solana Kit — Signers guide: https://www.solanakit.com/docs/advanced-guides/signers (acesso 2026-09-14)
- Octane (anza-xyz) — README: https://github.com/anza-xyz/octane/blob/master/README.md (acesso 2026-09-14)
- Octane (anza-xyz) — library.md: https://github.com/anza-xyz/octane/blob/master/docs/library.md (acesso 2026-09-14)
- Octane (solana-labs mirror) — recipes.md: https://github.com/solana-labs/octane/blob/master/docs/recipes.md (acesso 2026-09-14)
- Nightly Docs — Sign Transaction (Solana): https://docs.nightly.app/docs/solana/solana/sign_transaction/ (acesso 2026-09-14)
- Nightly Connect Docs: https://connect.nightly.app/docs/solana/solana/connect (acesso 2026-09-14)
- Nightly Solana Adapter (repo): https://github.com/nightly-labs/solana-adapter (acesso 2026-09-14 — conteúdo de implementação não recuperável via fetch público nesta sessão)
- Wallet Adapter oficial (Nightly package): https://www.npmjs.com/package/@solana/wallet-adapter-nightly (acesso 2026-09-14)
- Cookie Chain — site institucional: https://www.cookiechain.wtf/ (acesso 2026-09-14)
- Cookie Chain — investidores: https://invest.cookiechain.wtf/ (acesso 2026-09-14)
- Cookie Chain — Docs, Getting Started: https://docs.cookiechain.wtf/getting-started (acesso 2026-09-14)
- Terceiros (não oficiais, contexto do ecossistema/hackathon): `github.com/utunumus/cookcost`, `github.com/graylingops/cookiechain-capp`, `github.com/TheBenMeadows/cookie-tab`, `github.com/VincentSai/cookieflow-svm` (acesso 2026-09-14) — usados apenas como evidência circunstancial de comportamento observado por terceiros, não como fonte oficial.
- Kora fee relayer (contexto): https://bex.co/blog/2026/08/05/solana-kora-fee-relayer-gasless-transactions (acesso 2026-09-14)
- Circle — Gas Station / Fee Payers: https://www.circle.com/blog/how-circles-gas-station-uses-fee-payers-to-enable-gasless-transactions-on-solana (acesso 2026-09-14)
