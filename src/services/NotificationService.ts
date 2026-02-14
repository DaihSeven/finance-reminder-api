import { Bill, User } from '@prisma/client'
import { EmailProvider } from '../providers/EmailProvider'
import { WhatsAppProvider } from '../providers/WhatsAppProvider'

type BillWithUser = Bill & { user: User }

export class NotificationService {
  private emailProvider = new EmailProvider()
  private whatsappProvider = new WhatsAppProvider()

  async notify(bill: BillWithUser) {
    const message = `
Olá ${bill.user.name},

Sua conta "${bill.title}" vence em ${bill.dueDate.toLocaleDateString()}.
Valor: R$ ${bill.amount}

Não esqueça de pagar 😊
`

    // Email é obrigatório
    await this.emailProvider.send(
      bill.user.email,
      'Lembrete de vencimento',
      message
    )

    // WhatsApp verificar a inserção
    if (process.env.WHATSAPP_ENABLED === 'true' && bill.user.phone) {
      await this.whatsappProvider.send(bill.user.phone, message)
    }
  }
}