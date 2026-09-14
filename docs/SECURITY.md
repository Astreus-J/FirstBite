# FirstBite — Threat Model (Fase 7)

Status: rascunho baseado em pesquisa documental (`docs/research/SPONSORSHIP.md`, `docs/research/ECOSYSTEM.md`) e no princípio de projeto: **"Sponsor signs an intent it understands, never arbitrary bytes."** Será revisado após o Technical PoC e novamente na Fase 18 (Security Review) por uma segunda avaliação com contexto limpo.

## Ativos a proteger

1. **Saldo da wallet Sponsor** (a conta que paga as taxas de claim patrocinadas — pode ser a própria wallet do creator do Bite, ou um serviço central; decisão de arquitetura de produto ainda em aberto, ver `docs/PRODUCT.md`).
2. **Fundos depositados em cada `Bite`** (PDA program-owned, ver `docs/ARCHITECTURE.md`).
3. **Integridade do registro de claims** (`ClaimRecord`) — garantir que `claimed_count` reflete a realidade e não pode ser burlado.
4. **Disponibilidade do serviço de sponsorship** (se um backend central assina/paga, ele é um alvo de negação de serviço/abuso de rate limit).

## Atores

- **Creator**: possui COOK, cria e deposita em um Bite, pode cancelar.
- **Claimer**: pessoa nova, 0 COOK, assina o claim.
- **Sponsor**: paga a taxa de rede do claim. Pode ser (a) o próprio programa via CPI que devolve uma fração do valor claimed para cobrir a fee, (b) um backend centralizado que atua como fee payer alternativo, ou (c) o próprio creator pré-financiando um "gas budget" — decisão de arquitetura pendente, mas o modelo de ameaça abaixo cobre o cenário (b), que é o que a pesquisa (`SPONSORSHIP.md`) indica como padrão de mercado (Octane/Kora/Blink Labs).
- **Atacante externo**: qualquer parte não autorizada tentando abusar do fluxo.

## Trust boundaries

```
Browser (Claimer)  --(transação parcialmente assinada)-->  Sponsor Service (backend)
                                                                  |
                                                    valida intenção, completa e assina como feePayer
                                                                  |
                                                                  v
                                                        Cookie Chain RPC --> FirstBite Program
```

O limite de confiança crítico é **Browser → Sponsor Service**: o backend nunca deve tratar o que recebe do browser como confiável. Tudo que cruza essa fronteira é potencialmente hostil.

## Ameaças e mitigações

