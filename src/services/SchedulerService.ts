import cron from 'node-cron'
import { PrismaClient } from '@prisma/client'
import { NotificationService } from './NotificationService'

const prisma = new PrismaClient()

export class SchedulerService {
  private notificationService = new NotificationService()

  start() {
    //a cada um minito roda, para testes rápidos como o CodeLab
    cron.schedule('* * * * *', async () => {
      console.log('⏰ Running scheduler...')

      const today = new Date()
      const notifyDate = new Date()
      notifyDate.setDate(today.getDate() + 1)

      const bills = await prisma.bill.findMany({
        where: {
          dueDate: {
            lte: notifyDate
          },
          status: 'PENDING',
          notificationSent: false   // controle para evitar duplicação de notificação
        },
        include: {
          user: true
        }
      })

      for (const bill of bills) {
        await this.notificationService.notify(bill)

        // 🔥 Depois de enviar, marca como enviado
        await prisma.bill.update({
          where: { id: bill.id },
          data: { notificationSent: true }
        })

        console.log(`📧 Email enviado para ${bill.user.email}`)
      }
    })
  }
}
