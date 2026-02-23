import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockPrisma = vi.hoisted(() => ({
  bill: {
    count: vi.fn(),
    aggregate: vi.fn(),
    groupBy: vi.fn(),
    findMany: vi.fn(),
  }
}))

vi.mock('../../database/prisma', () => ({
  prisma: mockPrisma
}))

import { ReportService } from '../../services/ReportService'

describe('ReportService', () => {
  let reportService: ReportService

  beforeEach(() => {
    vi.clearAllMocks()
    reportService = new ReportService()
  })

  describe('getSummary', () => {
    it('deve retornar contagens corretas de total, pending e paid', async () => {
      mockPrisma.bill.count
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(3)
        .mockResolvedValueOnce(2)

      const result = await reportService.getSummary('user-1')

      expect(result).toEqual({ total: 5, pending: 3, paid: 2 })
    })

    it('deve retornar zeros quando usuário não tem contas', async () => {
      mockPrisma.bill.count.mockResolvedValue(0)

      const result = await reportService.getSummary('user-1')

      expect(result).toEqual({ total: 0, pending: 0, paid: 0 })
    })
  })

  describe('getDashboard', () => {
    it('deve retornar summary, byCategory e byStatus corretamente', async () => {
      mockPrisma.bill.count
        .mockResolvedValueOnce(4)
        .mockResolvedValueOnce(2)
        .mockResolvedValueOnce(2)

      mockPrisma.bill.aggregate
        .mockResolvedValueOnce({ _sum: { amount: 1900 } })
        .mockResolvedValueOnce({ _sum: { amount: 3200 } })

      mockPrisma.bill.groupBy
        .mockResolvedValueOnce([
          { category: 'FIXED',    _count: { id: 2 }, _sum: { amount: 3000 } },
          { category: 'VARIABLE', _count: { id: 2 }, _sum: { amount: 2100 } },
        ])
        .mockResolvedValueOnce([
          { status: 'PENDING', _count: { id: 2 }, _sum: { amount: 1900 } },
          { status: 'PAID',    _count: { id: 2 }, _sum: { amount: 3200 } },
        ])

      const result = await reportService.getDashboard('user-1')

      expect(result.summary.total).toBe(4)
      expect(result.summary.totalPendingAmount).toBe(1900)
      expect(result.summary.totalPaidAmount).toBe(3200)
      expect(result.byCategory).toHaveLength(2)
      expect(result.byCategory[0]).toEqual({ category: 'FIXED', count: 2, totalAmount: 3000 })
      expect(result.byStatus[0]).toEqual({ status: 'PENDING', count: 2, totalAmount: 1900 })
    })

    it('deve retornar 0 quando _sum.amount é null', async () => {
      mockPrisma.bill.count.mockResolvedValue(0)
      mockPrisma.bill.aggregate.mockResolvedValue({ _sum: { amount: null } })
      mockPrisma.bill.groupBy.mockResolvedValue([])

      const result = await reportService.getDashboard('user-1')

      expect(result.summary.totalPendingAmount).toBe(0)
      expect(result.summary.totalPaidAmount).toBe(0)
    })
  })

  describe('getMonthlyHistory', () => {
    it('deve agrupar contas corretamente por mês', async () => {
      mockPrisma.bill.findMany.mockResolvedValue([
        { amount: 1500, status: 'PAID',    dueDate: new Date('2026-01-05') },
        { amount: 400,  status: 'PENDING', dueDate: new Date('2026-02-10') },
        { amount: 55,   status: 'PAID',    dueDate: new Date('2026-02-15') },
      ])

      const result = await reportService.getMonthlyHistory('user-1')

      expect(result).toHaveLength(2)

      const jan = result.find(r => r.month === '2026-01')
      expect(jan).toMatchObject({ total: 1, paid: 1, pending: 0, paidAmount: 1500 })

      const feb = result.find(r => r.month === '2026-02')
      expect(feb).toMatchObject({ total: 2, paid: 1, pending: 1, totalAmount: 455 })
    })

    it('deve retornar array vazio quando usuário não tem contas', async () => {
      mockPrisma.bill.findMany.mockResolvedValue([])

      const result = await reportService.getMonthlyHistory('user-1')

      expect(result).toHaveLength(0)
    })

    it('deve conter todos os meses esperados ao processar datas diversas', async () => {
      mockPrisma.bill.findMany.mockResolvedValue([
        { amount: 100, status: 'PENDING', dueDate: new Date('2026-03-15T12:00:00.000Z') },
        { amount: 200, status: 'PAID',    dueDate: new Date('2026-01-15T12:00:00.000Z') },
        { amount: 300, status: 'PENDING', dueDate: new Date('2026-02-15T12:00:00.000Z') },
      ])

      const result = await reportService.getMonthlyHistory('user-1')

      const months = result.map(r => r.month)
      expect(months).toContain('2026-01')
      expect(months).toContain('2026-02')
      expect(months).toContain('2026-03')
      expect(result).toHaveLength(3)
    })
  })
})