| # | Ameaça | Descrição | Mitigação |
|---|---|---|---|
| T1 | **Drain da sponsor wallet via instrução maliciosa** | Cliente monta uma transação com uma instrução extra (ex.: `transfer` da conta do sponsor para outra wallet) e pede para o backend assinar como feePayer, esperando que o backend assine cegamente. | Backend **nunca assina uma transação vinda do cliente**. Ele reconstrói a transação do zero a partir de uma intenção estruturada (`{ bite_pubkey, claimer_pubkey }`), monta exatamente as instruções esperadas (a instrução `claim` do programa FirstBite, nada mais), e só então assina como feePayer. Qualquer instrução fora dessa lista é impossível porque o backend é quem monta a transação, não quem valida uma pronta. |
| T2 | **Instrução extra "escondida" dentro da própria instrução esperada** | Mesmo reconstruindo, se o backend aceitar parâmetros livres do cliente (ex.: "amount", "recipient") sem cross-checar contra o estado on-chain do Bite, um cliente poderia pedir um claim de valor maior ou para outro destinatário. | O backend/programa nunca confia em `amount` vindo do cliente — o valor do claim é sempre lido do estado on-chain do `Bite` (`amount_per_claim`), nunca de um parâmetro solto da requisição. O `recipient` é sempre a wallet que assinou a intenção (verificado por assinatura), nunca um campo arbitrário de request body. |
| T3 | **Replay attack** (reenviar a mesma transação assinada duas vezes) | Um claim válido já processado é reenviado para tentar duplicar o crédito. | (a) `recentBlockhash`/nonce da transação expira nativamente no runtime SVM (mesma proteção padrão contra replay que existe em qualquer transação Solana/SVM); (b) a existência do `ClaimRecord` PDA (criado com `init`, que falha se a conta já existe) é uma segunda barreira on-chain independente do blockhash — mesmo que o blockhash fosse reaproveitável, o programa rejeitaria um segundo claim do mesmo par `(bite, claimer)`. |
| T4 | **Multiple claim / Sybil dentro do mesmo Bite** | O mesmo claimer tenta reivindicar várias vezes até esgotar `max_claims`. | Constraint `init` no `ClaimRecord` PDA por `(bite, claimer)` — ver `docs/ARCHITECTURE.md`. Reivindicar de novo é fisicamente impossível on-chain (não é apenas uma checagem de aplicação, é uma invariante do programa). |
| T5 | **Sybil entre Bites diferentes (uma pessoa cria N wallets para farmar N onboardings)** | Fora do escopo de invariante on-chain pura — é um problema de produto/abuso, não de bug de programa. | Aceito como risco residual no MVP (documentado abaixo em "Riscos aceitos"). Mitigação de produto possível pós-hackathon: rate limiting no Sponsor Service por IP/fingerprint, ou exigir alguma prova mínima de unicidade — não implementado no MVP. |
| T6 | **Bot farming do Sponsor Service** (spamar requisições de claim para esgotar o saldo do sponsor com claims legítimos em escala) | Um attacker cria muitos Bites pequenos de outra conta ou automatiza claims legítimos em massa para drenar o orçamento de gas do sponsor. | Rate limiting no backend (por IP e por `bite_pubkey`); o sponsor só paga fee de transações que resultam em uma instrução `claim` válida contra um `Bite` real e ainda ativo — o custo marginal por abuso é limitado ao valor de uma fee de rede (baixo na Cookie Chain, mas não nulo). Documentado como risco a monitorar, não eliminado. |
| T7 | **Claim depois de Bite expirado** | Claimer tenta reivindicar após `expiration` ter passado. | Instrução `claim` valida `Clock::get()?.unix_timestamp < bite.expiration` (quando `expiration` está definido) como constraint obrigatória antes de mover fundos. |
| T8 | **Claim depois de cancelamento** | Claimer tenta reivindicar um Bite que o creator já cancelou. | `cancel_bite` fecha a conta do `Bite` (`close = creator`) ou seta `status = Cancelled`; a instrução `claim` valida `status == Active` como constraint. Se a conta for fechada, o claim falha naturalmente (conta não existe mais). |
| T9 | **Overflow/underflow aritmético** | `claimed_count + 1` ou `remaining_amount - amount_per_claim` estourando os limites do tipo. | Usar operações checked (`checked_add`, `checked_sub`) no Rust/Anchor, nunca aritmética não verificada, retornando erro explícito do programa em vez de wrap silencioso. |
| T10 | **PDA spoofing / account substitution** | Cliente (ou o próprio Sponsor Service, se comprometido) passa uma conta `Bite` ou `ClaimRecord` que não é a PDA derivada corretamente. | Anchor `seeds` + `bump` constraints validam a derivação da PDA em toda instrução — o programa rejeita contas que não batem com a derivação esperada a partir de `creator`/`bite_id`/`claimer`. Nunca aceitar o endereço da PDA como input livre; sempre derivar e comparar. |
| T11 | **Ownership/signer validation ausente** | Instrução `cancel_bite` sendo chamada por alguém que não é o creator; instrução `claim` sendo processada sem a assinatura real do claimer. | Constraints Anchor `has_one = creator` (com `Signer<'info>` no creator) para cancel; `Signer<'info>` obrigatório no claimer para claim — o programa recusa a transação se a assinatura correspondente não estiver presente, independentemente do que o feePayer assinou. |
| T12 | **CPI maliciosa** | Alguma instrução futura do programa (ex.: se vier a fazer CPI para outro programa) sendo enganada para chamar um programa diferente do esperado. | No MVP, o programa FirstBite não faz CPI para programas externos além do System Program para transferências nativas — superfície de CPI mínima por design. Se isso mudar, validar `program_id` explicitamente antes de qualquer CPI. |
| T13 | **Secret leakage** (private key do Sponsor exposta) | A chave privada do Sponsor Service vazar (logs, repo, erro verboso). | **Nunca** a chave privada do sponsor chega ao frontend — vive só no backend, carregada de variável de ambiente/secret manager, nunca commitada (`*.key`, `*-keypair.json`, `id.json` já estão no `.gitignore`). Telemetria/logs do backend nunca logam a chave nem a transação assinada completa com detalhes sensíveis além do necessário (signature, status). |
| T14 | **Frontrunning** | Alguém observa um claim pendente no mempool e tenta antecipá-lo. | Impacto limitado no MVP: o `claimer` é fixado pela assinatura exigida (`Signer`) — não há como outra conta "roubar" o claim de outra wallet, porque a instrução exige a assinatura da wallet destinatária específica. O único cenário de corrida é "quem chega primeiro entre múltiplos claimers de um Bite com `max_claims` limitado" — comportamento esperado e aceitável (primeiro a assinar, primeiro a receber), não uma vulnerabilidade. |
| T15 | **Rate limit bypass no Sponsor Service** | Atacante rotaciona IPs/headers para burlar rate limiting simples. | Reconhecido como limitação de um rate limit ingênuo por IP; mitigação mais forte (ex.: prova de unicidade, CAPTCHA, limite por Bite além de por IP) fica como item de roadmap pós-MVP — documentado como risco aceito abaixo, não bloqueador para o hackathon. |

