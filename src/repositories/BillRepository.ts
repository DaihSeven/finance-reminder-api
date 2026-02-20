import { prisma } from '../database/prisma'
import { Bill, BillCategory, BillRecurrence } from '../models/Bill'

export class BillRepository {

  async create(data: {
    title: string
    amount: number
    dueDate: Date
    userId: string
    category?: BillCategory
    recurrence?: BillRecurrence
  }): Promise<Bill> {
    return prisma.bill.create({ data })
  }

  async findByUser(userId: string): Promise<Bill[]> {
    return prisma.bill.findMany({
      where: { userId },
      orderBy: { dueDate: 'asc' }
    })
  }

  async markAsPaid(id: string, userId: string): Promise<Bill> {
  return prisma.bill.update({
    where: {
      id_userId: {
        id,
        userId
      }
    },
    data: { status: 'PAID' }
  })

}

async delete(id: string, userId: string): Promise<void> {
    await prisma.bill.delete({
      where: {
        id_userId: {
          id,
          userId
        }
      }
    })
  }
}
