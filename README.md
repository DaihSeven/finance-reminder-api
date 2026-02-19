# 💰 Finance Reminder API

API RESTful para gerenciamento de contas a pagar com notificações automáticas de vencimento.

# Contextualização
Projeto 2 entregue como parte de um projeto incremental do CodeLab no Programadores do Amanhã, dividido em três partes: lógica, backend, frontend. Com requisitos técnicos  e sprint de 10 dias.

# 🎯 Objetivo do Projeto
### Problema identificado

Usuários esquecem contas próximas do vencimento.

### O projeto foi desenvolvido para permitir que usuários:

- Cadastrem contas a pagar
- Marquem contas como pagas
- Visualizem resumo financeiro
- Recebam notificações automáticas antes do vencimento

### Além da funcionalidade principal, o projeto demonstra:

- Arquitetura em camadas

- Autenticação com JWT

- Integração com PostgreSQL via Prisma

- Scheduler com cron

- Deploy em nuvem (Render)

- Documentação com Swagger

## 📚 Documentação Técnica

- 🧱 [Arquitetura](src/docs/architecture.md)
- 📘 [Regras de Negócio](src/docs/business-rules.md)
- 📦 [Dependências](src/docs/dependencies.md)
- 🧪 [Guia de teste](src/docs/testGuia.md)
- 📑 [Swagger](https://finance-reminder-api.onrender.com/docs/)


# 🏗️ Evolução do Projeto

# 📋 Fases de Desenvolvimento do Projeto

## Visão Geral

| Fase | Descrição | Status |
|------|-----------|--------|
| 1 | Infraestrutura básica + Banco de dados | ✅ Concluído |
| 2 | Prisma + primeira tabela | ✅ Concluído |
| 3 | Testes (local + deploy) | ✅ Concluído |
| 4 | Model → Repository → Service → Controller → Route → Swagger | ✅ Concluído |

---

## 🥇 Fase 1 — Autenticação

### Endpoints

| Método | Rota |
|--------|------|
| `POST` | `/v1/auth/register` |
| `POST` | `/v1/auth/login` |

### Arquivos

```
models/User.ts
repositories/UserRepository.ts
services/AuthService.ts
controllers/AuthController.ts
routes/auth.routes.ts
```

Documentação disponível no **Swagger**.

### Testes no Insomnia

**Registro — `POST /v1/auth/register`**

```json
{
  "name": "Seu Nome",
  "email": "seuemail@email.com",
  "password": "123456"
}
```

Resposta esperada: `201 Created` — usuário criado no banco.

---

**Login — `POST /v1/auth/login`**

```json
{
  "email": "seuemail@email.com",
  "password": "123456"
}
```

Resposta esperada:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 🥈 Fase 2 — Contas (core do sistema)

### Endpoints

| Método | Rota |
|--------|------|
| `POST` | `/v1/bills` |
| `GET` | `/v1/bills` |
| `PATCH` | `/v1/bills/:id/pay` |

### Arquivos

```
models/Bill.ts
repositories/BillRepository.ts
services/BillService.ts
controllers/BillController.ts
routes/bill.routes.ts
```

Documentação disponível no **Swagger**.

### Teste — Criação de conta

**`POST http://localhost:3001/v1/bills`**

```json
{
  "title": "Internet na MHNet",
  "amount": 250,
  "dueDate": "2026-02-20"
}
```

Resposta esperada: `201 Created`

```json
{
  "id": "0c547f3a-0761-4b52-83df-150d145eb934",
  "title": "Internet",
  "amount": 250,
  "dueDate": "2026-02-20T00:00:00.000Z",
  "status": "PENDING",
  "userId": "ca2f46df-0df0-4d8d-bf20-c4ae89634161",
  "createdAt": "2026-02-11T17:19:11.242Z",
  "updatedAt": "2026-02-11T17:19:11.242Z"
}
```

### Arquivos auxiliares

```
middlewares/auth.middlewares.ts
types/express.d.ts
```

---

## 🥉 Fase 3 — Relatórios

### Endpoint

| Método | Rota |
|--------|------|
| `GET` | `/v1/reports/summary` |

### Arquivos

```
services/ReportService.ts
controllers/ReportController.ts
routes/report.routes.ts
```

Documentação disponível no **Swagger**.

### Teste no Insomnia

**Passo 1 — Login**

`POST http://localhost:3001/v1/auth/login`

```json
{
  "email": "seuemail@email.com",
  "password": "123456"
}
```

Retorna:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Passo 2 — Consultar o relatório**

`GET http://localhost:3001/v1/reports/summary`

No Insomnia, configure a autenticação:
- Aba **Auth** → Type: `Bearer Token`
- Token: cole o token recebido no login
- Prefix: `Bearer`

Resposta esperada (com contas no banco):

```json
{
  "total": 1,
  "pending": 1,
  "paid": 0
}
```

**Erros possíveis:**
- `401` — Token expirado ou mal configurado
- `404` — Rota não encontrada

---

## 🟣 Fase 4 — Scheduler + Notificações

> Esta fase não possui documentação no Swagger.

### Arquivos

```
services/SchedulerService.ts
services/NotificationService.ts
providers/EmailProvider.ts
providers/WhatsAppProvider.ts
```

### ⚠️ Limitação do cron no Render (plano free)

O Render pode colocar o serviço em modo *sleep* quando inativo. Nesse estado, o cron job não é executado, o que significa que a verificação de contas próximas do vencimento fica suspensa até o serviço acordar novamente.

---

## ♻️ Fase 5 — Refatoração e Melhorias

### Melhorias implementadas

- Verificação **minuto a minuto** no cron para facilitar testes e depuração.
- Flag booleana para **evitar duplicação de notificações**.
- Nova rota `PATCH /v1/users/me` — permite que o usuário adicione ou atualize o número de telefone após o registro.

### Teste — Atualização de perfil

**`PATCH http://localhost:3001/v1/users/me`**

Configure a autenticação Bearer Token com o token obtido no login.

Body:

```json
{
  "phone": "11999998888"
}
```

Resposta esperada: `200 OK`

```json
{
  "id": "bfe94ac9-e3b6-42e4-9613-7dfbff2be93e",
  "name": "Teste cron",
  "email": "seuemail@email.com",
  "password": "$2b$10$.sY7Sw6IVWasxRKpMTe1X.5xsgbl0WwyAfk53LEAtcoXmYUY6gTgi",
  "phone": "11999998888",
  "createdAt": "2026-02-14T14:15:59.979Z",
  "updatedAt": "2026-02-14T18:22:53.379Z"
}
```

Ajustes realizados também na documentação final, pasta `docs/` e README.

---

## 🔮 V2 — Melhorias Futuras

> Será desenvolvida na branch `v2`, fora do escopo da entrega inicial.

### Novidades planejadas

- Notificações via **WhatsApp** habilitadas
- Envio de **relatórios aprimorado**

## 📌 Status do Projeto

✔ Infraestrutura

✔ Autenticação

✔ Contas

✔ Relatórios

✔ Scheduler

✔ Atualização de usuário

✔ Deploy

## 👩‍💻 Autora

Daiane Barbosa


V1 finalizada dia 15/02/2026, bora de V2!

V2: Alterações:

Decisões importantes:

Evitar pagar a mesma conta 2x: 
```
status = PENDING
↓
PATCH /pay
↓
status = PAID

if (bill.status === "PAID") {
   throw new Error("Conta já paga")
}
```

WhatsApp notificações => decidiu-se a não implemetação pois com as novas normas da API sobre o processo de identificação que deixou de ser numero e passou a ser @, seria uma complicação além do escopo do projeto, não acarretando em benefícios a curto prazo do projeto.

✅ 1) CHECKLIST EXECUTÁVEL V2 
⭐ Sprint 1 — evolução do domínio financeiro

Banco + regra de negócio
  - Enums para filtros
  
    adicionar categoria (FIXED / VARIABLE)

    adicionar recorrência (NONE / MONTHLY)

    migration prisma

    atualizar model Bill

    validação impedir pagar 2x

    filtros por data / categoria / recorrência

    paginação

👉 resultado: domínio financeiro sólido

⭐ Sprint 2 — analytics e produto

    endpoint dashboard

    endpoint histórico mensal

    endpoint filtros avançados

    agregações financeiras

    agrupamento por categoria

    agrupamento por status

👉 resultado: API orientada a produto

⭐ Sprint 3 — features UX

    export CSV

    export PDF (opcional)

    logs estruturados simples

    documentação swagger V2

👉 resultado: diferencial portfólio

⭐ Sprint 4 — qualidade técnica

    testes unitários

    testes integração

    docker

    README V2

👉 resultado: API pronta para produção básica

✅ 2) ORDEM IDEAL DE IMPLEMENTAÇÃO

Essa ordem evita retrabalho:

🔥 ordem correta

    schema prisma

    migration

    repository

    service (regras novas)

    controller

    endpoints analytics

    exportação

    testes

    docker

    swagger