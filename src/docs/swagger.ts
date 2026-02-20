import { OpenAPIV3 } from 'openapi-types'

export const swaggerDocument: OpenAPIV3.Document = {
  openapi: "3.0.0",

  info: {
    title: "Finance Reminder API",
    description: "API para gestão de contas e alertas financeiros",
    version: "2.0.0",
  },

  servers: [
    {
      url: "http://localhost:3001",
      description: "Ambiente local",
    },
    {
      url: "https://finance-reminder-api.onrender.com",
      description: "Produção",
    },
  ],

  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },

    schemas: {
      /* ================= AUTH ================= */

      RegisterRequest: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string", example: "Seu Nome" },
          email: { type: "string", example: "seuemail@email.com" },
          password: { type: "string", example: "123456" },
        },
      },

      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", example: "seuemail@email.com" },
          password: { type: "string", example: "123456" },
        },
      },

      AuthResponse: {
        type: "object",
        properties: {
          token: {
            type: "string",
            example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          },
        },
      },

      /* ================= BILL ================= */

      Bill: {
        type: "object",
        properties: {
          id: { type: "string", example: "0c547f3a-0761-4b52-83df-150d145eb934" },
          title: { type: "string", example: "Internet" },
          amount: { type: "number", example: 120 },
          dueDate: { type: "string", format: "date-time", example: "2026-03-10T00:00:00.000Z" },
          status: {
            type: "string",
            enum: ["PENDING", "PAID"],
          },
          category: {
            type: "string",
            enum: ["FIXED", "VARIABLE"],
            example: "VARIABLE",
          },
          recurrence: {
            type: "string",
            enum: ["NONE", "MONTHLY"],
            example: "NONE",
          },
          notificationSent: { type: "boolean", example: false },
          userId: { type: "string", example: "ca2f46df-0df0-4d8d-bf20-c4ae89634161" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },

      CreateBillRequest: {
        type: "object",
        required: ["title", "amount", "dueDate"],
        properties: {
          title: { type: "string", example: "Internet" },
          amount: { type: "number", example: 120 },
          dueDate: {
            type: "string",
            format: "date-time",
            example: "2026-03-10T00:00:00.000Z",
          },
          
          category: {
            type: "string",
            enum: ["FIXED", "VARIABLE"],
            example: "VARIABLE",
            description: "Padrão: VARIABLE",
          },
          recurrence: {
            type: "string",
            enum: ["NONE", "MONTHLY"],
            example: "NONE",
            description: "Padrão: NONE",
          },
        },
      },

      BillFiltersResponse: {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/Bill" },
          },
          page: { type: "number", example: 1 },
          limit: { type: "number", example: 10 },
        },
      },

      /* ================= REPORT ================= */
      SummaryReport: {
        type: "object",
        properties: {
          total: { type: "number", example: 10 },
          pending: { type: "number", example: 4 },
          paid: { type: "number", example: 6 },
        },
      },

      /* ================= USER ================= */

      User: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          email: { type: "string" },
          phone: { type: "string", example: "11999998888", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },

      UpdateUserRequest: {
        type: "object",
        properties: {
          phone: { type: "string", example: "11999998888" },
        },
      },

      ErrorResponse: {
        type: "object",
        properties: {
          message: { type: "string" },
        },
      },
    },
  },

  paths: {
    /* ================= AUTH ================= */

    "/v1/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Registrar novo usuário",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterRequest" },
            },
          },
        },
        responses: {
          "201": { description: "Usuário criado com sucesso" },
          "400": {
            description: "E-mail já cadastrado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },

    "/v1/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login do usuário",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Login realizado com sucesso",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          "401": {
            description: "Credenciais inválidas",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },

    /* ================= BILLS ================= */

    "/v1/bills": {
      post: {
        tags: ["Bills"],
        summary: "Criar nova conta",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateBillRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "Conta criada com sucesso",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Bill" },
              },
            },
          },
          "401": { description: "Não autorizado" },
        },
      },

      get: {
        tags: ["Bills"],
        summary: "Listar todas as contas do usuário",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Lista de contas",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Bill" },
                },
              },
            },
          },
          "401": { description: "Não autorizado" },
        },
      },
    },

    "/v1/bills/filters": {
      get: {
        tags: ["Bills"],
        summary: "Filtrar contas por período, categoria ou recorrência",
        description:
          "Retorna contas filtradas com suporte a paginação. Todos os parâmetros são opcionais.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "startDate",
            in: "query",
            required: false,
            description: "Data inicial do período (ISO 8601)",
            schema: { type: "string", format: "date", example: "2026-01-01" },
          },
          {
            name: "endDate",
            in: "query",
            required: false,
            description: "Data final do período (ISO 8601)",
            schema: { type: "string", format: "date", example: "2026-03-31" },
          },
          {
            name: "category",
            in: "query",
            required: false,
            description: "Filtrar por categoria",
            schema: {
              type: "string",
              enum: ["FIXED", "VARIABLE"],
            },
          },
          {
            name: "recurrence",
            in: "query",
            required: false,
            description: "Filtrar por recorrência",
            schema: {
              type: "string",
              enum: ["NONE", "MONTHLY"],
            },
          },
          {
            name: "page",
            in: "query",
            required: false,
            description: "Página atual (padrão: 1)",
            schema: { type: "integer", example: 1 },
          },
          {
            name: "limit",
            in: "query",
            required: false,
            description: "Itens por página (padrão: 10)",
            schema: { type: "integer", example: 10 },
          },
        ],
        responses: {
          "200": {
            description: "Contas filtradas com sucesso",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Bill" },
                },
                examples: {
                  porCategoria: {
                    summary: "Filtro por categoria FIXED",
                    value: [
                      {
                        id: "uuid-1",
                        title: "Aluguel",
                        amount: 1500,
                        dueDate: "2026-03-05T00:00:00.000Z",
                        status: "PENDING",
                        category: "FIXED",
                        recurrence: "MONTHLY",
                        userId: "uuid-usuario",
                      },
                    ],
                  },
                },
              },
            },
          },
          "401": { description: "Não autorizado" },
        },
      },
    },

    "/v1/bills/{id}/pay": {
      patch: {
        tags: ["Bills"],
        summary: "Marcar conta como paga",
        description: "Altera o status da conta de PENDING para PAID. Retorna erro se a conta já estiver paga.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Conta marcada como paga",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Bill" },
              },
            },
          },
          "400": {
            description: "Conta já foi paga",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                example: { message: "Conta já foi paga" },
              },
            },
          },
          "401": { description: "Não autorizado" },
          "404": {
            description: "Conta não encontrada",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },

    "/v1/bills/{id}": {
      delete: {
        tags: ["Bills"],
        summary: "Excluir conta do usuário",
        description: "Remove permanentemente uma conta pertencente ao usuário autenticado.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID da conta a ser excluída",
            schema: { type: "string", example: "clx123abc456" },
          },
        ],
        responses: {
          "204": { description: "Conta excluída com sucesso" },
          "401": {
            description: "Não autorizado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "404": {
            description: "Conta não encontrada",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },

    /* ================= REPORT ================= */

    "/v1/reports/summary": {
      get: {
        tags: ["Reports"],
        summary: "Resumo financeiro do usuário",
        description: "Retorna contagem total de contas, pendentes e pagas. Considera todas as contas do usuário autenticado.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Resumo gerado com sucesso",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SummaryReport" },
              },
            },
          },
          "401": { description: "Não autorizado" },
        },
      },
    },

    /* ================= USER ================= */

    "/v1/users/me": {
      patch: {
        tags: ["Users"],
        summary: "Atualizar telefone do usuário autenticado",
        description: "Permite adicionar ou atualizar o número de telefone. Formato: apenas números com DDD (10 ou 11 dígitos).",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateUserRequest" },
              example: { phone: "11999998888" },
            },
          },
        },
        responses: {
          "200": {
            description: "Usuário atualizado com sucesso",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/User" },
              },
            },
          },
          "400": {
            description: "Telefone inválido",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                example: { message: "Telefone inválido. Use apenas números com DDD." },
              },
            },
          },
          "401": {
            description: "Não autorizado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
  },
}