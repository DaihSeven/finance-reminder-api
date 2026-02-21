# Finance Reminder API
## Guia Completo de Testes - V2

**Desenvolvida por Daiane Barbosa**

---

## Escolha seu ambiente antes de começar

- Render (deploy): https://finance-reminder-api.onrender.com/v2  
- Local: http://localhost:3001/v2  

> Render (plano gratuito): na primeira requisição o servidor pode levar até 30s para acordar.

---

## Visão Geral das Rotas

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | /auth/register | Registrar novo usuário |
| POST | /auth/login | Login e geração do token |
| POST | /bills | Criar conta a pagar |
| GET | /bills | Listar todas as contas |
| GET | /bills/filters | Filtrar contas |
| PATCH | /bills/{id}/pay | Marcar conta como paga |
| DELETE | /bills/{id} | Excluir conta |
| GET | /reports/summary | Resumo simples |
| GET | /reports/dashboard | Dashboard com agregações |
| GET | /reports/history | Histórico mensal |
| GET | /reports/export/csv | Download relatório CSV |
| GET | /reports/export/pdf | Download relatório PDF |
| POST | /reports/export/csv/email | Enviar CSV por e-mail |
| POST | /reports/export/pdf/email | Enviar PDF por e-mail |
| PATCH | /users/me | Atualizar telefone do usuário |

---

## Etapa 1 - Registrar Usuário

Crie sua conta para começar. O e-mail informado também será usado para receber notificações e relatórios.

### Método e Rota
```http
POST /v2/auth/register
````

Body
````
{
  "name": "Seu Nome",
  "email": "seuemail@gmail.com",
  "password": "123456"
}
````
Resposta esperada - 201 Created
````
{
  "id": "uuid-gerado",
  "name": "Seu Nome",
  "email": "seuemail@gmail.com",
  "createdAt": "2026-02-20T00:00:00.000Z"
}
````
| Código |	Motivo |	Solução
|--------|------|-----------|
| 400	| E-mail já cadastrado	| Use outro e-mail |
| 400	| Campos obrigatórios ausentes	| Verifique name, email e password |
---

## Etapa 2 - Login

Faça login para obter o token JWT. Ele será necessário em todas as etapas seguintes.

Método e Rota
````
POST /v2/auth/login
````
Body
````
{
  "email": "seuemail@gmail.com",
  "password": "123456"
}
````
Resposta esperada - 200 OK
````
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
````
IMPORTANTE: copie o token. Ele será usado em TODAS as etapas seguintes como Bearer Token.

Como configurar no Insomnia

    Aba Auth → selecione Bearer Token

    Cole o token no campo TOKEN

    Prefix: Bearer

## Etapa 3 - Criar Contas

Crie ao menos 3 contas para testar os diferentes cenários.

Método e Rota
````
POST /v2/bills
````
### Conta 1 - Fixa com recorrência mensal
````
{
  "title": "Aluguel",
  "amount": 1500,
  "dueDate": "2026-03-05",
  "category": "FIXED",
  "recurrence": "MONTHLY"
}
````
### Conta 2 - Variável sem recorrência
````
{
  "title": "Mercado",
  "amount": 400,
  "dueDate": "2026-03-10",
  "category": "VARIABLE",
  "recurrence": "NONE"
}
````
### Conta 3 - Default automático
````
{
  "title": "Streaming",
  "amount": 55,
  "dueDate": "2026-03-15"
}
````
Sem category e recurrence: defaults → VARIABLE e NONE

Resposta esperada - 201 Created
````
{
  "id": "0c547f3a-...",
  "title": "Aluguel",
  "amount": 1500,
  "dueDate": "2026-03-05T00:00:00.000Z",
  "status": "PENDING",
  "category": "FIXED",
  "recurrence": "MONTHLY",
  "notificationSent": false,
  "userId": "uuid-do-usuário"
}
````
## Etapa 4 - Listar Contas
````
GET /v2/bills

[
  { "title": "Aluguel", "status": "PENDING", "category": "FIXED" },
  { "title": "Mercado", "status": "PENDING", "category": "VARIABLE" },
  { "title": "Streaming", "status": "PENDING", "category": "VARIABLE" }
]
````
## Etapa 5 - Filtros Avançados
````
GET /v2/bills/filters
````
| Query Param	| Exemplo	| Descrição |
|------|-------|-------|
| category	| FIXED	| Filtra por categoria |
| recurrence |	MONTHLY	| Filtra por recorrência |
| startDate	| 2026-03-01	| Data inicial |
| endDate	| 2026-03-31	| Data final |
| page	| 1	| Página |
| limit	| 10	| Itens por página |
---
Exemplos:
````
GET /v2/bills/filters?category=FIXED
GET /v2/bills/filters?startDate=2026-03-01&endDate=2026-03-31
GET /v2/bills/filters?category=FIXED&recurrence=MONTHLY&page=1&limit=10
````
## Etapa 6 - Marcar Conta como Paga
````
PATCH /v2/bills/{id}/pay

{
  "id": "0c547f3a-...",
  "title": "Streaming",
  "status": "PAID",
  "updatedAt": "2026-02-20T00:00:00.000Z"
}
````
Teste:
````
PATCH /v2/bills/{mesmo-id}/pay

{
  "message": "Conta já foi paga"
}
````
## Etapa 7 - Excluir Conta
````
DELETE /v2/bills/{id}
````
Resposta: 204 No Content

## Etapa 8 - Relatórios
````
GET /v2/reports/summary
GET /v2/reports/dashboard
GET /v2/reports/history
````
## Etapa 9 - Exportar Relatórios
````
GET /v2/reports/export/csv
GET /v2/reports/export/pdf
POST /v2/reports/export/csv/email
POST /v2/reports/export/pdf/email
````

## Etapa 10 - Atualizar Dados do Usuário
````
PATCH /v2/users/me

{
  "phone": "41999998888"
}
````
Extra - Notificações Automáticas

    Cron executa em background

    Verifica contas próximas do vencimento

    Envia e-mail de lembrete

    notificationSent = true

    No Render free o cron só roda com servidor ativo
---
### Checklist de Validação
````
 POST /auth/register → 201

 POST /auth/login → token JWT

 POST /bills (x3) → status PENDING

 GET /bills → 3 contas

 GET /bills/filters → filtrou

 PATCH /bills/{id}/pay → PAID

 PATCH /bills/{id}/pay (2x) → 400

 DELETE /bills/{id} → 204

 GET /reports/summary → ok

 GET /reports/dashboard → ok

 GET /reports/history → ok

 GET /reports/export/csv → download

 GET /reports/export/pdf → download

 POST /reports/export/csv/email → recebido

 POST /reports/export/pdf/email → recebido

 PATCH /users/me → telefone atualizado
````
---
### Solução de Problemas

|Sintoma |	Causa	| Solução |
|------|-------|-------|
|Timeout	|Servidor sleep	|Aguarde 30s
|401	|Token expirado	|Refazer login
|category| VARIABLE	|Controller antigo	Atualizar V2
|400 |ao criar	dueDate inválido	|Use ISO
|Lista vazia	|Token outro usuário	|Use mesmo token
|Cannot GET	|URL errada	|Verificar método
|E-mail não chegou|	Sleep/spam	|Verifique spam
---

#### Finance Reminder API - desenvolvida por Daiane Barbosa