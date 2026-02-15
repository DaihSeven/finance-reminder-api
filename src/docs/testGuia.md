# 🧪 Guia de Teste — Finance Reminder API

> API RESTful para gerenciamento de contas a pagar com notificações automáticas de vencimento.  
> Desenvolvida com Node.js, PostgreSQL, Prisma e autenticação JWT.

---

## ⚡ Acesso Rápido

| Item | Valor |
|------|-------|
| 🌐 Base URL | `https://finance-reminder-api.onrender.com/v1` |
| 📑 Swagger | `https://finance-reminder-api.onrender.com/docs` |
| 🛠️ Ferramenta | Insomnia ou outra de escolha |

> ⚠️ **Atenção:** A API está hospedada no Render (plano gratuito). Na **primeira requisição**, pode levar até **30 segundos** para o servidor "acordar". Aguarde e tente novamente se receber timeout.

---

## 🗺️ Fluxo Completo de Teste

```
1. Registrar usuário
       ↓
2. Fazer login → copiar token
       ↓
3. Criar contas (bills)
       ↓
4. Listar contas
       ↓
5. Marcar uma conta como paga
       ↓
6. Consultar relatório financeiro
       ↓
7. Atualizar dados do usuário (nome / e-mail / telefone)
```

---

## 🔐 Etapa 1 — Registrar Usuário

**Método:** `POST`  
**URL:** `https://finance-reminder-api.onrender.com/v1/auth/register`

### Configuração no Insomnia

- Method: `POST`
- Body: `JSON`

### Body para copiar

**Dica use seu e-mail próprio para receber a notificação*

```json
{
  "name": "Avaliador Teste",
  "email": "avaliador@teste.com",
  "password": "123456"
}
```

### Resposta esperada

```
Status: 201 Created
```

```json
{
  "id": "uuid-gerado",
  "name": "Avaliador Teste",
  "email": "avaliador@teste.com",
  "createdAt": "2026-02-14T00:00:00.000Z"
}
```

### ⚠️ Erros comuns

| Código | Motivo | Solução |
|--------|--------|---------|
| `400` | E-mail já cadastrado | Use outro e-mail |
| `400` | Campos obrigatórios ausentes | Verifique nome, e-mail e senha no body |

---

## 🔑 Etapa 2 — Login

**Método:** `POST`  
**URL:** `https://finance-reminder-api.onrender.com/v1/auth/login`

### Body para copiar

```json
{
  "email": "avaliador@teste.com",
  "password": "123456"
}
```

### Resposta esperada

```
Status: 200 OK
```

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

> 🔴 **Importante:** Copie o valor do `token`. Ele será usado em **todas as próximas etapas**.

### Como configurar o token no Insomnia

Em cada requisição das próximas etapas:
1. Aba **Auth** → selecione **Bearer Token**
2. Cole o token no campo **TOKEN**
3. O campo **PREFIX** deve ser `Bearer`

### ⚠️ Erros comuns

| Código | Motivo | Solução |
|--------|--------|---------|
| `401` | Senha incorreta | Verifique a senha |
| `404` | E-mail não encontrado | Verifique se o registro foi concluído |

---

## 💳 Etapa 3 — Criar Contas (Bills)

**Método:** `POST`  
**URL:** `https://finance-reminder-api.onrender.com/v1/bills`  
**Auth:** Bearer Token (obrigatório)

### Conta 1 — Pendente

```json
{
  "title": "Internet",
  "amount": 120,
  "dueDate": "2026-03-10"
}
```

### Conta 2 — Próxima do vencimento

```json
{
  "title": "Aluguel",
  "amount": 1500,
  "dueDate": "2026-02-20"
}
```

### Conta 3 — Para marcar como paga

```json
{
  "title": "Academia",
  "amount": 80,
  "dueDate": "2026-02-28"
}
```

### Resposta esperada para cada criação

```
Status: 201 Created
```

```json
{
  "id": "0c547f3a-0761-4b52-83df-150d145eb934",
  "title": "Internet",
  "amount": 120,
  "dueDate": "2026-03-10T00:00:00.000Z",
  "status": "PENDING",
  "userId": "uuid-do-usuario",
  "createdAt": "2026-02-14T00:00:00.000Z",
  "updatedAt": "2026-02-14T00:00:00.000Z"
}
```

> 💡 **Anote o `id`** da conta "Academia" — você vai usá-lo na Etapa 5 para marcá-la como paga.

### ⚠️ Erros comuns

| Código | Motivo | Solução |
|--------|--------|---------|
| `401` | Token ausente ou expirado | Refaça o login e atualize o token |
| `400` | Campo `dueDate` em formato incorreto | Use o formato ISO: `"2026-03-10"` |
| `400` | `amount` como string | Use número sem aspas: `120` não `"120"` |

---

## 📋 Etapa 4 — Listar Contas

**Método:** `GET`  
**URL:** `https://finance-reminder-api.onrender.com/v1/bills`  
**Auth:** Bearer Token (obrigatório)  
**Body:** Nenhum

### Resposta esperada

```
Status: 200 OK
```

```json
[
  {
    "id": "uuid-conta-1",
    "title": "Internet",
    "amount": 120,
    "dueDate": "2026-03-10T00:00:00.000Z",
    "status": "PENDING",
    "userId": "uuid-do-usuario"
  },
  {
    "id": "uuid-conta-2",
    "title": "Aluguel",
    "amount": 1500,
    "dueDate": "2026-02-20T00:00:00.000Z",
    "status": "PENDING",
    "userId": "uuid-do-usuario"
  },
  {
    "id": "uuid-conta-3",
    "title": "Academia",
    "amount": 80,
    "dueDate": "2026-02-28T00:00:00.000Z",
    "status": "PENDING",
    "userId": "uuid-do-usuario"
  }
]
```

