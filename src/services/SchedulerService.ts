import cron from 'node-cron'
import { PrismaClient } from '@prisma/client'
import { NotificationService } from './NotificationService'

const prisma = new PrismaClient()

export class SchedulerService {
  private notificationService = new NotificationService()

  start() {
    // Todo dia às 08:00 deixar como teste a principio
    cron.schedule('* * * * *', async () => {
      console.log('⏰ Running scheduler...')

      const today = new Date()
      const notifyDate = new Date()
      notifyDate.setDate(today.getDate() + 1) // 1 dia antes

      const bills = await prisma.bill.findMany({
        where: {
          dueDate: {
            lte: notifyDate
          },
          status: 'PENDING'
        },
        include: {
          user: true
        }
      })

      for (const bill of bills) {
        await this.notificationService.notify(bill)
      }
    })
  }
}