# Mensagem para pedir COOK de teste ao time da Cookie Chain

Enviar via Discord oficial (`discord.gg/dP6EjZeSJW`) ou Telegram (`@TheCookieNetChain`). Ajustar `[endereço da wallet]` antes de enviar — use o endereço público da sua wallet Nightly na Cookie Chain (nunca a chave privada).

---

Hey! I'm building **FirstBite** for the "Create an App on Cookie Chain" bounty (Superteam Earn) — an onboarding tool that lets a COOK holder create a shareable link/QR ("Bite"), so someone with a genuinely zero-balance wallet can claim COOK with the network fee sponsored, no bridge required first.

The program is fully built and tested (Anchor program with 11/11 passing tests, reviewed twice for security, no critical findings), and the sponsored-claim mechanism is already validated end-to-end with the real Nightly extension against a local validator — a wallet starting at 0 SOL signed and received COOK without paying any fee.

The only thing blocking a real mainnet deploy is COOK to cover the program's rent-exemption (~1.5-2 COOK, measured directly) and a small amount to fund the sponsor wallet that pays claim fees during the demo (each claim costs ~0.0014 COOK, so even 1-2 COOK covers hundreds of test claims). I saw another submission (Cookie Jar) mention getting a similar test-gas drip from the team — would it be possible to get something similar?

Deploy authority address: `DMNxQCK5SgBSv3nanLnSAEYDjGGZLuUYAzJSEVPMnp8C`
GitHub: https://github.com/Astreus-J/FirstBite

Happy to share more details about the project if useful. Thanks!

---

## Observações antes de enviar

- Cole o endereço público da wallet real (a que vai efetivamente pagar o deploy — pode ser uma wallet nova sua, dedicada a isso).
- Se preferir, simplifique/encurte a mensagem — o essencial é: o que é o projeto, que está pronto e testado, e que falta só COOK pro deploy.
- Não compartilhe chave privada em nenhuma hipótese — só o endereço público.
