import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockUpdatePhone = vi.hoisted(() => vi.fn())

vi.mock('../../repositories/UserRepository', () => {
  class UserRepository {
    updatePhone = mockUpdatePhone
  }
  return { UserRepository }
})

import { UserService } from '../../services/UserService'

describe('UserService', () => {
  let userService: UserService

  beforeEach(() => {
    vi.clearAllMocks()
    userService = new UserService()
  })

  describe('updatePhone', () => {
    it('deve atualizar o telefone com 11 dígitos válidos', async () => {
      mockUpdatePhone.mockResolvedValue({ id: 'user-1', phone: '41999998888' })

      const result = await userService.updatePhone('user-1', '41999998888')

      expect(mockUpdatePhone).toHaveBeenCalledWith('user-1', '41999998888')
      expect(result.phone).toBe('41999998888')
    })

    it('deve atualizar o telefone com 10 dígitos válidos', async () => {
      mockUpdatePhone.mockResolvedValue({ id: 'user-1', phone: '4133334444' })

      await userService.updatePhone('user-1', '4133334444')

      expect(mockUpdatePhone).toHaveBeenCalledWith('user-1', '4133334444')
    })

    it('deve lançar erro para telefone com menos de 10 dígitos', async () => {
      await expect(
        userService.updatePhone('user-1', '419999')
      ).rejects.toThrow('Telefone inválido. Use apenas números com DDD.')

      expect(mockUpdatePhone).not.toHaveBeenCalled()
    })

    it('deve lançar erro para telefone com mais de 11 dígitos', async () => {
      await expect(
        userService.updatePhone('user-1', '419999988881234')
      ).rejects.toThrow('Telefone inválido. Use apenas números com DDD.')

      expect(mockUpdatePhone).not.toHaveBeenCalled()
    })

    it('deve lançar erro para telefone com letras', async () => {
      await expect(
        userService.updatePhone('user-1', 'abc99998888')
      ).rejects.toThrow('Telefone inválido. Use apenas números com DDD.')

      expect(mockUpdatePhone).not.toHaveBeenCalled()
    })

    it('deve lançar erro para telefone com caracteres especiais', async () => {
      await expect(
        userService.updatePhone('user-1', '(41)99999-8888')
      ).rejects.toThrow('Telefone inválido. Use apenas números com DDD.')

      expect(mockUpdatePhone).not.toHaveBeenCalled()
    })
  })
})