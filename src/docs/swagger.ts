import { OpenAPIV3 } from 'openapi-types'

export const swaggerDocument: OpenAPIV3.Document = {
  openapi: '3.0.0',
  info: {
    title: 'Finance Reminder API',
    description: 'API para gestão de contas e alertas financeiros',
    version: '1.0.0'
  },

  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Ambiente local'
    },
    {
      url: 'https://finance-reminder-api.onrender.com',
      description: 'Produção'
    }
  ],

  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },

    schemas: {
      RegisterRequest: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', example: 'Daiane Barbosa' },
          email: { type: 'string', example: 'daiane@email.com' },
          password: { type: 'string', example: '123456' }
        }
      },

      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', example: 'daiane@email.com' },
          password: { type: 'string', example: '123456' }
        }
      },

      AuthResponse: {
        type: 'object',
        properties: {
          token: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
          }
        }
      },

      ErrorResponse: {
        type: 'object',
        properties: {
          message: { type: 'string' }
        }
      }
    }
  },

  paths: {
    '/v1/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/RegisterRequest'
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'User created successfully'
          },
          '400': {
            description: 'User already exists',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },

    '/v1/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/LoginRequest'
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' }
              }
            }
          },
          '401': {
            description: 'Invalid credentials',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    }
  }
}
