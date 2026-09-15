# Rascunho da entrada `apps.json`

Preenchido com tudo que **não** depende do deploy real. `links.website`, `media.screenshots` e a confirmação final de `links.github` ficam `TODO` até a Milestone 7 (deploy) terminar — não inventar URL antes de existir de verdade.

Repositório de destino do PR: `cookiechain/superteam-hackathon-submissions` (fork → branch → PR, conforme `docs/SUBMISSION.md`). Mídia deve ser hospedada via `raw.githubusercontent.com` dentro do próprio repo da submissão (regra confirmada em `docs/SUBMISSION.md`) — então `media/logo-512.png` deste repositório precisa ser copiado para dentro do fork no momento do PR, não referenciado por URL externa.

```json
{
  "id": "firstbite",
  "title": "FirstBite",
  "shortDescription": "Claim your first COOK with a sponsored fee — no bridge needed to start.",
  "description": "FirstBite solves Cookie Chain's cold-start problem: there is no public faucet, so a brand-new wallet can't even pay for its first transaction. A COOK holder creates a \"Bite\" — depositing COOK into an on-chain PDA vault and getting a shareable link/QR — and sends it to someone who has never touched Cookie Chain. That person connects Nightly and claims: a Sponsor Service builds and pays the fee for the claim transaction, so a wallet that starts at genuinely 0 COOK ends the interaction as an active, funded Cookie Chain wallet. Built with Anchor (Rust) and Next.js, with 11/11 program tests passing and two independent security reviews completed.",
  "category": "Onboarding",
  "tags": ["onboarding", "fee-sponsorship", "gasless", "nightly-wallet", "anchor"],
  "links": {
    "website": "TODO — depende do deploy do frontend (Milestone 7.2)",
    "github": "https://github.com/Astreus-J/FirstBite"
  },
  "media": {
    "logo": "media/logo-512.png",
    "screenshots": "TODO — capturar contra o app implantado de verdade, não localhost (Milestone 7.2)"
  },
  "team": [
    { "name": "Jeielsantosdev" }
  ]
}
```

## Notas

- `category`: usar `"Onboarding"` — se o repositório oficial tiver uma lista fechada de categorias válidas, conferir e ajustar antes do PR (não verificado ainda; ver `docs/research/HACKATHON.md`).
- `shortDescription`/`description` reaproveitam a linguagem já validada do `README.md` e `docs/PITCH.md` — não reescrever do zero no PR.
- `team[].name` usa o handle do GitHub (`Jeielsantosdev`, mesmo autor de todos os commits do repositório — `git log`).
- Antes de abrir o PR: reler o schema real do `apps.json` no repositório oficial (campos podem ter mudado desde a pesquisa original em `docs/research/HACKATHON.md`) e conferir se `logo` espera um path relativo dentro do fork ou uma URL `raw.githubusercontent.com` completa.
