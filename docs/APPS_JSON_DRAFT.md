# Rascunho da entrada `apps.json`

**FATO CONFIRMADO** (schema real lido diretamente de `cookiechain/superteam-hackathon-submissions` em 2026-09-14, via `raw.githubusercontent.com/.../README.md` e `.../apps.json`): o formato abaixo é o schema real do repositório, não uma suposição. Categorias já em uso no arquivo: `Infrastructure`, `Social`, `Tooling` (nenhum outro projeto usa `firstbite` como `id`).

Preenchido com tudo que **não** depende do deploy real. Campos pendentes usam `null`/`[]` — convenção do próprio repo ("null and [] are fine for anything you don't have — leave the key in place rather than omitting it").

## Passos para o PR (confirmados no README do repo oficial)

1. Fork de `cookiechain/superteam-hackathon-submissions`.
2. Redimensionar o logo para exatamente o que já temos (`media/logo-512.png`, 512×512) e adicioná-lo em `logos/firstbite.png` dentro do fork.
3. Screenshots (quando existirem, pós-deploy) vão em `screenshots/firstbite/`, numeradas (`01-...png`, `02-...png`).
4. Acrescentar o objeto abaixo a `apps.json` (append, não substituir o array).
5. Validar antes de abrir o PR: JSON válido (`jq empty apps.json`), sem `id` duplicado, sem mídia externa (só `raw.githubusercontent.com/cookiechain/superteam-hackathon-submissions/main/...`), todo arquivo referenciado existe de fato.
6. Abrir PR **com o título do nome do projeto** ("FirstBite").
7. Isso só cataloga o projeto — a submissão oficial e vinculante continua sendo o botão "Submit Now" no listing da Superteam Earn. Fazer os dois.

## Entrada (JSON)

```json
{
  "id": "firstbite",
  "title": "FirstBite",
  "shortDescription": "Claim your first COOK with a sponsored fee — no bridge needed to start.",
  "description": "FirstBite solves Cookie Chain's cold-start problem: there is no public faucet, so a brand-new wallet can't even pay for its first transaction. A COOK holder creates a \"Bite\" — depositing COOK into an on-chain PDA vault and getting a shareable link/QR — and sends it to someone who has never touched Cookie Chain. That person connects Nightly and claims: a Sponsor Service builds and pays the fee for the claim transaction, so a wallet that starts at genuinely 0 COOK ends the interaction as an active, funded Cookie Chain wallet. Built with Anchor (Rust) and Next.js, with 11/11 program tests passing and two independent security reviews completed.",
  "category": "Infrastructure",
  "tags": ["onboarding", "fee-sponsorship", "gasless", "nightly-wallet", "anchor"],
  "links": {
    "website": "https://first-bite-seven.vercel.app/",
    "demo": null,
    "github": "https://github.com/Astreus-J/FirstBite",
    "x": null,
    "docs": "https://github.com/Astreus-J/FirstBite/blob/main/README.md",
    "video": null
  },
  "media": {
    "logo": "https://raw.githubusercontent.com/cookiechain/superteam-hackathon-submissions/main/logos/firstbite.png",
    "banner": null,
    "screenshots": []
  },
  "team": [
    {
      "name": "Jeielsantosdev",
      "role": "Developer",
      "x": null,
      "github": "https://github.com/Jeielsantosdev"
    }
  ]
}
```

## O que ainda falta antes de abrir o PR

- `links.website`: preenchido (`https://first-bite-seven.vercel.app/`, frontend já implantado na Vercel em 2026-09-15) — **mas o programa Anchor ainda não está na mainnet**, então o fluxo criar→reivindicar não funciona de ponta a ponta contra essa URL ainda. Não abrir o PR nem submeter no listing antes disso estar resolvido, mesmo com o link já existindo — cumprir "Ship something usable, not a landing page or a mockup" exige o programa on-chain de verdade.
- `links.demo`/`links.video`: opcionais, mas `video` é descrito como "the single most useful thing for a reviewer" — vale gravar um GIF/vídeo curto do fluxo criar→reivindicar assim que houver deploy real (pode reaproveitar o roteiro de `docs/PITCH.md`).
- `media.screenshots`: numeradas, commitadas em `screenshots/firstbite/` no fork, mostrando o app implantado de verdade (não localhost).
- `links.x`/`team[].x`: opcional — decidir se cria uma conta X do projeto antes de publicar `docs/X_THREAD.md` (esse arquivo já espera um `@handle`).
- `docs/DECISIONS.md`/`README.md` do projeto real (`Astreus-J/FirstBite`) precisam ter o Program Address e a URL de produção preenchidos antes de linkar aqui — hoje o `links.docs` aponta para um README que ainda tem esses campos como pendentes.
