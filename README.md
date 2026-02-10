🥇 1️⃣ Infra básica + Banco (feito)

🥈 2️⃣ Prisma + primeira tabela (feito)

🥉 3️⃣ Teste real (local + deploy)(feito)

🟣 4️⃣ Código: Model → Repository → Service → Controller → Route → Swagger ( a fazer)

🥇 PRIMEIRO: Autenticação ( a fazer)

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

🥈 SEGUNDO: Contas (core do sistema) ( a fazer)

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

🥉 TERCEIRO: Relatórios ( a fazer)

Endpoint

    GET /v1/reports/summary

Arquivos

    services/ReportService.ts
    controllers/ReportController.ts
    routes/report.routes.ts

=> Documentação no Swagger.

🟣 QUARTO: Scheduler + Notificação ( a fazer)

(Sem Swagger)

    services/SchedulerService.ts
    services/NotificationService.ts
    providers/EmailProvider.ts
    providers/WhatsAppProvider.ts
