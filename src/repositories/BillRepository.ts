import { prisma } from '../database/prisma'
import { Bill, BillCategory, BillRecurrence, Prisma } from '@prisma/client'
//import { Bill } from '../models/Bill'

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

async findByFilters(params: {
  userId: string
  startDate?: Date
  endDate?: Date
  category?: BillCategory
  recurrence?: BillRecurrence
  page?: number
  limit?: number
}) {
  const {
    userId,
    startDate,
    endDate,
    category,
    recurrence,
    page = 1,
    limit = 10
  } = params

  return prisma.bill.findMany({
    where: {
      userId,
      ...(startDate && endDate && {
        dueDate: { gte: startDate, lte: endDate }
      }),
      ...(category && { category }),
      ...(recurrence && { recurrence })
    },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { dueDate: 'asc' }
  })
}


async delete(id: string, userId: string): Promise<void> {
  try{
    await prisma.bill.delete({
      where: {
        id_userId: {
          id,
          userId
        }
      }
    })
  } catch(err){
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
        throw new Error('Conta não encontrada')
      }
      throw err
  }
}
}
