# FirstBite — X Thread (rascunho para publicação)

Estrutura baseada em `docs/research/PITCH_RESEARCH.md` §5. Preencher `[link]`, `[GIF/vídeo]` e `[@handle]` antes de publicar. Revisar contra o estado real do produto no dia da publicação (não publicar promessas do roadmap como se já existissem).

---

**1/**
Getting onto a blockchain shouldn't start with a bridge.

Here's a wallet with 0 $COOK receiving tokens — no bridge, no CEX, no pre-funding, no asking anyone for gas.

🧵

[GIF/vídeo: saldo 0 → saldo > 0 na tela de claim]

---

**2/**
Cookie Chain has no public faucet.

A brand-new wallet can't pay the fee for its own first transaction — which means it can't do *anything* on-chain, not even receive tokens someone else sends it.

That's not a hypothetical. Another builder in this same hackathon had to wait on a manual "gas drip" from the sponsor team just to demo their own app.

---

**3/**
FirstBite turns that wall into a link.

1. Someone who already holds COOK creates a "Bite" — deposits COOK into an on-chain vault.
2. They get a shareable link / QR code.
3. They send it to someone who's never touched Cookie Chain.

---

**4/**
The receiver opens the link, connects Nightly, and clicks Claim.

The network fee for that claim is paid by our Sponsor Service — not by the new wallet.

Zero to active Cookie Chain wallet, in one signature.

---

**5/**
[GIF/vídeo: fluxo completo — create → QR → claim → confirmed]

This is real, not simulated. We tested this exact mechanism with the actual Nightly browser extension: a wallet holding 0 SOL signed a transaction where a *different* account paid the fee, and walked away holding COOK.

---

**6/**
Under the hood: an Anchor program holds each Bite's deposit in its own PDA. Claiming creates a small on-chain record that makes double-claiming impossible by construction — not just checked, structurally prevented.

Our Sponsor Service never signs a transaction handed to it by the browser. It reads the Bite's on-chain state itself, builds the claim instruction, and only then signs as fee payer — same pattern production gasless-tx services like Octane use.

---

**7/**
This isn't a faucet. A faucet is the protocol handing out free tokens to anyone.

FirstBite is peer-to-peer: someone already active on Cookie Chain chooses to sponsor a specific person's entry. Closer to an invite than a giveaway.

---

**8/**
We looked hard for this exact combo already existing in the ecosystem — pull-based claim + zero-balance start + auto-sponsored fee, in one link.

Pieces of it exist separately across other builders. The full combination doesn't, as far as we could find.

---

**9/**
Being honest about what's still open: Sybil resistance across wallets and the long-term sponsorship funding model are real open questions, not solved problems. That's roadmap, not this weekend's build.

---

**10/**
Try it: [link]
Code: [github link]
Built for Create an App on Cookie Chain (@SuperteamEarn × Cookie Chain).

---

**11/** (reply-bookmark)
FirstBite: give someone their first 🍪 on Cookie Chain, with one link. ⬆️
