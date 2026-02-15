# 📘 Regras de Negócio — Finance Reminder API
## 1️⃣ Usuários

- Todo usuário deve possuir um email único.

- A senha é armazenada de forma criptografada (bcrypt).

- O campo phone é opcional no cadastro.

- O usuário pode atualizar o telefone posteriormente via rota autenticada.

- Usuários autenticados só podem acessar recursos associados ao seu próprio userId.

## 2️⃣ Autenticação

- O sistema utiliza autenticação baseada em JWT.

- O token deve ser enviado no header:

    - Authorization: Bearer <token>


- Tokens inválidos ou expirados retornam:

    - 401 Unauthorized


- Todas as rotas de contas e relatórios exigem autenticação válida.

## 3️⃣ Contas (Bills)

Uma conta representa uma obrigação financeira com data de vencimento.

# 📌 Campos obrigatórios

- title

- amount

- dueDate

Campos gerenciados pelo sistema:

- status (default: PENDING)

- notificationSent (default: false)

- userId (definido via token)

# 📌 Status possíveis (implementados)

- PENDING → Conta criada e não paga.

- PAID → Conta quitada.

# 📌 Regras implementadas

- Toda conta pertence a um único usuário.

- Apenas o dono da conta pode visualizá-la ou modificá-la.

- O status inicial de uma conta é PENDING.

- Contas marcadas como PAID não entram no fluxo de notificação.

- O sistema utiliza o campo notificationSent para evitar envio duplicado de notificação.

# ⚠️ Regras ainda NÃO implementadas (Planejamento futuro)

As seguintes regras estão previstas para versões futuras:

- Impedir criação de contas com data no passado.

- Bloquear pagamento duplicado de contas já pagas.

- Status automático OVERDUE.

- Canal de notificação configurável por conta.

- Definição dinâmica de dias antes do vencimento.

# 4️⃣ Notificações
## 📌 Implementado atualmente

- O sistema executa um Scheduler (cron).

- O Scheduler verifica contas próximas do vencimento.

- Se a conta ainda não foi notificada:

- Envia notificação por e-mail.

- Marca notificationSent = true.

## 📌 Canal de envio

- Email → Implementado.

- WhatsApp → Estrutura criada, ativação planejada para V2.

# 5️⃣ Relatórios
- Endpoint
``GET /v1/reports/summary``

Retorno

O sistema retorna um resumo simples contendo:

- Total de contas

- Total de contas pendentes

- Total de contas pagas

Observação:

O relatório atual não é mensal.
Ele considera todas as contas do usuário autenticado.

# 📌 Observação Importante

Esta documentação reflete o estado atual da aplicação (MVP).

Regras marcadas como futuras estão planejadas para a versão V2 e não fazem parte da entrega inicial.