import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { UserRepository } from '../repositories/UserRepository'

export class AuthService {
  private userRepository = new UserRepository()

  async register(name: string, email: string, password: string) {
    const exists = await this.userRepository.findByEmail(email)
    if (exists) {
      throw new Error('User already exists')
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    return this.userRepository.create(name, email, hashedPassword)

  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email)
    if (!user) {
      throw new Error('Invalid credentials')
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      throw new Error('Invalid credentials')
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' }
    )

    return { token }
  }
}
