import { Router } from 'express'
import { UserController } from '../controllers/UserController'
import { authMiddleware } from '../middlewares/auth.middleware'

const router = Router()
const controller = new UserController()

router.patch('/me', authMiddleware, controller.updatePhone)

export { router as userRoutes }
