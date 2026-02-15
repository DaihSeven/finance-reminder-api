# 🏗️ Arquitetura — Finance Reminder API
## 📌 Visão Geral

A Finance Reminder API é uma API RESTful desenvolvida para gerenciamento de contas a pagar com sistema de notificações automáticas antes do vencimento.

### O projeto foi estruturado com foco em:

- Organização em camadas

- Separação clara de responsabilidades

- Escalabilidade futura

- Segurança via autenticação JWT

- Deploy em ambiente cloud (Render)

# 🧱 Estilo Arquitetural

- RESTful API

- Stateless

- Comunicação via HTTP + JSON

- Arquitetura em Camadas (Layered Architecture)

A API não mantém estado no servidor.
Cada requisição autenticada carrega seu próprio token JWT.

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

- Aplicar validações (ex: formato de telefone)

Exemplo de responsabilidade real:

- Impedir envio duplicado de notificações

- Validar telefone antes de salvar

## 🔹 Repository

Responsável por:

- Comunicação direta com o banco via Prisma

- Executar queries

- Isolar camada de persistência

- Isso permite trocar o ORM futuramente sem afetar Services.

## 🔹 Model (Domínio)

### Entidades principais:

   -  User

   - id

   - name

   -  email

   -   password

   - phone (opcional)

   -  createdAt

   -  updatedAt

   -  Bill

   -  id

   -  title

   -  amount

   -  dueDate

   -  status (enum: PENDING | PAID)

   -  notificationSent (boolean)

   -  userId (FK)

Relacionamento:

   -  User 1:N Bill

# 🧠 Decisões Arquiteturais Importantes
## ✅ Autenticação via JWT

- Token assinado com segredo

- Expiração de 1 dia

- Middleware valida token

- userId injetado na request

Motivo:

- API stateless

- Isolamento por usuário

- Segurança em rotas privadas

## ✅ Uso de Enum para Status da Conta
   -  PENDING

   -  PAID


Evita inconsistência de dados e garante integridade sem depender apenas de string livre.

## ✅ Uso de Boolean notificationSent

Criado para evitar:

- Envio duplicado de e-mails

- Spam ao usuário

Isso foi uma mudança arquitetural após implementação inicial do scheduler.

## ✅ Scheduler (node-cron)

Responsável por:

- Verificar contas próximas do vencimento

- Acionar NotificationService

Durante desenvolvimento foi configurado para rodar minuto a minuto:

    * * * * *


Motivo:

- Facilitar testes

- Permitir validação imediata

# 🔄 Fluxo Principal do Sistema

- Usuário realiza registro

- Usuário realiza login

- Sistema gera token JWT

- Usuário cria contas autenticado

- Scheduler verifica vencimentos

- Sistema envia notificações

- Usuário consulta relatório resumido

# 🧰 Stack Técnica

- Backend: Node.js + Express

- Linguagem: TypeScript

- Banco de Dados: PostgreSQL

- ORM: Prisma

- Autenticação: JWT

- Scheduler: node-cron

- Documentação: Swagger (OpenAPI)

- Deploy: Render

# 🔐 Segurança

- Senhas criptografadas com bcrypt

- Rotas privadas protegidas por middleware

- Validação de telefone por regex

- Isolamento de dados por userId

# ⚠️ Limitação Conhecida

Deploy realizado no Render (plano free).

### Limitação:

- O serviço pode entrar em modo sleep

- O cron não executa enquanto o serviço está inativo

Essa limitação está documentada e considerada no escopo do projeto.

# 📐 Princípios Aplicados

- Separação de responsabilidades

- Baixo acoplamento

- Código modular

- Configuração via variáveis de ambiente

- Evolução incremental da arquitetura

🧱 [Arquitetura UML](../../images/UMLAPIConceitual.png)