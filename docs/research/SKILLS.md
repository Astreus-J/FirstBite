# Auditoria de Skills, Agentes e Ferramentas (Fase 1)

Data da auditoria: 2026-09-14

## Estado encontrado

- Não existe `.claude/skills/` nem `.claude/agents/` no diretório do projeto (`/home/santos/ParaDevs/superteam/FirstBite`) — este é um projeto novo, sem configuração prévia.
- `~/.claude/skills/` (global) contém uma biblioteca extensa de Skills genéricas, majoritariamente de segurança ofensiva/fuzzing (uso interno de outro contexto de trabalho do usuário — auditorias de smart contracts, fuzzing, etc.), plus algumas de propósito geral (design, escrita técnica, revisão de código).
- Nenhuma Skill de terceiros precisou ser instalada ou copiada — todas as Skills relevantes já fazem parte do catálogo padrão do ambiente. Não houve necessidade de avaliar reputação/origem externa.

## Skills relevantes para o FirstBite (já disponíveis, catálogo padrão)

| Skill | Origem | Finalidade | Confiável? | Decisão |
|---|---|---|---|---|
| `solana-vulnerability-scanner` | Catálogo padrão do ambiente | Detecta vulnerabilidades comuns em programas Solana/Anchor (CPI arbitrária, PDA, signer/ownership, sysvar spoofing) | Sim — Skill de segurança dedicada a Solana | Usar na Fase 18 (Security Review) sobre o programa Anchor do FirstBite |
| `security-review` | Catálogo padrão | Revisão de segurança geral (injeção, auth, cripto) | Sim | Usar como complemento para o backend do sponsor service |
| `code-review` | Catálogo padrão | Revisão de diffs/PRs por correção, simplificação, eficiência | Sim | Usar antes de cada merge de feature branch para develop |
| `differential-review` | Catálogo padrão | Revisão diferencial focada em segurança de mudanças (PRs/commits) | Sim | Alternativa ao `code-review` quando o foco for puramente segurança em um diff |
| `entry-point-analyzer` | Catálogo padrão | Mapeia entry points state-changing em contratos (Solana incluído) | Sim | Útil na Fase 18 para listar todas as instruções do programa e sua superfície de ataque |
| `dimensional-analysis` | Catálogo padrão | Anotação de unidades/decimais em código com aritmética financeira | Sim | Útil ao implementar cálculos de `amountPerClaim` / lamports para evitar erros de escala |
| `impeccable` | Catálogo padrão | Design/UX de interfaces frontend | Sim | Usar na Fase 10 (UX/UI) para revisar a landing page e o fluxo de Claim |
| `dataviz` | Catálogo padrão | Padrões de visualização de dados | Sim (se necessário) | Usar apenas se a página de creator history/analytics exigir gráficos — não obrigatório no MVP |
| `technical-writing` | Catálogo padrão | Diretrizes de escrita técnica/documentação | Sim | Usar ao redigir o README final (Fase 26) |
| `gh-cli` | Catálogo padrão | Reforça uso do `gh` autenticado em vez de curl/WebFetch para GitHub | Sim | Usar para qualquer interação com o repositório GitHub (issues, PRs) |
| `code-review` (`--ultra`) | Catálogo padrão | Revisão multi-agent em nuvem do branch/PR | Sim | Cogitar antes da submissão final, como segunda revisão independente do programa Anchor |
| `run` | Catálogo padrão | Sobe e testa a aplicação localmente com screenshot | Sim | Usar antes de reportar qualquer feature de frontend como concluída |
| `init` | Catálogo padrão | Gera/atualiza `CLAUDE.md` | Sim | Usar na Fase 20 |

## Skills consideradas e descartadas

| Skill | Motivo da não utilização |
|---|---|
| Skills de fuzzing (`libfuzzer`, `aflpp`, `atheris`, `cargo-fuzz`, `libafl`, etc.) | Voltadas a C/C++/Python/Rust genérico via fuzzing de baixo nível — desproporcional ao escopo de um programa Anchor pequeno no MVP. Reavaliar apenas se o programa crescer e justificar fuzzing (`cargo-fuzz` teria mais sentido que os demais, dado que Anchor é Rust). |
| Scanners de vulnerabilidade de outras chains (`algorand-vulnerability-scanner`, `cairo-vulnerability-scanner`, `cosmos-vulnerability-scanner`, `ton-vulnerability-scanner`, `substrate-vulnerability-scanner`) | Não aplicáveis — FirstBite roda em uma chain SVM (Cookie Chain), não nessas VMs. |
| `websocket-engineer`, `fastapi-python`, `spring-boot-engineer`, `nodejs-backend-patterns` | Genéricas demais / não confirmadas como necessárias até a arquitetura do backend (sponsor service) ser decidida na Fase 13. Reavaliar depois: se o sponsor service for Node/TypeScript, `nodejs-backend-patterns` pode ajudar. |
| `design` (canvas) | Já existe `impeccable` para revisão de UI; não é necessário um canvas multi-artboard para o escopo do MVP. |

## Skills locais criadas para este projeto

Nenhuma até o momento. Seguindo a instrução de não criar Skills apenas para aumentar complexidade, novas Skills locais em `.claude/skills/` só serão criadas se, durante a implementação, surgir uma necessidade repetida e específica do FirstBite que as Skills genéricas acima não cubram (ex: um checklist de submissão do bounty com passos muito específicos). Candidatas a reavaliar mais adiante: `hackathon-submission` (checklist final de submissão) e `cookie-chain` (referência rápida de RPC/endpoints/decimais da Cookie Chain), ambas apenas se o conteúdo acumulado em `docs/` crescer o suficiente para justificar uma Skill de consulta rápida.

## Agentes (subagent types) relevantes

- `general-purpose`: usado para as 4 frentes de pesquisa paralela (Fases 2–4, 6, 11) — hackathon/Superteam, ecossistema Cookie Chain/concorrentes, sponsorship SVM/Nightly, pitch/storytelling.
- `Explore`: reservado para buscas pontuais de código depois que o repositório tiver conteúdo.
- Segunda revisão de segurança independente (Fase 18): usar um agente com contexto limpo (não o mesmo que escreveu o programa) — decisão a confirmar quando o programa Anchor existir.
