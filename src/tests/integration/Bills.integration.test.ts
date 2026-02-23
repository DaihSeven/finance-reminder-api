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

async function getAuthToken(email = 'bdaih0405@gmail.com') {
  await request(app)
    .post('/v2/auth/register')
    .send({ name: 'Daiane', email, password: '123456' })

  const res = await request(app)
    .post('/v2/auth/login')
    .send({ email, password: '123456' })

  return res.body.token as string
}

async function createBill(token: string, overrides = {}) {
  const res = await request(app)
    .post('/v2/bills')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Aluguel',
      amount: 1500,
      dueDate: '2026-03-05',
      category: 'FIXED',
      recurrence: 'MONTHLY',
      ...overrides,
    })
  return res.body
}

describe('Bills — Integração', () => {
  let token: string

  beforeAll(async () => { await cleanDatabase() })
  afterAll(async () => { await prisma.$disconnect() })
  beforeEach(async () => {
    await cleanDatabase()
    token = await getAuthToken()
  })

  describe('POST /v2/bills', () => {
    it('deve criar uma conta com category e recurrence', async () => {
      const res = await request(app)
        .post('/v2/bills')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Aluguel', amount: 1500, dueDate: '2026-03-05', category: 'FIXED', recurrence: 'MONTHLY' })

      expect(res.status).toBe(201)
      expect(res.body.title).toBe('Aluguel')
      expect(res.body.status).toBe('PENDING')
      expect(res.body.category).toBe('FIXED')
      expect(res.body.recurrence).toBe('MONTHLY')
    })

    it('deve usar defaults VARIABLE e NONE quando não informados', async () => {
      const res = await request(app)
        .post('/v2/bills')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Streaming', amount: 55, dueDate: '2026-03-15' })

      expect(res.status).toBe(201)
      expect(res.body.category).toBe('VARIABLE')
      expect(res.body.recurrence).toBe('NONE')
    })

    it('deve retornar 401 sem token', async () => {
      const res = await request(app)
        .post('/v2/bills')
        .send({ title: 'Aluguel', amount: 1500, dueDate: '2026-03-05' })

      expect(res.status).toBe(401)
    })
  })

  describe('GET /v2/bills', () => {
    it('deve listar apenas as contas do usuário autenticado', async () => {
      await createBill(token)
      await createBill(token, { title: 'Mercado', amount: 400 })

      const otherToken = await getAuthToken('outro@email.com')
      await createBill(otherToken, { title: 'Conta de outro', amount: 999 })

      const res = await request(app)
        .get('/v2/bills')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(2)
      expect(res.body.map((b: any) => b.title)).not.toContain('Conta de outro')
    })

    it('deve retornar lista vazia quando usuário não tem contas', async () => {
      const res = await request(app)
        .get('/v2/bills')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(0)
    })
  })

  describe('GET /v2/bills/filters', () => {
    beforeEach(async () => {
      await createBill(token, { title: 'Aluguel', category: 'FIXED',    recurrence: 'MONTHLY', dueDate: '2026-03-05' })
      await createBill(token, { title: 'Mercado', category: 'VARIABLE', recurrence: 'NONE',    dueDate: '2026-03-10' })
    })

    it('deve filtrar por categoria FIXED', async () => {
      const res = await request(app)
        .get('/v2/bills/filters?category=FIXED')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(1)
      expect(res.body[0].category).toBe('FIXED')
    })

    it('deve filtrar por período de datas', async () => {
      const res = await request(app)
        .get('/v2/bills/filters?startDate=2026-03-01&endDate=2026-03-07')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(1)
      expect(res.body[0].title).toBe('Aluguel')
    })

    it('deve respeitar a paginação', async () => {
      const res = await request(app)
        .get('/v2/bills/filters?page=1&limit=1')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(1)
    })
  })

  describe('PATCH /v2/bills/:id/pay', () => {
    it('deve marcar uma conta como paga', async () => {
      const bill = await createBill(token)

      const res = await request(app)
        .patch(`/v2/bills/${bill.id}/pay`)
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body.status).toBe('PAID')
    })

    it('deve retornar 400 ao tentar pagar uma conta já paga', async () => {
      const bill = await createBill(token)

      await request(app)
        .patch(`/v2/bills/${bill.id}/pay`)
        .set('Authorization', `Bearer ${token}`)

      const res = await request(app)
        .patch(`/v2/bills/${bill.id}/pay`)
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(400)
      expect(res.body.message).toBe('Conta já foi paga')
    })

    it('deve retornar 404 para id inexistente', async () => {
      const res = await request(app)
        .patch('/v2/bills/id-que-nao-existe/pay')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(404)
    })
  })

  describe('DELETE /v2/bills/:id', () => {
    it('deve excluir uma conta e retornar 204', async () => {
      const bill = await createBill(token)

      const res = await request(app)
        .delete(`/v2/bills/${bill.id}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(204)

      const list = await request(app)
        .get('/v2/bills')
        .set('Authorization', `Bearer ${token}`)

      expect(list.body).toHaveLength(0)
    })

    it('deve retornar 404 para id inexistente', async () => {
      const res = await request(app)
        .delete('/v2/bills/id-que-nao-existe')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(404)
    })

    it('não deve deixar um usuário excluir conta de outro', async () => {
      const otherToken = await getAuthToken('outro@email.com')
      const bill = await createBill(otherToken)

      const res = await request(app)
        .delete(`/v2/bills/${bill.id}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(404)
    })
  })
})