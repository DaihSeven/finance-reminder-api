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

async function getAuthToken() {
  await request(app)
    .post('/v2/auth/register')
    .send({ name: 'Daiane', email: 'daiane@email.com', password: '123456' })

  const res = await request(app)
    .post('/v2/auth/login')
    .send({ email: 'daiane@email.com', password: '123456' })

  return res.body.token as string
}

async function createBill(token: string, overrides = {}) {
  const res = await request(app)
    .post('/v2/bills')
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'Aluguel', amount: 1500, dueDate: '2026-03-05', category: 'FIXED', recurrence: 'MONTHLY', ...overrides })
  return res.body
}

describe('Reports — Integração', () => {
  let token: string

  beforeAll(async () => { await cleanDatabase() })
  afterAll(async () => { await prisma.$disconnect() })
  beforeEach(async () => {
    await cleanDatabase()
    token = await getAuthToken()
  })

  describe('GET /v2/reports/summary', () => {
    it('deve retornar totais corretos após criar e pagar contas', async () => {
      const bill1 = await createBill(token, { title: 'Aluguel' })
      const bill2 = await createBill(token, { title: 'Mercado', amount: 400 })
      await createBill(token, { title: 'Streaming', amount: 55 })

      await request(app)
        .patch(`/v2/bills/${bill1.id}/pay`)
        .set('Authorization', `Bearer ${token}`)

      const res = await request(app)
        .get('/v2/reports/summary')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body.total).toBe(3)
      expect(res.body.paid).toBe(1)
      expect(res.body.pending).toBe(2)
    })

    it('deve retornar zeros quando usuário não tem contas', async () => {
      const res = await request(app)
        .get('/v2/reports/summary')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body).toEqual({ total: 0, pending: 0, paid: 0 })
    })
  })

  describe('GET /v2/reports/dashboard', () => {
    it('deve retornar estrutura completa com summary, byCategory e byStatus', async () => {
      await createBill(token, { category: 'FIXED',    amount: 1500 })
      await createBill(token, { category: 'VARIABLE', amount: 400  })

      const res = await request(app)
        .get('/v2/reports/dashboard')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('summary')
      expect(res.body).toHaveProperty('byCategory')
      expect(res.body).toHaveProperty('byStatus')

      expect(res.body.summary.total).toBe(2)
      expect(res.body.byCategory).toHaveLength(2)

      const fixed = res.body.byCategory.find((c: any) => c.category === 'FIXED')
      expect(fixed.totalAmount).toBe(1500)
    })

    it('deve retornar 401 sem token', async () => {
      const res = await request(app).get('/v2/reports/dashboard')
      expect(res.status).toBe(401)
    })
  })

  describe('GET /v2/reports/history', () => {
    it('deve agrupar contas por mês corretamente', async () => {
      await createBill(token, { dueDate: '2026-01-10', amount: 1500 })
      await createBill(token, { dueDate: '2026-02-10', amount: 400  })
      await createBill(token, { dueDate: '2026-02-20', amount: 55   })

      const res = await request(app)
        .get('/v2/reports/history')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(2)

      const jan = res.body.find((m: any) => m.month === '2026-01')
      expect(jan.total).toBe(1)
      expect(jan.totalAmount).toBe(1500)

      const feb = res.body.find((m: any) => m.month === '2026-02')
      expect(feb.total).toBe(2)
      expect(feb.totalAmount).toBe(455)
    })
  })

  describe('GET /v2/reports/export/csv', () => {
    it('deve retornar arquivo CSV com Content-Type correto', async () => {
      await createBill(token)

      const res = await request(app)
        .get('/v2/reports/export/csv')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.headers['content-type']).toContain('text/csv')
      expect(res.headers['content-disposition']).toContain('contas.csv')
    })

    it('deve retornar 401 sem token', async () => {
      const res = await request(app).get('/v2/reports/export/csv')
      expect(res.status).toBe(401)
    })
  })

  describe('GET /v2/reports/export/pdf', () => {
    it('deve retornar arquivo PDF com Content-Type correto', async () => {
      await createBill(token)

      const res = await request(app)
        .get('/v2/reports/export/pdf')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.headers['content-type']).toContain('application/pdf')
      expect(res.headers['content-disposition']).toContain('contas.pdf')
    })
  })
})