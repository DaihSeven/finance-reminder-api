import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFindByEmail = vi.hoisted(() => vi.fn())
const mockCreate = vi.hoisted(() => vi.fn())

vi.mock('../../repositories/UserRepository', () => {
  class UserRepository {
    findByEmail = mockFindByEmail
    create = mockCreate
  }
  return { UserRepository }
})

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed_password'),
    compare: vi.fn(),
  }
}))

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn().mockReturnValue('mocked_jwt_token'),
  }
}))

process.env.JWT_SECRET = 'test-secret'

import { AuthService } from '../../services/AuthService'
import bcrypt from 'bcryptjs'

describe('AuthService', () => {
  let authService: AuthService

  beforeEach(() => {
    vi.clearAllMocks()
    authService = new AuthService()
  })

  describe('register', () => {
    it('deve criar um usuário quando o e-mail não existe', async () => {
      mockFindByEmail.mockResolvedValue(null)
      mockCreate.mockResolvedValue({
        id: 'uuid-1',
        name: 'Daiane',
        email: 'daiane@email.com',
        password: 'hashed_password',
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const result = await authService.register('Daiane', 'daiane@email.com', '123456')

      expect(mockFindByEmail).toHaveBeenCalledWith('daiane@email.com')
      expect(bcrypt.hash).toHaveBeenCalledWith('123456', 10)
      expect(mockCreate).toHaveBeenCalledWith('Daiane', 'daiane@email.com', 'hashed_password')
      expect(result.email).toBe('daiane@email.com')
    })

    it('deve lançar erro quando o e-mail já está cadastrado', async () => {
      mockFindByEmail.mockResolvedValue({ id: 'uuid-1', email: 'daiane@email.com' })

      await expect(
        authService.register('Daiane', 'daiane@email.com', '123456')
      ).rejects.toThrow('User already exists')

      expect(mockCreate).not.toHaveBeenCalled()
    })
  })

  describe('login', () => {
    const fakeUser = {
      id: 'uuid-1',
      name: 'Daiane',
      email: 'daiane@email.com',
      password: 'hashed_password',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    it('deve retornar token quando credenciais são válidas', async () => {
      mockFindByEmail.mockResolvedValue(fakeUser)
      ;(bcrypt.compare as any).mockResolvedValue(true)

      const result = await authService.login('daiane@email.com', '123456')

      expect(result).toHaveProperty('token')
      expect(result.token).toBe('mocked_jwt_token')
    })

    it('deve lançar erro quando o e-mail não existe', async () => {
      mockFindByEmail.mockResolvedValue(null)

      await expect(
        authService.login('naoexiste@email.com', '123456')
      ).rejects.toThrow('Invalid credentials')
    })

    it('deve lançar erro quando a senha está incorreta', async () => {
      mockFindByEmail.mockResolvedValue(fakeUser)
      ;(bcrypt.compare as any).mockResolvedValue(false)

      await expect(
        authService.login('daiane@email.com', 'senha_errada')
      ).rejects.toThrow('Invalid credentials')
    })
  })
})