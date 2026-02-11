import { Router } from 'express'
import { BillController } from '../controllers/BillController'
import { authMiddleware } from '../middlewares/auth.middleware'

const router = Router()
const controller = new BillController()

router.use(authMiddleware)

router.post('/', controller.create)
router.get('/', controller.getAll)
router.patch('/:id/pay', controller.pay)

export default router
