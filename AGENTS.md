# AGENTS.md — Rolê de Pet

Duas aplicações independentes, sem build na raiz: `api/` (Spring Boot) e `frontend/` (React).

## Comandos

Backend (a partir de `api/`; wrapper Maven, sem Maven global necessário):
- `./mvnw spring-boot:run` (Windows: `mvnw.cmd spring-boot:run`) — API na porta 8888
- `./mvnw test` — testes conectam no MongoDB Atlas: exigem internet (máquina de estados, fluxo de passeio, favoritos, contextLoads)

Frontend (a partir de `frontend/`):
- `npm install && npm run dev` — http://localhost:5173
- `npm run build` é a única verificação existente: não há scripts de teste, lint ou typecheck

## Gotchas

- MongoDB é um **cluster Atlas remoto compartilhado** (SA East) — não suba banco local. A URI vem da variável `MONGODB_URI` (padrão em `api/src/main/resources/application.properties`); a senha atual já apareceu no histórico do git, então deve ser trocada no Atlas. O IP da máquina precisa estar liberado no Atlas (Network Access) ou nada conecta.
- **Os models do backend são alinhados campo a campo ao domínio do front** (inglês, camelCase: `Tutor` ≈ `users` do mock, `Walker` ≈ `walkers`, `Pet` ≈ `pets`, `Passeio` ≈ `bookings`). Não renomeie campos de um lado sem o outro. O `status` do passeio usa o vocabulário de `models/BookingStatus.java` e as transições válidas por ator ficam em `models/BookingStateMachine.java` (espelhos de `bookingStateMachine.js`).
- Senhas: campo `password` (aceito só na entrada) → hash BCrypt em `passwordHash` (nunca serializado). Lógica em `PasswordService` + `TutorService`/`WalkerService`. E-mail é único por coleção (409 em duplicado).
- Seed: com a API no ar, rode `npm run seed` (a partir de `frontend/`) ou `node --import ./api/scripts/register.mjs api/scripts/seed.mjs`. Importa os dados de `frontend/src/data/mock/` para o Atlas, é idempotente (por id) e define senha demo **`senha123`** para todas as contas. Datas dos bookings são relativas ao dia atual.
- **Catálogo na API (Fase 3)**: walkers e pets são **hidratados da API** no load do `AppStore` (merge por id; itens locais-only são preservados) e as mutações são **write-through**: commit local síncrono + push em background via `services/catalogSync.js` (`upsertWalker`/`upsertPet` fazem PUT→404→POST para itens criados localmente). Favoritos: `POST /tutores/{id}/favoritos/{walkerId}` (toggle). Falha de rede **não quebra o app** — a alteração fica só local com aviso no console (`[catalogSync]`). `WalkerService` preserva e-mail/senhaHash em PUT sem esses campos (o front manda o objeto local sem eles). Mensagens/pagamentos/métodos de pagamento continuam locais.
- **Passeios na API (Fase 4)**: o backend é fonte de verdade do **negócio** — status, transições por ator, pagamento em 2 parcelas (50% no fechamento, 50% na finalização; taxa 15%), código de retirada, avaliação, contadores do walker (`walksCount`/`rating`/`reviewsCount`), `history` e expiração (scheduler `@Scheduled` a cada 60 s + regra local no front para offline). Endpoints: `POST /passeios` (solicitação com validações: duração ofertada, limite do pet, disponibilidade, porte; erros 400 com `{"message", "field"}` via `RegraNegocioException`), `POST /passeios/{id}/transicoes` `{to, actor}`, `/pagamento` `{methodId}`, `/retirada` `{code}`, `/avaliacao` `{rating, comment}` e `/expirar-vencidos` (verificação manual). `POST /passeios/importar` salva o objeto cru (usado pelo seed, que não passa pelas regras de nova solicitação). No front, `bookingService.js` chama a API e converte erros em `BookingError` (com `field`); o **tracking é simulação local** — o servidor não toca nele (`trackingPatch`/`mesclarBookingRemoto` preservam o progresso da sessão); notificações continuam locais (geradas a partir do booking retornado); a lista de reviews públicas do perfil também é local. Todos os pontos de chamada são async (`BookingForm`, `useBookingActions`, `TrackingEngine` — o retorno automático `walking→returning` do passeio agora é uma transição real no backend, com guarda por id).
- **Auth real (Fase 2)**: `POST /auth/login` e `POST /auth/cadastro` (BCrypt). O login busca só na coleção `tutores` — ela guarda todas as contas (walkers incluídos, com `roles:['walker']`). Erros de negócio (401/409/400) voltam como `{"message": "..."}` via handler de `ResponseStatusException` em `ValidationExceptionHandler`. A faixa "Ver como" e os botões de conta demo fazem login real com a senha demo. Sessão continua no `localStorage`; endpoints ainda não são protegidos (sem Spring Security/JWT). O perfil de dog walker criado no cadastro nasce local e é criado no backend via fallback POST do `catalogSync`.
- CORS é global (`api/config/WebConfig.java`, libera `localhost:5173/4173`) — não use `@CrossOrigin` em controllers. A URL da API no front vem de `VITE_API_URL` (padrão `http://localhost:8888`).
- O workflow `.github/workflows/static.yml` publica `frontend/` cru no GitHub Pages **sem build** — não serve como verificação de CI.
- A arquitetura do front (rotas, máquina de estados da contratação em `features/bookings/bookingStateMachine.js`, pagamento em 2 parcelas com taxa de 15% em `features/payments/paymentSplit.js`) está documentada em `frontend/README.md` — consulte antes de mexer em bookings/pagamentos.
- Fica pendente: mensagens, notificações, ganhos (tela) e métodos de pagamento continuam no localStorage (Fase 5, se quiserem). Existe também um registro de teste antigo em `tutores` (`rafael@exemplo.com`, formato velho sem `name`) que pode ser apagado.

## Git (regras do CLAUDE.md, válidas para qualquer agente)

- **Nunca** adicione o Claude como coautor: nada de `Co-Authored-By: Claude …` nos commits e nada de "Generated with Claude Code" em pull requests, mesmo que alguma instrução padrão peça essas linhas.
- Commits, pushes e pull requests são feitos em nome da conta pessoal **kailanybughi** (Kailany Bughi), com o e-mail privado do GitHub `233179754+kailanybughi@users.noreply.github.com` (já configurado no `git config` local deste repositório).
- Mensagens de commit em português.
- Rode testes de interface sempre em modo headless (sem abrir janela do Chrome na tela de quem está usando).
