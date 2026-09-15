# O que falta para terminar o FirstBite

Estado em 2026-09-15. Checklist completo e mais detalhado em `docs/SUBMISSION.md`.

## 🔴 Bloqueador ativo: conseguir COOK sem custo

O usuário não tem dinheiro disponível para comprar COOK agora (tentamos o caminho de compra via Pix/exchange + Jupiter + bridge, mas não é viável no momento). **Caminho ativo: pedir COOK ao time da Cookie Chain**, via Discord (`discord.gg/dP6EjZeSJW`) ou Telegram (`@TheCookieNetChain`) — outro projeto deste mesmo bounty (Cookie Jar) já conseguiu um "gas drip" assim. Mensagem pronta em `docs/COOK_REQUEST_MESSAGE.md`, só falta o usuário enviar (é uma ação pública em nome dele, não pode ser feita por mim).

Duas wallets já geradas no ambiente local, aguardando fundos:
- Deploy authority: `DMNxQCK5SgBSv3nanLnSAEYDjGGZLuUYAzJSEVPMnp8C`
- Sponsor: `BA7ZPff3xTPmw9SLHLifNhW8rp4FzUvq3KhNZQKwJ62Q`

Custo necessário: ~1,5-2 COOK para o deploy (rent-exemption, medido localmente) + ~1-2 COOK para o Sponsor Service (cobre centenas de claims de demo, já que cada um custa ~0,0014 COOK). Não existe faucet oficial da Cookie Chain (confirmado por chamada RPC direta), e não existe devnet/testnet (confirmado na documentação oficial) — pedir ao time é a única via sem custo real conhecida.

## Depois que houver fundos, em ordem

1. **Deploy do programa** na Cookie Chain mainnet (`anchor deploy`).
2. **Financiar o Sponsor Service** com uma chave real (nunca reusar as chaves de teste geradas durante o desenvolvimento).
3. ~~Deploy do frontend (Vercel)~~ — **DONE**, já no ar em `https://first-bite-seven.vercel.app/`. Falta configurar as variáveis de ambiente de produção apontando para o programa real assim que ele existir.
4. **Teste manual completo na mainnet real**, com a Nightly de verdade — o mecanismo já foi validado localmente e com a extensão real contra um validador local; falta confirmar contra a chain de produção.
5. **Atualizar o `README.md`** com o Program Address real e um link de transação real no CookieScan (a URL da aplicação já foi atualizada).
6. **Abrir o PR com o `apps.json`** no fork do repositório oficial (`cookiechain/superteam-hackathon-submissions`) — rascunho completo em `docs/APPS_JSON_DRAFT.md` (logo e `links.website` já preenchidos); falta só os screenshots reais, que dependem do fluxo funcionando de ponta a ponta.
7. **Submeter oficialmente**: botão "Submit Now" no listing da Superteam Earn **e** abrir o Pull Request no GitHub (os dois são necessários). Campos reais do formulário confirmados em `docs/SUBMISSION.md` — não existe campo de "pitch" nem "demo"; existe um campo **obrigatório** de "Relevant program, contract, token, or application addresses", o que confirma que o deploy do programa é bloqueador formal de submissão.
8. **Publicar a X thread** (`docs/X_THREAD.md`) — falta gravar o GIF/vídeo do fluxo completo e preencher os links reais.
9. **Reler o bounty do zero** no dia da submissão — as regras podem ter mudado.

## Já está pronto (não depende de dinheiro)

- Programa Anchor implementado e testado (11/11 testes), revisado duas vezes por segurança (nenhuma vulnerabilidade crítica encontrada).
- Frontend completo: criar Bite, reivindicar com taxa patrocinada, histórico do creator.
- Mecanismo de sponsorship validado com a extensão Nightly real (não só simulado).
- Design/UX revisado: paleta própria, hero, tela de claim com card que muda de cor ao confirmar, responsivo em mobile — testado sem erros de console.
- CI configurado no GitHub Actions.
- README, materiais de pitch (tagline, elevator pitch, 60s, 2min, FAQ para jurados) e rascunho da X thread escritos.
- Repositório público no GitHub com todo o histórico de GitFlow: https://github.com/Astreus-J/FirstBite
- Logo 512×512 (`media/logo-512.png`) e favicon do site atualizados para a marca própria (cookie com uma mordida, cores do design system).
- Rascunho completo da entrada `apps.json` pronto em `docs/APPS_JSON_DRAFT.md`, schema confirmado contra o repositório oficial real (só faltam os screenshots, que dependem do fluxo funcionando de ponta a ponta).
- Frontend implantado ao vivo: `https://first-bite-seven.vercel.app/`.
- Campos reais do formulário "Submit Now" da Superteam Earn confirmados por print (`docs/SUBMISSION.md`).
