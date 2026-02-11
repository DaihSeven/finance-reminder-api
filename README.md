🥇 1️⃣ Infra básica + Banco (feito)

🥈 2️⃣ Prisma + primeira tabela (feito)

🥉 3️⃣ Teste real (local + deploy)(feito)

🟣 4️⃣ Código: Model → Repository → Service → Controller → Route → Swagger ( a fazer)

### 🥇 PRIMEIRO: Autenticação ( feito)

Endpoints

    POST /v1/auth/register

    POST /v1/auth/login

Arquivos

    models/User.ts

    repositories/UserRepository.ts

    services/AuthService.ts

    controllers/AuthController.ts

    routes/auth.routes.ts


=> Documentação no Swagger.

### Teste no Insomnia:

🔹 Register — POST /v1/auth/register
    {
    "name": "Daiane Barbosa",
    "email": "daiane@email.com",
    "password": "123456"
    }


📌 Saída:

    status 201

usuário criado no banco

🔹 Login — POST /v1/auth/login

    {
    "email": "daiane@email.com",
    "password": "123456"
    }


📌 Resposta:

    {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }

### 🥈 SEGUNDO: Contas (core do sistema) ( feito)

Endpoints

    POST   /v1/bills
    GET    /v1/bills
    PATCH  /v1/bills/:id/pay

Arquivos

    models/Bill.ts
    repositories/BillRepository.ts
    services/BillService.ts
    controllers/BillController.ts
    routes/bill.routes.ts

=> Documentação no Swagger.
### Teste de criação de conta
 🔹 POST  http://localhost:3001/v1/bills

    {
    "title": "Internet",
    "amount": 250,
    "dueDate": "2026-02-20"
    }

📌 Resposta: 201 Created

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

### Arquivos auxiliares:
    middlewares/auth.middlewares.ts
    types/express.d.ts

### 🥉 TERCEIRO: Relatórios ( feito)

Endpoint

    GET /v1/reports/summary

Arquivos

    services/ReportService.ts
    controllers/ReportController.ts
    routes/report.routes.ts

=> Documentação no Swagger.
### Teste no insomnia:

📌 Passo 1 — Fazer login

    POST http://localhost:3001/v1/auth/login


Body JSON:

    {
    "email": "daiane@email.com",
    "password": "123456"
    }

recebe:

    {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }

📌 Passo 2 — Testar o relatório


    GET http://localhost:3000/v1/reports/summary

🔐 No Insomnia:

Aba Auth

Type: Bearer Token

Token: colar o token

Prefix: Bearer

✅ 4Resultado esperado

Se existir contas no banco

    {
        "total": 1,
        "pending": 1,
        "paid": 0
    }

Erros: 401 => Token expirado, token mal configurado..

404 => Erro de rota

🟣 QUARTO: Scheduler + Notificação ( a fazer)

(Sem Swagger)

    services/SchedulerService.ts
    services/NotificationService.ts
    providers/EmailProvider.ts
    providers/WhatsAppProvider.ts
