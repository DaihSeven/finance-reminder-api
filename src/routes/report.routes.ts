import { Router } from 'express'
import { ReportController } from '../controllers/ReportController'
import { authMiddleware } from '../middlewares/auth.middleware'

const router = Router()
const controller = new ReportController()

router.use(authMiddleware)

router.get('/summary', controller.summary)

export default router
