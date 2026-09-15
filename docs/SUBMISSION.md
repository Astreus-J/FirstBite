# FirstBite — Submission Checklist (Fase 12)

Baseado nos requisitos confirmados em `docs/research/HACKATHON.md`. **Reler o listing e o README oficial do zero antes de submeter de verdade** — não confiar só nesta cópia, que reflete o estado em 2026-09-14.

Status: `PASS` / `FAIL` / `NOT APPLICABLE` / `PENDING` (a preencher conforme a implementação avança).

## O que falta para terminar, em ordem (2026-09-14)

1. **[BLOQUEADOR ATIVO] Conseguir COOK para deploy** — sem fundos reais, nada abaixo disso é possível. Caminho em andamento: pedir ao time da Cookie Chain via Discord (`discord.gg/dP6EjZeSJW`) ou Telegram (`@TheCookieNetChain`), seguindo o precedente documentado de outro projeto do bounty. Custo real necessário: rent-exemption do programa (~1,5 COOK, medido localmente) + saldo para o sponsor pagar taxas de claim na demo.
2. **Deploy do programa na Cookie Chain mainnet** (M7.1) — `anchor deploy` contra `rpc.cookiescan.io`, assim que houver fundos. Depois: rodar `anchor keys sync` só se o program ID mudar, e **atualizar o `SPONSOR_SECRET_KEY`** para uma chave real financiada (nunca reusar as chaves de teste geradas nesta sessão).
3. **Deploy do frontend** (M7.2) — Vercel (ou similar), com `NEXT_PUBLIC_COOKIE_CHAIN_RPC` e `SPONSOR_SECRET_KEY` configurados como variáveis de ambiente de produção.
4. **Teste manual completo na mainnet real** — repetir o fluxo criar→reivindicar com a Nightly real, agora contra a Cookie Chain de verdade (já validamos o mecanismo localmente e com a extensão real contra validador local; falta só a confirmação final no ambiente de produção).
5. **Atualizar `README.md`** com o Program Address real, a URL da aplicação ao vivo, e um link de transação real no CookieScan.
6. **Abrir o PR com `apps.json`** (fork do repo oficial `cookiechain/superteam-hackathon-submissions`) — rascunho completo em `docs/APPS_JSON_DRAFT.md`, logo pronto (`media/logo-512.png`); falta só `links.website` e screenshots reais, que dependem do deploy.
7. **Submissão oficial** — botão "Submit Now" no listing da Superteam Earn **e** o PR no GitHub (os dois, não só um).
8. **Publicar a X thread** (`docs/X_THREAD.md`) — falta gravar o GIF/vídeo do fluxo completo e preencher os links reais.
9. **Reler o bounty do zero** no dia da submissão (regras podem ter mudado desde 2026-09-14).

Tudo o que **não** depende de fundos já está pronto: programa testado (11/11) e revisado duas vezes por segurança, frontend completo e testado (inclusive com a Nightly real contra validador local), CI configurado, README/pitch/FAQ/X thread escritos, repositório público no GitHub com todo o histórico de GitFlow.

## Requisitos obrigatórios (confirmados em `cookiechain/superteam-hackathon-submissions`)

| Requisito | Status | Nota |
|---|---|---|
| App roda na Cookie Chain (mainnet ou testnet claramente documentado) | PENDING | Depende de M7.1 (deploy do programa) |
| URL pública funcional (não basta o repositório) | PENDING | Depende de M7.2 |
| Código-fonte real no GitHub, com commits do período do hackathon | DONE | https://github.com/Astreus-J/FirstBite (público, todas as branches do GitFlow publicadas, histórico completo desde 2026-09-14) |
| "Ship something usable, not a landing page or a mockup" | PENDING | Depende do fluxo de claim end-to-end (M4.3) funcionar de verdade |
| Entrada em `apps.json` com `id`, `title`, `shortDescription`, `description`, `category`, `tags`, `links.website`, `links.github`, `media.logo` (512×512), `team[].name` | PARTIAL | Rascunho pronto em `docs/APPS_JSON_DRAFT.md`; falta `links.website` (depende de M7.2) |
| Mídia hospedada via `raw.githubusercontent.com` dentro do próprio repositório da submissão (não Imgur/IPFS/host próprio) | PENDING | Atenção na hora de montar o PR |
| Submissão oficial e vinculante via botão "Submit Now" no listing da Superteam Earn (o PR no GitHub cataloga, mas não substitui) | PENDING | Fazer os dois: listing + PR |

## Itens não informados publicamente — verificar de novo antes de submeter

- Deadline exato de submissão (só o anúncio de vencedores em 28/09/2026 está confirmado).
- Se equipes são permitidas além de indivíduos, e limite de tamanho.
- Se há limite de uma submissão por pessoa/equipe.
- Qualquer anúncio novo do sponsor (Discord `discord.gg/dP6EjZeSJW`, Telegram `@TheCookieNetChain`, X `@TheCookieChain`) entre 2026-09-14 e a data real de submissão.

## Materiais a preparar (Fase 11/Fase 12)

| Material | Status |
|---|---|
| Tagline de 10s | DONE — `docs/PITCH.md` |
| Elevator pitch de 20s | DONE — `docs/PITCH.md` |
| Pitch de 60s | DONE — `docs/PITCH.md` |
| Pitch de 2min | DONE — `docs/PITCH.md` |
| Demo walkthrough (roteiro determinístico, ver `docs/PRODUCT.md` e Fase 27 do briefing original) | DONE — `docs/PITCH.md` |
| FAQ para jurados (objeções antecipadas — base em `docs/research/PITCH_RESEARCH.md`) | DONE — `docs/PITCH.md`, respostas refinadas com o produto real (não mais rascunho) |
| X thread | DONE (rascunho) — `docs/X_THREAD.md`, faltam apenas GIFs/links/handle antes de publicar |
| README final (estrutura da Fase 26) | DONE — `README.md` na raiz (program address/live URL marcados pending até M7) |
| Logo 512×512 para `apps.json` | DONE — `media/logo-512.png`, também usado como favicon do site |
| Screenshots para `apps.json` | PENDING — precisam do app implantado de verdade |

## Regra de ouro antes de submeter

Não submeter enquanto existir `FAIL` em um item obrigatório. Reler o bounty do zero no dia da submissão — não confiar apenas na pesquisa de 2026-09-14.
