# Rolê de Pet — protótipo navegável

Protótipo front-end completo de uma plataforma brasileira que conecta tutores de cães a dog walkers: busca, perfil do profissional, solicitação, aceite, pagamento simulado em duas parcelas, acompanhamento ao vivo simulado, avaliação e ganhos do dog walker.

> **Tudo é simulado.** Não há backend. Autenticação, pagamentos, verificações, localização e notificações são demonstrativos. Nenhuma senha ou dado de cartão é armazenado.

## Como rodar

O front-end fica na pasta `frontend/` do repositório (a raiz é reservada ao back-end Spring Boot + MongoDB).

```bash
cd frontend
npm install
npm run dev      # http://localhost:5173
npm run build    # gera dist/
npm run preview  # serve o build
```

Requer Node 20+. Stack: React 19 (JavaScript/JSX, sem TypeScript), Vite 8, Tailwind CSS 4, React Router 7, Lucide React, Leaflet + React Leaflet (mapas com tiles do OpenStreetMap).

## Roteiro rápido de demonstração

No topo de todas as páginas há a faixa **Protótipo · Ver como: Tutor | Dog walker**. Ela troca o app inteiro de ponto de vista, entrando na conta demonstrativa de cada lado (não há backend):

- **Tutor → Marina Costa**: 3 pets, passeio ao vivo do Thor, pagamentos e avaliações pendentes.
- **Dog walker → Lucas Andrade**: o mesmo passeio do Thor em andamento visto pelo lado dele, agenda do dia, solicitações novas, mensagens e ganhos.

Roteiro dos cenários:

1. **Cenário A** — como Tutor: Início → buscar → filtros → abrir um perfil → escolher pet, data, horário e duração → *Solicitar passeio* → aparece em **Passeios › Próximos**.
2. **Cenário B** — clique em **Dog walker** na faixa do topo (ou, no diálogo de sucesso, *Entrar como Lucas (dog walker)*). Em **Solicitações**, abrir, ler o perfil de segurança do pet, marcar a confirmação de leitura e **Aceitar**.
3. **Cenário C** — volte para **Tutor** → *Pagar e confirmar* → como **Dog walker**: *Estou a caminho* → *Cheguei* (código de retirada exibido ao tutor) → *Iniciar passeio* → como **Tutor**, acompanhe em `/tutor/acompanhar/:id` (1 s real = 1 min simulado; volta automaticamente aos 60 % da rota) → como **Dog walker**, *Finalizar passeio*. O painel “Simulação” nas telas de acompanhamento e de detalhe também avança as etapas.
4. **Cenário D** — como Dog walker, **Ganhos** mostra as duas parcelas de cada passeio (bruto, taxa de 15 % e líquido): a 1ª liberada quando o tutor pagou e a 2ª quando o passeio foi finalizado. Como Tutor, avaliar o passeio concluído (a avaliação não altera o pagamento).
5. **Cenário E** — cadastrar/editar pet, favoritar, trocar mensagens (resposta simulada em ~2 s), bloquear horários na **Agenda** do dog walker, trocar de visão e recarregar a página: tudo persiste.

Menu da conta → **Restaurar dados de demonstração** volta ao estado inicial.

### Contas demonstrativas

Qualquer senha com 6+ caracteres. Na tela **Entrar** há as abas *Sou tutor* / *Sou dog walker*.

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
| | `/entrar`, `/cadastrar` | Autenticação simulada |
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
  services/       Regras de domínio puras: booking, payment, tracking, availability, search, pricing, auth, pet, message, walker, notification
  features/       Lógica e componentes por domínio (bookings, tracking, discovery, messages, payments, reviews, pets, walkers, help)
  components/     UI reutilizável: common, forms, cards, maps, navigation, feedback
  pages/          public/, owner/, walker/
  hooks/          useAccount, useBookings, useIndicators
  utils/          constants, format (BRL, números), dates (pt-BR), storage
  styles/         Design tokens (Tailwind @theme) e estilos globais
```

### Máquina de estados da contratação

`src/features/bookings/bookingStateMachine.js` centraliza status, rótulos e transições permitidas **por ator** (`owner`, `walker`, `system`):

```
requested → accepted → paid → on_the_way → picked_up → walking → returning → completed → reviewed
     ↘ declined / expired / canceled (conforme a etapa)
