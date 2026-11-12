# Rolê de Pet — frontend

Front-end completo de uma plataforma brasileira que conecta tutores de cães a dog walkers: busca, perfil do profissional, solicitação, aceite, pagamento em duas parcelas, acompanhamento ao vivo simulado, avaliação e ganhos do dog walker.

> **Integrado à API real (Spring Boot + MongoDB Atlas).** Autenticação, catálogo (walkers/pets) e o ciclo completo do passeio (transições, pagamento em 2 parcelas, código de retirada, avaliação, expiração) são validados e persistidos no servidor. Continuam simulados localmente: rastreamento (1 s = 1 min), mensagens, notificações e métodos de pagamento. Nenhum dado de cartão é armazenado.

## Como rodar

A API precisa estar no ar antes de usar o app (porta 8888):

```bash
cd api
mvnw.cmd spring-boot:run    # Windows (Linux/macOS: ./mvnw spring-boot:run)
```

O banco é um cluster Atlas remoto — exige internet e o IP liberado no Atlas. A URI vem de `MONGODB_URI` (padrão em `api/src/main/resources/application.properties`). Com a API no ar, rode o seed (`npm run seed`) na primeira vez para popular os dados de demonstração.

O front-end fica na pasta `frontend/` do repositório:

```bash
cd frontend
npm install
npm run seed      # importa os dados de demonstração (API precisa estar no ar)
npm run dev      # http://localhost:5173
npm run build    # gera dist/
npm run preview  # serve o build
```

Requer Node 20+. Stack: React 19 (JavaScript/JSX, sem TypeScript), Vite 8, Tailwind CSS 4, React Router 7, Lucide React, Leaflet + React Leaflet (mapas com tiles do OpenStreetMap). A URL da API vem de `VITE_API_URL` (padrão `http://localhost:8888`).

## Roteiro rápido de demonstração

No topo de todas as páginas há a faixa **Protótipo · Ver como: Tutor | Dog walker**. Ela troca o app inteiro de ponto de vista, fazendo **login real** na conta demonstrativa de cada lado (senha demo `senha123`):

- **Tutor → Marina Costa**: 3 pets, passeio ao vivo do Thor, pagamentos e avaliações pendentes.
- **Dog walker → Lucas Andrade**: o mesmo passeio do Thor em andamento visto pelo lado dele, agenda do dia, solicitações novas, mensagens e ganhos.

Roteiro dos cenários (todas as transições de status, pagamento e avaliação são validadas e persistidas no backend):

1. **Cenário A** — como Tutor: Início → buscar → filtros → abrir um perfil → escolher pet, data, horário e duração → *Solicitar passeio* (validado no servidor: duração ofertada, limite do pet, disponibilidade e porte; nasce com código de retirada) → aparece em **Passeios › Próximos**.
2. **Cenário B** — clique em **Dog walker** na faixa do topo (ou, no diálogo de sucesso, *Entrar como Lucas (dog walker)*). Em **Solicitações**, abrir, ler o perfil de segurança do pet, marcar a confirmação de leitura e **Aceitar** (o servidor recusa transições inválidas por ator).
3. **Cenário C** — volte para **Tutor** → *Pagar e confirmar* (a 1ª parcela de 50 % é liberada ao walker) → como **Dog walker**: *Estou a caminho* → *Cheguei* (código de retirada exibido ao tutor; código errado é recusado com 400) → *Iniciar passeio* → como **Tutor**, acompanhe em `/tutor/acompanhar/:id` (1 s real = 1 min simulado; a volta automática aos 60 % da rota é uma transição real no backend) → como **Dog walker**, *Finalizar passeio* (a 2ª parcela é liberada). O painel “Simulação” nas telas de acompanhamento e de detalhe também avança as etapas.
4. **Cenário D** — como Dog walker, **Ganhos** mostra as duas parcelas de cada passeio (bruto, taxa de 15 % e líquido): a 1ª liberada quando o tutor pagou e a 2ª quando o passeio foi finalizado (contadores e nota do walker são persistidos no Atlas). Como Tutor, avaliar o passeio concluído (a avaliação não altera o pagamento).
5. **Cenário E** — cadastrar/editar pet, favoritar, trocar mensagens (resposta simulada em ~2 s), bloquear horários na **Agenda** do dog walker, trocar de visão e recarregar a página: contas, catálogo, favoritos e passeios persistem no Atlas; mensagens e notificações persistem no localStorage.

