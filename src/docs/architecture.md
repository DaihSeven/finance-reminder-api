# 🏗️ Arquitetura — Finance Reminder API
## 📌 Visão Geral

A Finance Reminder API é uma API RESTful desenvolvida para gerenciamento de contas a pagar com sistema de notificações automáticas antes do vencimento.

### O projeto foi estruturado com foco em:

- Organização em camadas

- Separação clara de responsabilidades

- Escalabilidade futura

- Segurança via autenticação JWT

- Deploy em ambiente cloud (Render)

- Qualidade garantida por testes unitários e de integração
---
# 🧱 Estilo Arquitetural

- RESTful API

- Stateless

- Comunicação via HTTP + JSON

- Arquitetura em Camadas (Layered Architecture)

A API não mantém estado no servidor.
Cada requisição autenticada carrega seu próprio token JWT.
---
# 📂 Organização do Código

O projeto segue separação por responsabilidades:

## 🔹 Controller

Responsável por:

- Receber requisições HTTP

- Validar entrada básica

- Retornar respostas HTTP

- Delegar lógica ao Service

- Não contém regra de negócio.

## 🔹 Service

Responsável por:

- Implementar regras de negócio

- Validar regras de domínio

- Orquestrar chamadas ao Repository

Exemplos de responsabilidades reais:

- Impedir envio duplicado de notificações
- Validar telefone antes de salvar
- Bloquear pagamento duplicado de conta já paga
- Calcular agregações financeiras para o dashboard

## 🔹 Repository

Responsável por:

- Comunicação direta com o banco via Prisma

- Executar queries e filtros

- Isolar camada de persistência

- Captura erros do Prisma (ex: P2025) e converte para erros semânticos

Isso permite trocar o ORM futuramente sem afetar Services.

## 🔹 Middleware

### Auth Middleware
Valida o token JWT em todas as rotas privadas e injeta `userId` na request.

### Error Handler Global (adicionado na V2)
Captura erros lançados pelos Services e Controllers e retorna o status HTTP correto:

- `400` — erros de negócio (ex: conta já paga, telefone inválido)
- `401` — credenciais inválidas
- `404` — recurso não encontrado
- `500` — erros inesperados (sem vazar stack trace)

Antes da V2, qualquer erro não tratado retornava 500 genérico.

## 🔹 Model (Domínio)

### Entidades principais:

### User
- id, name, email, password, phone (opcional), createdAt, updatedAt

### Bill
- id, title, amount, dueDate
- status (enum: PENDING | PAID)
- category (enum: FIXED | VARIABLE) — *adicionado na V2*
- recurrence (enum: NONE | MONTHLY) — *adicionado na V2*
- notificationSent (boolean)
- userId (FK)

Relacionamento: User 1:N Bill
---
# 🧠 Decisões Arquiteturais Importantes
## ✅ Autenticação via JWT

- Token assinado com segredo via variável de ambiente
- Expiração de 1 dia
- Middleware valida token e injeta `userId` na request

Motivo: API stateless, isolamento por usuário, segurança em rotas privadas.

## ✅ Enums para Status, Categoria e Recorrência

| Enum | Valores |
|------|---------|
| BillStatus | PENDING, PAID |
| BillCategory | FIXED, VARIABLE |
| BillRecurrence | NONE, MONTHLY |

Evita inconsistência de dados e garante integridade sem depender de string livre.

## ✅ Uso de Boolean notificationSent

Criado para evitar:

- Envio duplicado de e-mails e Spam ao usuário

Isso foi uma mudança arquitetural após implementação inicial do scheduler. O scheduler marca `notificationSent = true` após o envio e ignora a conta nas execuções seguintes.

## ✅ Scheduler (node-cron)

Responsável por:

- Verificar contas próximas do vencimento e acionar NotificationService

Durante desenvolvimento foi configurado para rodar minuto a minuto:

    * * * * *

Motivo:

- Facilitar testes

- Permitir validação imediata


## ✅ Bloqueio de Pagamento Duplicado (V2)

O `BillService` verifica o status antes de marcar como paga. Se `status === PAID`, lança erro que o error handler converte em 400. Regra que estava planejada na V1 e foi implementada na V2.

## ✅ Captura de Erros do Prisma no Repository (V2)

O `BillRepository.delete` captura `PrismaClientKnownRequestError` com código `P2025` (registro não encontrado) e converte para `throw new Error('Conta não encontrada')`. Isso evita que erros internos do ORM vazem como 500 para o cliente.

## ✅ Mocks com vi.hoisted() nos Testes (V2)

O Vitest 4 não popula `.mock.instances` quando a classe é definida dentro do factory. A solução foi declarar cada mock com `vi.hoisted()` fora do factory e referenciá-los como propriedades da classe mockada.

## ✅ WhatsApp — Decisão de Não Implementar

A estrutura foi criada (`WhatsAppProvider`), mas a ativação foi descartada. A API do WhatsApp Business mudou o modelo de identificação de número de telefone para `@`, tornando a integração uma complicação fora do escopo sem benefício prático imediato.

---
# 🔄 Fluxo Principal do Sistema

- Usuário realiza registro

- Usuário realiza login -> Sistema gera token JWT

- Usuário cria contas autenticado

- Scheduler verifica vencimentos a cada minuto

- Sistema envia notificações por e-mail (uma vez por conta)

- Usuário consulta relatório, dashboard ou histórico mensal

- Usuário exporta relatório em CSV ou PDF
---

# 🧰 Stack Técnica


| | |
|--|--|
| Backend | Node.js 20 + Express 5 |
| Linguagem | TypeScript 5 |
| Banco | PostgreSQL + Prisma 6.6 |
| Autenticação | JWT |
| Scheduler | node-cron |
| Notificações | Nodemailer |
| Exportação | csv-stringify + pdfkit |
| Testes | Vitest 4 + Supertest |
| Documentação | Swagger (OpenAPI 3) |
| Containers | Docker + Docker Compose |
| CI/CD | GitHub Actions |
| Deploy | Render |

---
# 🔐 Segurança

- Senhas criptografadas com bcrypt

- Rotas privadas protegidas por middleware JWT

- Validação de telefone por regex

- Isolamento de dados por userId

- `password` nunca retornado nas respostas da API
---
# ⚠️ Limitação Conhecida

**Render (plano gratuito):**

- O serviço pode entrar em modo sleep

- O cron não executa enquanto o serviço está inativo, qualquer requisição o reativa.

Essa limitação está documentada e considerada no escopo do projeto.

**Prisma 7:** mantida a versão 6.6.0. A v7 removeu a propriedade `url` do `schema.prisma` e exige `prisma.config.ts`, com instabilidades ainda presentes no Render e Neon.
---
# 📐 Princípios Aplicados

- Separação de responsabilidades

- Baixo acoplamento

- Código modular

- Configuração via variáveis de ambiente

- Evolução incremental da arquitetura

- Qualidade garantida por testes automatizados

🧱 [Arquitetura UML](../../images/UMLAPIConceitual.png)