```

Toda mudança passa por `transitionBooking()` (`services/bookingService.js`), que valida a transição, atualiza pagamento/rastreamento e gera notificações. Exemplos de regras: pagar só após aceite; retirada exige o código de 4 dígitos; avaliar só passeios concluídos.

### Pagamento em duas parcelas

Regra central em `src/features/payments/paymentSplit.js` (valores líquidos, já descontada a taxa de 15 %):

| Momento | Dog walker recebe | Status do pagamento |
|---|---|---|
| Tutor paga (passeio fechado) | 50 % | `partial` |
| Dog walker finaliza o passeio | os outros 50 % | `released` |
| Tutor cancela depois de pagar | fica com os 50 % já repassados; a metade retida volta ao tutor | `partially_refunded` |
| Dog walker cancela depois do pagamento | nada; estorno integral ao tutor | `refunded` |

A avaliação é independente do pagamento.

### Estado e persistência

- `AppStoreProvider` mantém `data` (o “banco” do protótipo) e `session` (`userId`, `mode`). O perfil de dog walker é sempre o da conta conectada (`user.walkerProfileId`).
- As ações chamam funções puras `(state) => state` dos serviços. Erros de regra de negócio sobem como exceções com mensagem em pt-BR.
- `localStorage`: `roledepet:estado:v1` (dados, gravação com debounce) e `roledepet:sessao:v1` (sessão). Senhas nunca são gravadas. Se a versão do seed mudar, os dados são recriados.
- `TrackingEngine` avança a simulação a cada segundo apenas enquanto houver passeio em movimento.
- O modo (`data-mode` no `<html>`) troca o token `--accent`: vinho no modo tutor, dourado (com texto escuro) no modo dog walker.

### Dados simulados

16 dog walkers em bairros de São Paulo, 5 contas, 8 pets com perfis completos de segurança, 20 contratações cobrindo todos os status (inclusive um passeio ao vivo), avaliações vinculadas a passeios concluídos, conversas e notificações. Preços e ganhos são derivados da tabela de preços de cada profissional (`services/pricing.js`), com taxa de 15 % (`PLATFORM_FEE_RATE`). Datas são relativas ao dia atual para a demonstração sempre fazer sentido.

### O que é simulado

| Recurso | No protótipo | Em produção |
|---|---|---|
| Autenticação | Busca por e-mail nas contas locais | Provedor de identidade |
| Pagamento em duas parcelas | Mudança de status | Provedor com split de pagamento |
| Rastreamento | Interpolação em rota predefinida | GPS do aparelho + tempo real, com consentimento e retenção limitada (LGPD) |
| Mensagens/notificações | Estado local + resposta automática | WebSocket + push |
| Verificação | “Em análise” sem aprovação automática | Verificação de identidade e antecedentes (sujeita a análise jurídica) |
| Ajuda/emergência | Fluxo demonstrativo; não contata ninguém | Central de suporte |
| Link de acompanhamento | URL demonstrativa sem coordenadas | Token temporário com controle de acesso |

## Limitações conhecidas

- Sem backend: dois navegadores não compartilham estado; tutor e dog walker são demonstrados no mesmo navegador, trocando de conta pela faixa *Ver como*.
- Fotos vêm de CDNs públicos (Unsplash, randomuser.me) e os mapas usam os tiles públicos do OpenStreetMap, que exigem internet e têm política de uso limitada — em produção, trocar por um provedor comercial (`components/maps/BaseMap.jsx`). Há fallback visual para imagens.
- O passeio b15 fica em “Avaliado” de propósito, para demonstrar o estado de liberação em processamento.
- O tempo do passeio é acelerado (1 s = 1 min).
- Textos jurídicos são ilustrativos.

## Próximos passos no Claude Code

1. Substituir `context/AppStore.jsx` + `services/*` por chamadas a uma API mantendo as mesmas assinaturas (as funções de serviço já recebem/retornam objetos de domínio).
2. Mover `bookingStateMachine.js` e `bookingService.js` para o backend como fonte da verdade; o front passa a só exibir as transições permitidas.
3. Integrar autenticação real, provedor de pagamentos, mapas/rotas comerciais e canal em tempo real para localização e mensagens.
4. Upload de imagens para armazenamento em nuvem (hoje, presets/URL).
5. Testes: unitários para `bookingStateMachine`, `bookingService`, `availabilityService` e `searchService`; e2e (Playwright) para os cenários A–E.