Menu da conta → **Restaurar dados de demonstração** volta ao estado inicial (dados locais recriados; o que já foi persistido no Atlas permanece).

### Contas demonstrativas

Senha de todas: **`senha123`** (login real via `POST /auth/login`; senha errada mostra “E-mail ou senha incorretos.”). Na tela **Entrar** há as abas *Sou tutor* / *Sou dog walker*.

| Conta | Perfil |
|---|---|
| `marina@roledepet.demo` | Tutora (Thor, Mel, Bidu) |
| `rafael@roledepet.demo` | Tutor (Luna, Bob) |
| `lucas@roledepet.demo` | Dog walker (também pode contratar passeios — conta dupla com alternância de modo) |
| `beatriz.nogueira@roledepet.demo`, `rafael.moreira@roledepet.demo`, … | Cada um dos 16 dog walkers tem a própria conta (`nome.sobrenome@roledepet.demo`) |

Um tutor que escolhe **Quero ser dog walker** no menu ganha um perfil profissional novo, ainda fora da busca até completar bio e disponibilidade.

## Rotas

| Área | Rota | Página |
|---|---|---|
| Pública | `/` | Página inicial (busca Onde/Quando/Quem, carrosséis, categorias, faixa de confiança) |
| | `/buscar` | Resultados com filtros, ordenação, lista + mapa (parâmetros na URL) |
| | `/dog-walkers/:walkerId` | Perfil público + contratação (card fixo no desktop, painel inferior no celular) |
| | `/como-funciona`, `/seguranca`, `/seja-dog-walker`, `/ajuda` | Páginas institucionais |
| | `/entrar`, `/cadastrar` | Autenticação real (API + BCrypt) |
| | `/cancelamentos`, `/termos`, `/privacidade`, `/indicar`, `/planos`, `/cartao-presente` | Apoio e prévias de funcionalidades futuras |
| Tutor | `/tutor` | Início personalizado |
| | `/tutor/passeios?aba=proximos\|ao-vivo\|concluidos` | Passeios |
| | `/tutor/passeios/:bookingId` | Detalhe, linha do tempo, código de retirada, pagamento, avaliação |
| | `/tutor/acompanhar/:bookingId` | Acompanhamento ao vivo (tela cheia) |
| | `/tutor/favoritos`, `/tutor/mensagens(/:id)` | Favoritos e mensagens |
| | `/tutor/pets`, `/tutor/pets/novo`, `/tutor/pets/:petId(/editar)` | Meus pets |
| | `/tutor/perfil` | Dados, pagamentos, contatos de emergência, configurações |
| Dog walker | `/dog-walker/hoje` | Operação do dia |
| | `/dog-walker/agenda` | Calendário, bloqueios e disponibilidade semanal |
| | `/dog-walker/solicitacoes(/:bookingId)` | Análise e aceite/recusa |
| | `/dog-walker/passeio/:bookingId` | Tela operacional do passeio (tela cheia) |
| | `/dog-walker/mensagens(/:id)`, `/dog-walker/ganhos`, `/dog-walker/perfil` | Mensagens, ganhos, perfil público e verificação |

As áreas `/tutor` e `/dog-walker` exigem login (redirecionam para `/entrar?voltar=…`) e ajustam o modo automaticamente quando acessadas por link direto (ex.: notificações).

## Identidade visual

