import { BillCategory, BillRecurrence } from '@prisma/client'

export interface Bill {
  id: string
  title: string
  amount: number
  dueDate: Date
  status: 'PENDING' | 'PAID'
  category: BillCategory
  recurrence: BillRecurrence
  userId: string
  createdAt: Date
  updatedAt: Date
}

