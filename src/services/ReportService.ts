import { prisma } from '../database/prisma'

export class ReportService {
  async getSummary(userId: string) {
    //const now = new Date()

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

  async getDashboard(userId: string) {

    const [total, pending, paid] = await Promise.all([
      prisma.bill.count({ where: { userId } }),
      prisma.bill.count({ where: { userId, status: 'PENDING' } }),
      prisma.bill.count({ where: { userId, status: 'PAID' } }),
    ])

    const [pendingAmount, paidAmount] = await Promise.all([
      prisma.bill.aggregate({
        where: { userId, status: 'PENDING' },
        _sum: { amount: true },
      }),
      prisma.bill.aggregate({
        where: { userId, status: 'PAID' },
        _sum: { amount: true },
      }),
    ])

    const byCategory = await prisma.bill.groupBy({
      by: ['category'],
      where: { userId },
      _count: { id: true },
      _sum: { amount: true },
    })

    const byStatus = await prisma.bill.groupBy({
      by: ['status'],
      where: { userId },
      _count: { id: true },
      _sum: { amount: true },
    })

    return {
      summary: {
        total,
        pending,
        paid,
        totalPendingAmount: pendingAmount._sum.amount ?? 0,
        totalPaidAmount: paidAmount._sum.amount ?? 0,
      },
      byCategory: byCategory.map((item) => ({
        category: item.category,
        count: item._count.id,
        totalAmount: item._sum.amount ?? 0,
      })),
      byStatus: byStatus.map((item) => ({
        status: item.status,
        count: item._count.id,
        totalAmount: item._sum.amount ?? 0,
      })),
    }
  }

  async getMonthlyHistory(userId: string) {
    
    const bills = await prisma.bill.findMany({
      where: { userId },
      select: {
        amount: true,
        status: true,
        dueDate: true,
      },
      orderBy: { dueDate: 'asc' },
    })

    const map = new Map<string, {
      month: string
      total: number
      paid: number
      pending: number
      totalAmount: number
      paidAmount: number
      pendingAmount: number
    }>()

    for (const bill of bills) {
      const year = bill.dueDate.getFullYear()
      const month = String(bill.dueDate.getMonth() + 1).padStart(2, '0')
      const key = `${year}-${month}`

      if (!map.has(key)) {
        map.set(key, {
          month: key,
          total: 0,
          paid: 0,
          pending: 0,
          totalAmount: 0,
          paidAmount: 0,
          pendingAmount: 0,
        })
      }

      const entry = map.get(key)!
      entry.total += 1
      entry.totalAmount += bill.amount

      if (bill.status === 'PAID') {
        entry.paid += 1
        entry.paidAmount += bill.amount
      } else {
        entry.pending += 1
        entry.pendingAmount += bill.amount
      }
    }

    return Array.from(map.values())
}
}
