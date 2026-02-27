# 📘 Regras de Negócio — Finance Reminder API — V2

> Esta documentação reflete o estado atual da aplicação na V2.
> Regras que existiam apenas como planejamento na V1 estão marcadas com 🆕.

---

## 1️⃣ Usuários

- Todo usuário deve possuir um e-mail único.
- A senha é armazenada de forma criptografada (bcrypt).
- O campo `phone` é opcional no cadastro.
- O usuário pode atualizar nome, e-mail, senha e telefone via `PATCH /v1/users/me`.
- Usuários autenticados só podem acessar recursos associados ao seu próprio `userId`.
- A senha nunca é retornada nas respostas da API. 🆕

---

## 2️⃣ Autenticação

- O sistema utiliza autenticação baseada em JWT.
- O token deve ser enviado no header: `Authorization: Bearer <token>`
- Tokens inválidos ou expirados retornam `401 Unauthorized`.
- Todas as rotas de contas, relatórios e usuário exigem autenticação válida.

---

## 3️⃣ Contas (Bills)

Uma conta representa uma obrigação financeira com data de vencimento.

### Campos obrigatórios na criação

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `title` | string | Nome da conta |
| `amount` | number | Valor em reais |
| `dueDate` | date | Data de vencimento |

### Campos opcionais na criação (V2)

| Campo | Tipo | Valores | Default |
|-------|------|---------|---------|
| `category` | enum | FIXED, VARIABLE | VARIABLE |
| `recurrence` | enum | NONE, MONTHLY | NONE |

### Campos gerenciados pelo sistema

| Campo | Valor padrão |
|-------|-------------|
| `status` | PENDING |
| `notificationSent` | false |
| `userId` | definido via token JWT |

### Status possíveis

| Status | Descrição |
|--------|-----------|
| PENDING | Conta criada e não paga |
| PAID | Conta quitada |

### Regras implementadas

- Toda conta pertence a um único usuário.
- Apenas o dono da conta pode visualizá-la, modificá-la ou excluí-la.
- O status inicial de uma conta é sempre `PENDING`.
- Contas com `status: PAID` não entram no fluxo de notificação.
- O sistema usa `notificationSent` para evitar envio duplicado de notificação.
- **Pagamento duplicado bloqueado:** tentar pagar uma conta já `PAID` retorna `400 Bad Request`. 🆕

### Filtros disponíveis (V2) 🆕

`GET /v1/bills/filters` aceita os seguintes parâmetros de query:

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `startDate` | date | Data inicial do período |
| `endDate` | date | Data final do período |
| `category` | enum | FIXED ou VARIABLE |
| `recurrence` | enum | NONE ou MONTHLY |
| `page` | number | Página (default: 1) |
| `limit` | number | Itens por página (default: 10) |

### Regras previstas para versões futuras

- Impedir criação de contas com data no passado.
- Status automático `OVERDUE` para contas vencidas não pagas.
- Canal de notificação configurável por conta.
- Definição dinâmica de dias de antecedência para notificação.

---

## 4️⃣ Notificações

### Implementado

- O sistema executa um Scheduler (cron) a cada minuto.
- O Scheduler verifica contas com `dueDate` próximo e `status: PENDING`.
- Se a conta ainda não foi notificada (`notificationSent: false`):
  - Envia notificação por e-mail.
  - Marca `notificationSent = true` para evitar reenvio.

### Canais de envio

| Canal | Status |
|-------|--------|
| E-mail | ✅ Implementado |
| WhatsApp | ⚠️ Estrutura criada, ativação descartada (ver decisão abaixo) |

### Decisão — WhatsApp

A ativação do WhatsApp foi descartada na V2. A API do WhatsApp Business mudou o modelo de identificação de número de telefone para `@`, tornando a integração uma complicação fora do escopo sem benefício prático imediato. O `WhatsAppProvider` existe no código e pode ser ativado futuramente quando a API estiver estável.

---

## 5️⃣ Relatórios

Todos os endpoints de relatório retornam dados exclusivos do usuário autenticado.

### Summary — `GET /v1/reports/summary`

Retorna contagem geral das contas do usuário:

```json
{
  "total": 10,
  "pending": 6,
  "paid": 4
}
```

### Dashboard — `GET /v1/reports/dashboard` 🆕

Retorna analytics completo:

```json
{
  "summary": {
    "total": 10,
    "pending": 6,
    "paid": 4,
    "totalPendingAmount": 3200.00,
    "totalPaidAmount": 1800.00
  },
  "byCategory": [
    { "category": "FIXED", "count": 4, "totalAmount": 2500.00 },
    { "category": "VARIABLE", "count": 6, "totalAmount": 2500.00 }
  ],
  "byStatus": [
    { "status": "PENDING", "count": 6, "totalAmount": 3200.00 },
    { "status": "PAID", "count": 4, "totalAmount": 1800.00 }
  ]
}
```

### Histórico mensal — `GET /v1/reports/history` 🆕

Agrupa contas por mês de vencimento:

```json
[
  { "month": "2026-01", "total": 3, "paid": 2, "pending": 1, "totalAmount": 1800.00, "paidAmount": 1200.00 },
  { "month": "2026-02", "total": 4, "paid": 1, "pending": 3, "totalAmount": 2400.00, "paidAmount": 600.00 }
]
```

### Exportação 🆕

| Endpoint | Formato | Content-Type |
|----------|---------|-------------|
| `GET /v1/reports/export/csv` | CSV | `text/csv` |
| `GET /v1/reports/export/pdf` | PDF | `application/pdf` |

---

## 6️⃣ Tratamento de Erros (V2) 🆕

Um error handler global centraliza o retorno de erros. Os Services lançam erros com mensagens semânticas e o handler mapeia para o status HTTP correto:

| Mensagem do erro | Status retornado |
|-----------------|-----------------|
| `Invalid credentials` | 401 |
| `User already exists` | 400 |
| `Conta não encontrada` | 404 |
| `Conta já foi paga` | 400 |
| `Telefone inválido...` | 400 |
| Erro inesperado | 500 |

Antes da V2, qualquer erro não tratado retornava 500 genérico.