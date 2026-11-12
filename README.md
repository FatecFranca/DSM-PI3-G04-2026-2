# Rolê de Pet

Plataforma brasileira que conecta tutores de cães a dog walkers: busca com filtros, perfil do profissional, solicitação, aceite, pagamento em duas parcelas, acompanhamento ao vivo, avaliação e ganhos do dog walker.

Duas aplicações independentes, sem build na raiz:

| Pasta | App | Stack |
|---|---|---|
| `api/` | API REST (porta 8888) | Java 25, Spring Boot 4.1.2, MongoDB (cluster Atlas remoto) |
| `frontend/` | App web (porta 5173) | React 19 (JSX, sem TypeScript), Vite 8, Tailwind CSS 4, React Router 7, Leaflet |

## Como rodar

### 1. API (a partir de `api/`)

```bash
cd api
mvnw.cmd spring-boot:run    # Windows (Linux/macOS: ./mvnw spring-boot:run)
```

- A URI do MongoDB vem da variável de ambiente `MONGODB_URI` (padrão em `api/src/main/resources/application.properties`).
- O banco é um **cluster Atlas remoto**: exige internet e o IP da máquina liberado no Network Access do Atlas — sem isso nada conecta.
- Verificação: `mvnw.cmd test` (os testes conectam no Atlas real).

### 2. Frontend (a partir de `frontend/`)

```bash
cd frontend
npm install
npm run dev      # http://localhost:5173
```

- A URL da API vem de `VITE_API_URL` (padrão `http://localhost:8888`).
- Verificação disponível: `npm run build` (não há scripts de teste/lint no front).

### 3. Seed de demonstração

Com a API no ar:

```bash
cd frontend
npm run seed
```

Importa os dados de demonstração (`frontend/src/data/mock/`) para o Atlas: 20 contas, 16 dog walkers, 8 pets e 20 passeios. É idempotente (por id) e as datas dos passeios são relativas ao dia atual, então reseedar renova a demonstração.

## Contas demonstrativas

Senha de todas: **`senha123`** (login real via `POST /auth/login`).

| Conta | Perfil |
|---|---|
| `marina@roledepet.demo` | Tutora (Thor, Mel, Bidu) |
| `rafael@roledepet.demo` | Tutor (Luna, Bob) |
| `lucas@roledepet.demo` | Dog walker (conta dupla com alternância de modo) |
| `nome.sobrenome@roledepet.demo` | Cada um dos outros dog walkers |

## O que é real × o que é simulado

**Real (persistido no Atlas via API):**
- Autenticação (e-mail + senha com BCrypt; sem JWT/Spring Security ainda — endpoints abertos).
- Catálogo: walkers e pets, com edições persistindo (favoritos, agenda, bloqueios, preços).
- Ciclo completo do passeio: máquina de estados validada por ator no servidor (`BookingStateMachine.java`), pagamento em 2 parcelas (50 % no fechamento, 50 % na finalização, taxa de 15 %), código de retirada de 4 dígitos, avaliação (atualiza a nota do walker), expiração automática de solicitações.

**Simulado (local, por enquanto):**
- Rastreamento do passeio (interpolação em rota predefinida, 1 s = 1 min).
- Mensagens (com resposta automática), notificações, métodos de pagamento e tela de ganhos.
- Verificação de identidade/antecedentes ("Em análise" sem aprovação).

## Documentação

- **`frontend/README.md`** — arquitetura do front: rotas, máquina de estados, cenários de demonstração (A–E) e detalhes de implementação.
- **`AGENTS.md`** — instruções e gotchas para agentes de IA trabalhando neste repositório.
