import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.test') })

import { PrismaClient } from '@prisma/client'
import app from '../../app'

const prisma = new PrismaClient()

async function cleanDatabase() {
  await prisma.bill.deleteMany()
  await prisma.user.deleteMany()
}

describe('Auth — Integração', () => {
  beforeAll(async () => { await cleanDatabase() })
  afterAll(async () => { await prisma.$disconnect() })
  beforeEach(async () => { await cleanDatabase() })

  describe('POST /v2/auth/register', () => {
    it('deve registrar um novo usuário e retornar 201 sem expor a senha', async () => {
      const res = await request(app)
        .post('/v2/auth/register')
        .send({ name: 'Daiane', email: 'daiane@email.com', password: '123456' })

      expect(res.status).toBe(201)
      expect(res.body).toHaveProperty('id')
      expect(res.body.email).toBe('daiane@email.com')
      expect(res.body).not.toHaveProperty('password')
    })

    it('deve retornar 400 quando o e-mail já está cadastrado', async () => {
      await request(app)
        .post('/v2/auth/register')
        .send({ name: 'Daiane', email: 'daiane@email.com', password: '123456' })

      const res = await request(app)
        .post('/v2/auth/register')
        .send({ name: 'Daiane 2', email: 'daiane@email.com', password: '123456' })

      expect(res.status).toBe(400)
      expect(res.body).toHaveProperty('message')
    })

    it('deve retornar 400 quando campos obrigatórios estão ausentes', async () => {
      const res = await request(app)
        .post('/v2/auth/register')
        .send({ email: 'daiane@email.com' })

      expect(res.status).toBe(400)
    })
  })

  describe('POST /v2/auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/v2/auth/register')
        .send({ name: 'Daiane', email: 'daiane@email.com', password: '123456' })
    })

    it('deve retornar token JWT com credenciais válidas', async () => {
      const res = await request(app)
        .post('/v2/auth/login')
        .send({ email: 'daiane@email.com', password: '123456' })

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('token')
      expect(typeof res.body.token).toBe('string')
    })

    it('deve retornar 401 com senha incorreta', async () => {
      const res = await request(app)
        .post('/v2/auth/login')
        .send({ email: 'daiane@email.com', password: 'senha_errada' })

      expect(res.status).toBe(401)
      expect(res.body).toHaveProperty('message')
    })

    it('deve retornar 401 com e-mail inexistente', async () => {
      const res = await request(app)
        .post('/v2/auth/login')
        .send({ email: 'naoexiste@email.com', password: '123456' })

      expect(res.status).toBe(401)
    })
  })
})