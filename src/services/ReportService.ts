import { prisma } from '../database/prisma'

export class ReportService {
  async getSummary(userId: string) {
    const now = new Date()

    const total = await prisma.bill.count({
      where: { userId }
    })

    const pending = await prisma.bill.count({
      where: {
        userId,
        status: 'PENDING'
      }
    })

    const paid = await prisma.bill.count({
      where: {
        userId,
        status: 'PAID'
      }
    })

    return {
      total,
      pending,
      paid
    }
  }
}
