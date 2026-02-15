# 📦 Dependências e Versionamento
Prisma ORM

### O projeto utiliza:

- prisma: 6.6.0

- @prisma/client: 6.6.0

## 📌 Motivo da escolha

A versão 6.x foi mantida por motivos de estabilidade.

A partir do Prisma 7:

A propriedade url foi removida do schema.prisma.

Passou a ser exigido prisma.config.ts.

O fluxo ainda apresenta instabilidade em ambientes como Render, Neon e Express.

Para garantir previsibilidade no deploy e compatibilidade com PostgreSQL, foi adotada a versão 6.6.0, amplamente utilizada em produção.

## Outras dependências principais

- Express 5.x

- TypeScript 5.x

- JWT para autenticação

- bcrypt para hash de senha

- node-cron para scheduler

- nodemailer para envio de e-mail

- Swagger para documentação OpenAPI