## Riscos aceitos (MVP do hackathon)

Documentados explicitamente em vez de escondidos, conforme o princípio anti-alucinação/anti-overclaim do projeto:

1. **Sybil entre Bites/wallets** (T5) não é resolvido no MVP — qualquer pessoa pode gerar N wallets e reivindicar N onboardings de Bites diferentes. Aceitável para o escopo do hackathon; é o mesmo risco que qualquer faucet enfrenta.
2. **Rate limiting é básico** (T15) — não há prova de unicidade forte (ex.: verificação humana) no MVP.
3. **Sponsor Service centralizado é um ponto único de operação** — se ficar sem saldo de COOK ou sair do ar, claims patrocinados param (o claim em si continua possível se o claimer tiver como pagar a própria fee, já que a instrução do programa não depende logicamente do sponsorship, só a UX "zero-balance" depende).
4. **Nenhum mecanismo formal de auditoria externa** foi executado ainda sobre o programa Anchor — planejado para a Fase 18, antes de qualquer deploy considerado "final" para a submissão.

## Resultado da Skill `solana-vulnerability-scanner` (M1.6, 2026-09-14)

Aplicada sobre `programs/first_bite/src/` após a implementação de `create_bite`, `claim` e `cancel_bite`. Os 6 padrões cobertos pela Skill e o resultado de cada um:

| Padrão | Resultado | Evidência |
|---|---|---|
| Arbitrary CPI | **OK** | Única CPI do programa é `system_program::transfer` em `create_bite.rs`, usando `system_program: Program<'info, System>` — Anchor valida o program ID automaticamente; não há CPI para programas arbitrários/controlados pelo cliente. |
| Improper PDA Validation | **OK** | Todas as PDAs (`bite`, `claim_record`) usam `seeds = [...] + bump` do Anchor — `bump,` (calcula e guarda o bump canônico no `init`) ou `bump = bite.bump` (reusa o bump já persistido). Nenhum bump vem do cliente sem validação. |
| Missing Ownership Check | **OK** | Toda conta de estado é tipada `Account<'info, Bite>` / `Account<'info, ClaimRecord>` — o wrapper do Anchor valida owner e discriminator antes de desserializar. |
| Missing Signer Check | **OK** | `creator`, `claimer` e `payer` são `Signer<'info>` em todas as instruções que exigem autorização; `cancel_bite` adiciona `constraint = bite.creator == creator.key() @ FirstBiteError::Unauthorized` (ver T11). |
| Sysvar Account Check | **N/A — seguro por construção** | O programa nunca aceita `Rent`/`Clock` como conta de instrução; usa exclusivamente `Rent::get()?` / `Clock::get()?` (syscall direto), eliminando de vez a classe de ataque de sysvar spoofado. |
| Improper Instruction Introspection | **N/A** | O programa não usa introspecção de instruções (`load_instruction_at` etc.). |