A logo oficial fica em `public/brand/` (extraída com fundo transparente): `logo-full.png` (versão empilhada, usada nas telas de entrada/cadastro), `mark.png` (símbolo do cão com a guia), `wordmark.png` (nome) e os ícones `favicon-64.png` / `icon-192.png`. O componente `components/common/Logo.jsx` monta a versão horizontal do cabeçalho.

## Arquitetura

```
frontend/src/
  app/            App, router (rotas com code-splitting), layouts (Public, App, Fullscreen)
  context/        AppStore — estado único, sessão, ações e persistência
  data/mock/      Repositórios de dados simulados (walkers, users, pets, bookings, reviews, conversations, notifications, paymentMethods)
  services/       Chamadas à API + regras locais: booking (API + validação instantânea), catalogSync (write-through do catálogo), auth, payment, tracking, availability, search, pricing, pet, message, walker, notification
  features/       Lógica e componentes por domínio (bookings, tracking, discovery, messages, payments, reviews, pets, walkers, help)
  components/     UI reutilizável: common, forms, cards, maps, navigation, feedback
  pages/          public/, owner/, walker/
  hooks/          useAccount, useBookings, useIndicators
  utils/          constants, format (BRL, números), dates (pt-BR), storage
  styles/         Design tokens (Tailwind @theme) e estilos globais
```

### Máquina de estados da contratação

A fonte de verdade é o **backend**: `api/src/main/java/br/edu/fatecfranca/api/models/BookingStateMachine.java` espelha `src/features/bookings/bookingStateMachine.js` (status, rótulos e transições permitidas **por ator** — `owner`, `walker`, `system`):

```
requested → accepted → paid → on_the_way → picked_up → walking → returning → completed → reviewed
     ↘ declined / expired / canceled (conforme a etapa)
```

No front, o `bookingStateMachine.js` continua como espelho para rótulos, agrupamentos e botões de próxima ação. Toda mudança de status passa pela API (`POST /passeios/{id}/transicoes` com `{to, actor}` ou endpoints dedicados `/pagamento`, `/retirada`, `/avaliacao`), que valida a transição, aplica os efeitos de pagamento/contadores e devolve o passeio atualizado. Exemplos de regras: pagar só após aceite; retirada exige o código de 4 dígitos; avaliar só passeios concluídos; owner não conduz etapas operacionais.

### Pagamento em duas parcelas

Regra central aplicada **no backend** (`PasseioService`), espelhada no front por `src/features/payments/paymentSplit.js` (valores líquidos, já descontada a taxa de 15 %):

| Momento | Dog walker recebe | Status do pagamento |
|---|---|---|
| Tutor paga (passeio fechado) | 50 % | `partial` |
| Dog walker finaliza o passeio | os outros 50 % | `released` |
| Tutor cancela depois de pagar | fica com os 50 % já repassados; a metade retida volta ao tutor | `partially_refunded` |
| Dog walker cancela depois do pagamento | nada; estorno integral ao tutor | `refunded` |

A avaliação é independente do pagamento.

### Estado e persistência

- `AppStoreProvider` mantém `data` (estado de trabalho, persistido no `localStorage`) e `session` (`userId`, `mode`). O perfil de dog walker é sempre o da conta conectada (`user.walkerProfileId`).
- **Divisão de responsabilidade (Fases 2–4):** contas, walkers, pets e passeios vivem no **Atlas** e são hidratados da API no load (merge por id; itens locais-only são preservados). O backend é fonte de verdade do **negócio** do passeio (status, transições, pagamento, avaliação, contadores); o front mantém o **tracking simulado** (o servidor não o toca — `trackingPatch`/`mesclarBookingRemoto` preservam o progresso da sessão) e as **notificações locais** (geradas a partir do passeio retornado).
- Ações de catálogo são *write-through*: commit local síncrono + push em background via `services/catalogSync.js`; falha de rede não quebra o app (a alteração fica só local). Ações de passeio são chamadas diretas à API (`bookingService.js`), com erros convertidos em `BookingError` (mensagem pt-BR + `field` para o formulário).
- `localStorage`: `roledepet:estado:v1` (dados de trabalho, gravação com debounce) e `roledepet:sessao:v1` (sessão). Senhas nunca são gravadas.
- `TrackingEngine` avança a simulação a cada segundo apenas enquanto houver passeio em movimento; a volta automática aos 60 % da rota (`walking → returning`) é uma transição real validada no servidor.
- O modo (`data-mode` no `<html>`) troca o token `--accent`: vinho no modo tutor, dourado (com texto escuro) no modo dog walker.

