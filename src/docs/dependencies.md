# 📦 Dependências — V2

## Prisma ORM

O projeto utiliza `prisma` e `@prisma/client` na versão **6.6.0**.

A versão 6.x foi mantida por motivos de estabilidade. A partir do Prisma 7, a propriedade `url` foi removida do `schema.prisma` e passou a ser exigido um arquivo `prisma.config.ts`. O fluxo ainda apresenta instabilidades em ambientes como Render e Neon. Para garantir previsibilidade no deploy, a versão 6.6.0 foi mantida.

---

## Dependências de Produção

| Pacote | Versão | Finalidade |
|--------|--------|-----------|
| `@prisma/client` | 6.6.0 | Cliente do banco gerado pelo Prisma |
| `prisma` | 6.6.0 | CLI e migrations |
| `express` | 5.2.1 | Framework HTTP |
| `jsonwebtoken` | 9.0.3 | Geração e verificação de JWT |
| `bcryptjs` | 3.0.3 | Hash de senhas |
| `bcrypt` | 6.0.0 | Hash de senhas (bindings nativos) |
| `node-cron` | 4.2.1 | Scheduler para notificações automáticas |
| `nodemailer` | 8.0.1 | Envio de e-mail |
| `csv-stringify` | 6.6.0 | Geração de arquivos CSV — novo na V2 |
| `pdfkit` | 0.17.2 | Geração de arquivos PDF — novo na V2 |
| `cors` | 2.8.6 | Controle de origens permitidas |
| `dotenv` | 17.2.4 | Variáveis de ambiente |
| `swagger-ui-express` | 5.0.1 | Interface visual do Swagger |
| `swagger-jsdoc` | 6.2.8 | Geração da spec OpenAPI |

---

## Dependências de Desenvolvimento

| Pacote | Versão | Finalidade |
|--------|--------|-----------|
| `typescript` | 5.9.3 | Compilador TypeScript |
| `ts-node-dev` | 2.0.0 | Hot reload em desenvolvimento |
| `vitest` | 4.0.18 | Framework de testes — novo na V2 |
| `@vitest/coverage-v8` | 4.0.18 | Relatório de cobertura — novo na V2 |
| `supertest` | 7.2.2 | Testes de integração HTTP — novo na V2 |
| `openapi-types` | 12.1.3 | Tipagem para o Swagger |
| `@types/*` | — | Tipagens TypeScript dos pacotes acima |

---

## O que foi adicionado na V2

- **`csv-stringify`** — exportação de contas em CSV (`GET /v2/reports/export/csv`)
- **`pdfkit`** — exportação de contas em PDF (`GET /v2/reports/export/pdf`)
- **`vitest` + `@vitest/coverage-v8`** — testes unitários e cobertura de código
- **`supertest`** — testes de integração HTTP contra a API real

---

## Observações

**`bcrypt` e `bcryptjs`:** ambos presentes por compatibilidade. O `bcryptjs` é pure JavaScript (funciona em qualquer ambiente), o `bcrypt` usa bindings nativos (mais performático). O `AuthService` usa `bcryptjs` para garantir portabilidade no Docker e no Render.

**`dotenv` v17:** versão mais recente do dotenv, compatível com o carregamento automático de `.env.test` nos testes de integração via `dotenvx`.