**Nenhum finding.** Isso cobre vulnerabilidades genéricas da plataforma SVM — as ameaças específicas do FirstBite (Sybil, rate limiting, drain do sponsor, replay a nível de aplicação) continuam sendo as ameaças T1–T15 mapeadas acima, que são de lógica de produto/backend, não de padrão on-chain genérico, e são cobertas pelos testes de integração em `tests/first_bite.ts`, não por este scanner.

## Mapeamento de entry points (M1.6)

| Instrução | Acesso | Muda estado? | Superfície de risco |
|---|---|---|---|
| `create_bite` | Público (qualquer signer com saldo) | Sim — cria `Bite`, transfere depósito | Cobertas: T9 (overflow no cálculo do total), amount abaixo do rent-exempt |
| `claim` | Público (qualquer signer) | Sim — cria `ClaimRecord`, transfere `amount_per_claim`, incrementa `claimed_count` | Cobertas: T3/T4 (replay/duplicate via `init` do `ClaimRecord`), T7 (expiração), T9 (overflow) |
| `cancel_bite` | Restrito ao `creator` original | Sim — fecha `Bite`, devolve saldo | Coberta: T11 (autorização) |

## Implementação do Sponsor Service (M4.2, 2026-09-14)

`app/src/app/api/claim/route.ts` implementa as mitigações acima na prática:

- **T1/T2 (instrução maliciosa / parâmetro forjado)**: a rota nunca recebe nem assina uma transação vinda do cliente. Ela recebe apenas `{ bite, claimer }` (dois pubkeys), busca o `Bite` on-chain, e constrói a instrução `claim` inteiramente no servidor via `program.methods.claim().accountsPartial({...}).instruction()`. `amount` nunca é aceito do cliente — vem sempre do campo `amount_per_claim` lido on-chain.
- **T3/T4 (replay/duplicate)**: a rota verifica preventivamente se a `ClaimRecord` PDA já existe antes de gastar uma assinatura do sponsor; a garantia real, porém, continua sendo a constraint `init` on-chain (a checagem aqui é só para dar um erro HTTP mais claro, não é a linha de defesa).
- **T6/T15 (bot farming / rate limit)**: um limitador em memória, por `bite`, rejeita more que 10 requisições/minuto — documentado como proteção básica, não durável entre deploys/instâncias (mesma ressalva já registrada em "Riscos aceitos" abaixo).
- **T7/T8 (expirado/depletado)**: checados contra o estado on-chain antes de gastar a assinatura do sponsor (defesa em profundidade — o programa também rejeita).
- **T13 (vazamento de secret)**: a chave do sponsor só existe em `SPONSOR_SECRET_KEY` (variável de ambiente, nunca no repositório) e só é carregada em `sponsor.server.ts`, que importa `"server-only"` — qualquer tentativa de importar esse módulo de um Client Component quebra o build.

Validado de ponta a ponta contra um `solana-test-validator` local com o programa real implantado: uma wallet com saldo genuinamente zero completou um claim pagando fee zero, com o sponsor confirmado como `fee payer` via `solana confirm -v`. Ver `docs/research/SPONSORSHIP.md` para os detalhes completos.

## Próximos passos

- Validar T1–T4, T7–T11 com testes de integração automatizados (Fase 17) que tentem ativamente cada ataque (ex.: tentar claim duplicado, tentar cancelar como não-creator, tentar claim de Bite expirado) — não depender só de leitura de código.
- Rodar a Skill `solana-vulnerability-scanner` sobre o programa assim que o código Anchor existir (Fase 18).
- Revisar este documento após o Technical PoC, caso a Cookie Chain revele comportamento divergente do padrão Solana assumido aqui.
