# O que falta para terminar o FirstBite

Estado em 2026-09-14. Checklist completo e mais detalhado em `docs/SUBMISSION.md`.

## ⏸️ Deploy pausado deliberadamente

**Decisão do usuário (2026-09-14): aguardar o resultado do hackathon (anúncio em 28/09/2026) antes de gastar dinheiro no deploy.** Não é mais um bloqueador técnico — é uma escolha estratégica de não investir antes de saber se compensa. Retomar esta seção quando o usuário decidir seguir.

## 🔴 Quando retomar: precisamos de COOK real para fazer o deploy

Sem isso, nada da lista abaixo é possível.

- Custo estimado: ~1,5 COOK (rent-exemption do programa, medido localmente) + um saldo extra para o Sponsor Service pagar as taxas dos claims durante a demo.
- Caminho em andamento: pedir ao time da Cookie Chain via Discord (`discord.gg/dP6EjZeSJW`) ou Telegram (`@TheCookieNetChain`) — outro projeto deste mesmo bounty já conseguiu um "gas drip" assim.
- Não existe faucet oficial da Cookie Chain (confirmado por chamada RPC direta), então essa é a única via sem custo real conhecida.

## Depois que houver fundos, em ordem

1. **Deploy do programa** na Cookie Chain mainnet (`anchor deploy`).
2. **Financiar o Sponsor Service** com uma chave real (nunca reusar as chaves de teste geradas durante o desenvolvimento).
3. **Deploy do frontend** (Vercel), com as variáveis de ambiente de produção configuradas.
4. **Teste manual completo na mainnet real**, com a Nightly de verdade — o mecanismo já foi validado localmente e com a extensão real contra um validador local; falta confirmar contra a chain de produção.
5. **Atualizar o `README.md`** com o Program Address real, a URL da aplicação, e um link de transação real no CookieScan.
6. **Preencher o `apps.json`** no fork do repositório oficial (`cookiechain/superteam-hackathon-submissions`) — falta só o logo 512×512 e screenshots.
7. **Submeter oficialmente**: botão "Submit Now" no listing da Superteam Earn **e** abrir o Pull Request no GitHub (os dois são necessários).
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
