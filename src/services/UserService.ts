import { UserRepository } from '../repositories/UserRepository'

export class UserService {
  private userRepository = new UserRepository()

  async updatePhone(userId: string, phone: string) {
    
    const phoneRegex = /^\d{10,11}$/

    if (!phoneRegex.test(phone)) {
      throw new Error('Telefone inválido. Use apenas números com DDD.')
    }

    return this.userRepository.updatePhone(userId, phone)
  }
}