### Dados de demonstração

O seed (`npm run seed`, com a API no ar) importa para o Atlas: 16 dog walkers em bairros de São Paulo, 5 contas (senha demo `senha123`), 8 pets com perfis completos de segurança, 20 contratações cobrindo todos os status (inclusive um passeio ao vivo) — as datas são relativas ao dia atual para a demonstração sempre fazer sentido. Avaliações públicas, conversas e notificações continuam geradas no estado local. Preços e ganhos são derivados da tabela de preços de cada profissional (`services/pricing.js`), com taxa de 15 % (`PLATFORM_FEE_RATE`, espelhada em `PasseioService`).

### O que é simulado

| Recurso | No app | Em produção |
|---|---|---|
| Autenticação | Real (BCrypt no backend), sem JWT — endpoints abertos | Provedor de identidade + tokens de sessão |
| Pagamento em duas parcelas | Regra de status no backend; processadora simulada | Provedor com split de pagamento |
| Rastreamento | Interpolação em rota predefinida | GPS do aparelho + tempo real, com consentimento e retenção limitada (LGPD) |
| Mensagens/notificações | Estado local + resposta automática | WebSocket + push |
| Verificação | “Em análise” sem aprovação automática | Verificação de identidade e antecedentes (sujeita a análise jurídica) |
| Ajuda/emergência | Fluxo demonstrativo; não contata ninguém | Central de suporte |
| Link de acompanhamento | URL demonstrativa sem coordenadas | Token temporário com controle de acesso |~

## Limitações conhecidas

- Endpoints da API não são protegidos ainda (sem Spring Security/JWT) — a sessão vive no `localStorage` e qualquer um pode chamar a API diretamente.
- O rastreamento é simulação visual no cliente; o servidor não audita posições (aqui seria GPS com consentimento e retenção limitada).
- Mensagens, notificações, métodos de pagamento e a lista de avaliações públicas do perfil ficam no `localStorage` — dois navegadores não compartilham essas partes (catálogo e passeios, sim, via Atlas).
- Fotos vêm de CDNs públicos (Unsplash, randomuser.me) e os mapas usam os tiles públicos do OpenStreetMap, que exigem internet e têm política de uso limitada — em produção, trocar por um provedor comercial (`components/maps/BaseMap.jsx`). Há fallback visual para imagens.
- O passeio b15 fica em “Avaliado” de propósito, para demonstrar o estado de liberação em processamento.
- O tempo do passeio é acelerado (1 s = 1 min).
- Textos jurídicos são ilustrativos.
- A senha do MongoDB Atlas já apareceu no histórico do git e deve ser rotacionada (ver `AGENTS.md`).

## Próximos passos

1. Proteger os endpoints (Spring Security + JWT) e amarrar o `ownerId`/`walkerId` das ações à conta autenticada.
2. Fase 5 — mover para a API o que ainda é local: mensagens, notificações, métodos de pagamento e avaliações públicas.
3. Rotação da senha do Atlas (vazou no histórico do git).
4. Provedor real de pagamento com split, GPS real com consentimento (LGPD), upload de imagens para nuvem (hoje, presets/URL) e mapas/rotas comerciais.
5. Testes: unitários (backend já tem; cobrir `availabilityService` e `searchService` do front) e e2e (Playwright, headless) para os cenários A–E.