> ✅ As contas retornadas são **exclusivas do usuário logado** — cada token acessa apenas seus próprios dados.

---

## ✅ Etapa 5 — Marcar Conta como Paga

**Método:** `PATCH`  
**URL:** `https://finance-reminder-api.onrender.com/v1/bills/{id}/pay`  
**Auth:** Bearer Token (obrigatório)  
**Body:** Nenhum

Substitua `{id}` pelo `id` da conta "Academia" anotado na Etapa 3.

**Exemplo:**
```
PATCH https://finance-reminder-api.onrender.com/v1/bills/0c547f3a-0761-4b52-83df-150d145eb934/pay
```

### Resposta esperada

```
Status: 200 OK
```

```json
{
  "id": "0c547f3a-0761-4b52-83df-150d145eb934",
  "title": "Academia",
  "amount": 80,
  "status": "PAID",
  "updatedAt": "2026-02-14T00:00:00.000Z"
}
```

> ✅ O campo `status` deve ter mudado de `"PENDING"` para `"PAID"`.

### ⚠️ Erros comuns

| Código | Motivo | Solução |
|--------|--------|---------|
| `404` | ID da conta não encontrado | Verifique se copiou o `id` corretamente |
| `403` | Conta pertence a outro usuário | Use apenas IDs das suas próprias contas |

---

## 📊 Etapa 6 — Relatório Financeiro

**Método:** `GET`  
**URL:** `https://finance-reminder-api.onrender.com/v1/reports/summary`  
**Auth:** Bearer Token (obrigatório)  
**Body:** Nenhum

### Resposta esperada (após as etapas anteriores)

```
Status: 200 OK
```

```json
{
  "total": 3,
  "pending": 2,
  "paid": 1
}
```

> 📌 O relatório reflete exatamente o estado atual: 3 contas criadas, 1 paga na Etapa 5, 2 ainda pendentes.

---

## 👤 Etapa 7 — Atualizar Dados do Usuário

**Método:** `PATCH`  
**URL:** `https://finance-reminder-api.onrender.com/v1/users/me`  
**Auth:** Bearer Token (obrigatório)

### Opção A — Atualizar nome e e-mail( notificação atual)

```json
{
  "name": "Nome Atualizado",
  "email": "novo@email.com"
}
```

### Opção B — Adicionar telefone ( usado nas notificações disponível somente na versão 2 futura)

```json
{
  "phone": "11999998888"
}
```

### Opção C — Atualizar senha

```json
{
  "password": "novaSenha123"
}
```

### Resposta esperada

```
Status: 200 OK
```

```json
{
  "id": "uuid-do-usuario",
  "name": "Nome Atualizado",
  "email": "novo@email.com",
  "phone": "11999998888",
  "createdAt": "2026-02-14T00:00:00.000Z",
  "updatedAt": "2026-02-14T00:00:00.000Z"
}
```

---

## 🔔 Funcionalidade Extra — Notificações Automáticas

> Esta funcionalidade é executada automaticamente em segundo plano — **não há rota para chamar manualmente**.

O sistema roda um **cron job** que verifica contas próximas do vencimento e envia notificações automáticas por e-mail e/ou WhatsApp (quando o usuário tiver telefone cadastrado).

Para observar essa funcionalidade em ação:
1. Cadastre uma conta com `dueDate` próximo à data atual
2. Certifique-se de ter um `e-mail` cadastrado (Etapa 7, Opção A)
3. O sistema verificará automaticamente e enviará a notificação

> ⚠️ **Limitação do Render (plano free):** O servidor entra em modo *sleep* quando inativo. O cron job só executa enquanto o servidor está ativo — uma requisição inicial é suficiente para "acordá-lo".

---

## ✔️ Checklist de Validação

Ao final do teste, confirme os itens abaixo:

- [ ] `POST /auth/register` → retornou `201 Created`
- [ ] `POST /auth/login` → retornou token JWT
- [ ] `POST /bills` (×3) → 3 contas criadas com `status: PENDING`
- [ ] `GET /bills` → lista retornou as 3 contas do usuário
- [ ] `PATCH /bills/{id}/pay` → status alterado para `PAID`
- [ ] `GET /reports/summary` → `total: 3`, `paid: 1`, `pending: 2`
- [ ] `PATCH /users/me` → dados atualizados com sucesso

**Todos marcados? A API está 100% operacional. 🎯**

---

## 🚨 Solução de Problemas Gerais

| Sintoma | Causa provável | Solução |
|---------|---------------|---------|
| Timeout / sem resposta | Servidor em sleep no Render | Aguarde 30s e tente novamente |
| `401 Unauthorized` em qualquer rota | Token expirado ou não configurado | Refaça login e atualize o Bearer Token |
| `Cannot GET /v1/rota` | Rota digitada incorretamente | Confira a URL e o método HTTP (GET/POST/PATCH) |
| Resposta vazia `[]` em `/bills` | Contas criadas com outro token | Certifique-se de usar sempre o mesmo token |
| `400` ao criar conta | Formato de `dueDate` inválido | Use formato ISO completo: `"2026-03-10"` ou em extremo caso `"2026-03-10T00:00:00.000Z"` |

---

*Finance Reminder API — desenvolvida por Daiane Barbosa*