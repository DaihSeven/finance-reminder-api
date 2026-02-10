# 📘 Regras de Negócio — API Financeira

## 1. Usuários
- Todo usuário deve possuir um email único.
- Usuários autenticados só podem acessar recursos associados ao seu próprio usuário.
- Todas as operações financeiras exigem autenticação válida via JWT.

---

## 2. Autenticação
- O sistema utiliza autenticação baseada em JWT.
- O token deve ser enviado no header:Authorization: Bearer <token>
- Tokens expirados ou inválidos devem 
retornar erro 401 (Unauthorized).

---

## 3. Contas (Bills)
- Uma conta representa uma obrigação financeira com data de vencimento.
- Campos obrigatórios:
- description
- amount
- dueDate
- status
- notificationChannel

### Status possíveis
- `PENDING`: Conta criada e não paga.
- `PAID`: Conta quitada.
- `OVERDUE`: Conta vencida e não paga.

### Regras
- Não é permitido criar contas com data de vencimento no passado.
- Contas com status `PAID` não podem ser pagas novamente.
- Contas `PAID` não geram notificações.
- O status `OVERDUE` é calculado automaticamente pelo sistema.

---

## 4. Notificações
- Notificações são disparadas automaticamente antes do vencimento.
- O disparo ocorre X dias antes do vencimento (valor fixo no MVP).
- O canal Email é obrigatório.
- O canal WhatsApp é opcional e controlado por variável de ambiente.

---

## 5. Relatórios
- O sistema deve fornecer um resumo financeiro mensal.
- O resumo inclui:
- Total de contas do mês
- Total de contas pendentes
- Total de contas vencidas
