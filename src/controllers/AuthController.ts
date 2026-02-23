import { Request, Response, NextFunction } from 'express'
import { AuthService } from '../services/AuthService'

const authService = new AuthService()

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password } = req.body

      if (!name || !email || !password) {
        return res.status(400).json({ message: 'name, email e password são obrigatórios' })
      }

      const user = await authService.register(name, email, password)

      const { password: _, ...userWithoutPassword } = user as any

      return res.status(201).json(userWithoutPassword)
    } catch (err) {
      next(err) 
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body

      const result = await authService.login(email, password)

      return res.json(result)
    } catch (err) {
      next(err)
    }
  }
}