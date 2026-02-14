import { Request, Response } from 'express'
import { UserService } from '../services/UserService'

const userService = new UserService()

export class UserController {
  async updatePhone(req: Request, res: Response) {
  try {
    const { phone } = req.body
    const userId = req.userId

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const user = await userService.updatePhone(userId, phone)

    return res.json(user)
  } catch (error: any) {
    return res.status(400).json({ error: error.message })
  }
}

}
