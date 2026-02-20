import { prisma } from '../database/prisma'
import { BillCategory, BillRecurrence } from '@prisma/client'
import { Bill } from '../models/Bill'

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

  async findById(id: string, userId: string): Promise<Bill | null> {
    return prisma.bill.findUnique({
      where: {
        id_userId: {
          id,
          userId
        }
      }
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
