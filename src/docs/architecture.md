# 🏗️ Arquitetura da API Financeira

## Visão Geral
API REST para gestão de contas financeiras com alertas automáticos.

---

## Estilo Arquitetural
- RESTful API
- Stateless
- Comunicação via HTTP + JSON

---

## Organização do Código
- Controller: recebe requisições HTTP
- Service: contém regras de negócio
- Repository: acesso ao banco de dados
- Model: entidades do domínio

---

## Stack Técnica
- Backend: Node.js + Express
- Linguagem: TypeScript
- Banco de Dados: PostgreSQL
- ORM: Prisma
- Autenticação: JWT
- Scheduler: Cron Job
- Documentação: Swagger (OpenAPI)

---

## Fluxo Principal
1. Usuário autentica
2. Usuário cria contas
3. Scheduler verifica vencimentos
4. Sistema envia notificações
5. Usuário consulta relatórios

---

## Princípios
- Separação de responsabilidades
- Código modular
- Configuração via variáveis de ambiente
