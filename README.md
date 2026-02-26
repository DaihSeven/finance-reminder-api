# 💰 Finance Reminder API — V2


[![GitHub](https://img.shields.io/badge/GitHub-DaihSeven-181717?style=flat&logo=github)](https://github.com/DaihSeven)
[![Docker Hub](https://img.shields.io/badge/Docker%20Hub-daihseven-2496ED?style=flat&logo=docker&logoColor=white)](https://hub.docker.com/r/daihseven/finance-reminder)

> API RESTful para gerenciamento de contas a pagar com notificações automáticas de vencimento.

Versão 1 do projeto desenvolvido no **CodeLab — Programadores do Amanhã**, esta versão aprimorada após.
Sprint de 10 dias · Projeto incremental: Lógica → Backend → Frontend

---

## 🚀 Links

| | |
|--|--|
| 🌐 API | https://finance-reminder-api.onrender.com |
| 📑 Swagger | https://finance-reminder-api.onrender.com/docs |
| 🐳 Docker Hub | https://hub.docker.com/r/daihseven/finance-reminder |

> ⚠️ Hospedado no Render (plano gratuito). A primeira requisição pode levar até 30 segundos — o servidor acorda com qualquer chamada.

---

## 🎯 Problema e Solução

**Problema:** Usuários esquecem contas próximas do vencimento e perdem prazos.

**Solução:** API que permite cadastrar contas, acompanhar pagamentos e receber notificações automáticas por e-mail antes do vencimento — sem depender de lembretes manuais.

---

## 🧰 Stack

| | |
|--|--|
| Runtime | Node.js 20 |
| Linguagem | TypeScript 5 |
| Framework | Express 5 |
| Banco | PostgreSQL + Prisma 6.6 |
| Autenticação | JWT |
| Scheduler | node-cron |
| E-mail | Nodemailer |
| Testes | Vitest + Supertest |
| Documentação | Swagger (OpenAPI 3) |
| Containers | Docker + Docker Compose |
| CI/CD | GitHub Actions |
| Deploy | Render |

---

## 🏗️ Arquitetura

Arquitetura em camadas com separação clara de responsabilidades:

```
Controller   →   recebe requisição HTTP, valida entrada, delega ao Service
Service      →   regras de negócio, orquestra o Repository
Repository   →   comunicação direta com o banco via Prisma
```

A API é **stateless** — cada requisição autenticada carrega seu próprio JWT, sem sessão no servidor.

Erros de negócio são capturados por um **error handler global** que retorna o status HTTP correto (400, 401, 404) sem vazar stack trace para o cliente.

---

## 📂 Estrutura

```
src/
├── controllers/        # Entrada HTTP — sem regra de negócio
├── services/           # Regras de negócio + analytics
├── repositories/       # Acesso ao banco via Prisma
├── routes/             # Definição de rotas
├── middlewares/        # Auth JWT + Error handler global
├── providers/          # EmailProvider, WhatsAppProvider
├── models/             # Interfaces de domínio
├── database/           # Instância do Prisma
├── docs/               # Documentação técnica
└── tests/
    ├── unit/           # Testes unitários — sem banco
    └── integration/    # Testes de integração — banco isolado
```

---

## 📋 Endpoints

### 🔐 Auth
| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/v2/auth/register` | Registrar novo usuário |
| `POST` | `/v2/auth/login` | Login — retorna JWT |

### 💳 Bills — autenticado
| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/v2/bills` | Criar conta |
| `GET` | `/v2/bills` | Listar contas do usuário |
| `GET` | `/v2/bills/filters` | Filtrar por data, categoria e recorrência |
| `PATCH` | `/v2/bills/:id/pay` | Marcar como paga |
| `DELETE` | `/v2/bills/:id` | Excluir conta |

### 📊 Reports — autenticado
| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/v2/reports/summary` | Totais: pendentes e pagas |
| `GET` | `/v2/reports/dashboard` | Analytics por categoria e status |
| `GET` | `/v2/reports/history` | Histórico agrupado por mês |
| `GET` | `/v2/reports/export/csv` | Exportar contas em CSV |
| `GET` | `/v2/reports/export/pdf` | Exportar contas em PDF |

### 👤 Users — autenticado
| Método | Rota | Descrição |
|--------|------|-----------|
| `PATCH` | `/v2/users/me` | Atualizar nome, e-mail, senha ou telefone |

---

## 🔔 Notificações Automáticas

Cron job rodando a cada minuto que verifica contas próximas do vencimento:

- Envia e-mail de lembrete automaticamente
- Marca `notificationSent = true` após o envio — evita spam
- Contas com `status: PAID` são ignoradas

---

## 🆕 V1 → V2: O que mudou

A V1 entregou o núcleo funcional: autenticação, CRUD de contas, relatório simples, scheduler com notificações por e-mail e deploy. A V2 evoluiu o domínio financeiro, adicionou analytics e garantiu qualidade técnica com testes e containers.

| Área | V1 | V2 |
|------|----|----|
| Domínio das contas | `title`, `amount`, `dueDate`, `status` | + `category` (FIXED/VARIABLE) e `recurrence` (NONE/MONTHLY) |
| Filtros | Nenhum | Por data, categoria e recorrência com paginação |
| Pagamento duplicado | Não verificava | Bloqueado com erro 400 |
| Relatórios | Contagem total | + Dashboard com analytics, histórico mensal, export CSV e PDF |
| Tratamento de erros | Erros viravam 500 | Error handler global — status corretos |
| Senha no registro | Retornada na resposta | Nunca exposta |
| Testes | Nenhum | 55 testes: unitários + integração |
| Containers | Nenhum | Dockerfile multi-stage + Docker Compose |
| CI/CD | Deploy manual | GitHub Actions — build e push no Docker Hub |

---
## Resultados em Imagens
### PDF pelo insomnia
![Insomnia](./images/insomnia.png)
### Dashboard no insomnia
![Dashboard](./images/dashboard.png)
### CSV no e-mail 
![CSV](./images/csvemail.png)
### PDF no e-mail
![PDF](./images/pdfemail.png)
### GitHub Actions build-push
![GitHubActions](./images/githubactions.png)
### Swagger API
![SWAGGER](./images/swagger.png)
--
## 📌 Decisões Técnicas

**Pagamento duplicado bloqueado**
Na V1 era possível chamar `PATCH /pay` em uma conta já paga sem erro. Na V2 o `BillService` verifica o status antes de atualizar:

```
PATCH /pay → verifica status → se PAID → erro 400 "Conta já foi paga"
```

**WhatsApp descartado**
A estrutura foi criada (`WhatsAppProvider`), mas a ativação foi descartada. A API do WhatsApp Business mudou o modelo de identificação — de número de telefone para `@` — tornando a integração uma complicação fora do escopo sem benefício prático imediato. Fica planejado para avaliação futura.

**Prisma mantido na v6.6.0**
O Prisma 7 removeu a propriedade `url` do `schema.prisma` e passou a exigir `prisma.config.ts`. O fluxo ainda apresenta instabilidades em ambientes como Render e Neon. A v6.6.0 garante previsibilidade no deploy.

**Mocks unitários com `vi.hoisted()`**
O Vitest 4 não popula `.mock.instances` quando a classe é definida dentro do factory. A solução foi declarar cada mock com `vi.hoisted()` fora do factory e referenciá-los como propriedades da classe mockada — compatível com o comportamento do Vitest 4.

---

## 🧪 Testes

```bash
npm test                   # todos os testes
npm run test:unit          # só unitários (sem banco)
npm run test:integration   # só integração (precisa do banco de teste)
npm run test:coverage      # com relatório de cobertura
```

| Suite | Testes |
|-------|--------|
| AuthService (unit) | 5 ✅ |
| BillService (unit) | 9 ✅ |
| UserService (unit) | 6 ✅ |
| ReportService (unit) | 7 ✅ |
| Auth — integração | 6 ✅ |
| Bills — integração | 14 ✅ |
| Reports — integração | 8 ✅ |
| **Total** | **55 ✅** |

Os testes de integração rodam contra um banco PostgreSQL isolado (`finance_reminder_test`), separado do banco de produção.
### Testes 55/55 -> 100%✅
![tests](./images/tests.png)
---

## 🐳 Docker

```bash
# Puxar a imagem
docker pull daihseven/finance-reminder:latest

# Rodar com Docker Compose
cp .env.example .env       # preencha com seus valores
docker-compose up --build  # sobe banco + API

# Só o banco (para desenvolver localmente)
docker-compose up db -d
```

### CI/CD — build automático via GitHub Actions

A cada `git push` na `main` ou `v2`, o GitHub Actions faz o build e push para o Docker Hub automaticamente.

Configurar em **Settings → Secrets → Actions**:

| Secret | Valor |
|--------|-------|
| `DOCKERHUB_USERNAME` | `daihseven` |
| `DOCKERHUB_TOKEN` | Token em Account Settings → Personal access tokens |

---

## ⚙️ Rodando Localmente

**Pré-requisitos:** Node.js 20+ e PostgreSQL (ou Docker)

```bash
git clone https://github.com/DaihSeven/finance-reminder-api.git
cd finance-reminder-api
npm install
cp .env.example .env
```

**.env:**
```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/finance_reminder"
JWT_SECRET="sua-chave-secreta"
EMAIL_USER="seuemail@gmail.com"
EMAIL_PASS="sua-senha-de-app-gmail"
```

```bash
npx prisma migrate deploy
npm run dev
```

---

## ⚠️ Limitações Conhecidas

**Render (plano gratuito):** o serviço entra em modo sleep após inatividade. O cron job fica suspenso até o servidor acordar — qualquer requisição o reativa.

**WhatsApp:** descartado nesta versão conforme decisão documentada acima.

---

## 📚 Documentação Técnica

- [Arquitetura](src/docs/architecture.md)
- [Regras de Negócio](src/docs/business-rules.md)
- [Dependências](src/docs/dependencies.md)
- [Guia de Testes](src/docs/testGuia.md)
- [Swagger](https://finance-reminder-api.onrender.com/docs/)

---

## 👩‍💻 Autora

**Daiane Barbosa**

[![GitHub](https://img.shields.io/badge/GitHub-DaihSeven-181717?style=flat&logo=github)](https://github.com/DaihSeven)
[![Docker Hub](https://img.shields.io/badge/Docker%20Hub-daihseven-2496ED?style=flat&logo=docker&logoColor=white)](https://hub.docker.com/r/daihseven/finance-reminder)