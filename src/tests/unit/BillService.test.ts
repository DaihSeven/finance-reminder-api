import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockCreate        = vi.hoisted(() => vi.fn())
const mockFindByUser    = vi.hoisted(() => vi.fn())
const mockFindById      = vi.hoisted(() => vi.fn())
const mockMarkAsPaid    = vi.hoisted(() => vi.fn())
const mockFindByFilters = vi.hoisted(() => vi.fn())
const mockDelete        = vi.hoisted(() => vi.fn())

vi.mock('../../repositories/BillRepository', () => {
  class BillRepository {
    create        = mockCreate
    findByUser    = mockFindByUser
    findById      = mockFindById
    markAsPaid    = mockMarkAsPaid
    findByFilters = mockFindByFilters
    delete        = mockDelete
  }
  return { BillRepository }
})

import { BillService } from '../../services/BillService'

const fakeBillPending = {
  id: 'bill-uuid-1',
  title: 'Aluguel',
  amount: 1500,
  dueDate: new Date('2026-03-05'),
  status: 'PENDING' as const,
  category: 'FIXED' as const,
  recurrence: 'MONTHLY' as const,
  notificationSent: false,
  userId: 'user-uuid-1',
  createdAt: new Date(),
  updatedAt: new Date(),
}

const fakeBillPaid = { ...fakeBillPending, status: 'PAID' as const }

describe('BillService', () => {
  let billService: BillService

  beforeEach(() => {
    vi.clearAllMocks()
    billService = new BillService()
  })

  describe('create', () => {
    it('deve criar uma conta com os valores fornecidos', async () => {
      mockCreate.mockResolvedValue(fakeBillPending)

      const result = await billService.create(
        'Aluguel', 1500, new Date('2026-03-05'), 'user-uuid-1', 'FIXED', 'MONTHLY'
      )

      expect(mockCreate).toHaveBeenCalledWith({
        title: 'Aluguel',
        amount: 1500,
        dueDate: new Date('2026-03-05'),
        userId: 'user-uuid-1',
        category: 'FIXED',
        recurrence: 'MONTHLY',
      })
      expect(result.title).toBe('Aluguel')
      expect(result.status).toBe('PENDING')
    })

    it('deve usar defaults VARIABLE e NONE quando não informados', async () => {
      mockCreate.mockResolvedValue({ ...fakeBillPending, category: 'VARIABLE', recurrence: 'NONE' })

      await billService.create('Streaming', 55, new Date('2026-03-15'), 'user-uuid-1')

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'VARIABLE', recurrence: 'NONE' })
      )
    })
  })

  describe('getAll', () => {
    it('deve retornar todas as contas do usuário', async () => {
      mockFindByUser.mockResolvedValue([fakeBillPending])

      const result = await billService.getAll('user-uuid-1')

      expect(mockFindByUser).toHaveBeenCalledWith('user-uuid-1')
      expect(result).toHaveLength(1)
    })

    it('deve retornar lista vazia quando usuário não tem contas', async () => {
      mockFindByUser.mockResolvedValue([])

      const result = await billService.getAll('user-uuid-1')

      expect(result).toHaveLength(0)
    })
  })

  describe('pay', () => {
    it('deve marcar uma conta como paga com sucesso', async () => {
      mockFindById.mockResolvedValue(fakeBillPending)
      mockMarkAsPaid.mockResolvedValue(fakeBillPaid)

      const result = await billService.pay('bill-uuid-1', 'user-uuid-1')

      expect(mockMarkAsPaid).toHaveBeenCalledWith('bill-uuid-1', 'user-uuid-1')
      expect(result.status).toBe('PAID')
    })

    it('deve lançar erro quando a conta não existe', async () => {
      mockFindById.mockResolvedValue(null)

      await expect(
        billService.pay('id-inexistente', 'user-uuid-1')
      ).rejects.toThrow('Conta não encontrada')

      expect(mockMarkAsPaid).not.toHaveBeenCalled()
    })

    it('deve lançar erro quando a conta já foi paga', async () => {
      mockFindById.mockResolvedValue(fakeBillPaid)

      await expect(
        billService.pay('bill-uuid-1', 'user-uuid-1')
      ).rejects.toThrow('Conta já foi paga')

      expect(mockMarkAsPaid).not.toHaveBeenCalled()
    })
  })

  describe('getByFilters', () => {
    it('deve repassar os filtros corretamente ao repository', async () => {
      mockFindByFilters.mockResolvedValue([fakeBillPending])

      const params = { userId: 'user-uuid-1', category: 'FIXED' as const, page: 1, limit: 10 }
      const result = await billService.getByFilters(params)

      expect(mockFindByFilters).toHaveBeenCalledWith(params)
      expect(result).toHaveLength(1)
    })
  })

  describe('delete', () => {
    it('deve chamar o repository para deletar a conta', async () => {
      mockDelete.mockResolvedValue(undefined)

      await billService.delete('bill-uuid-1', 'user-uuid-1')

      expect(mockDelete).toHaveBeenCalledWith('bill-uuid-1', 'user-uuid-1')
    })
  })
})