export interface Bill {
  id: string
  title: string
  amount: number
  dueDate: Date
  status: 'PENDING' | 'PAID'
  userId: string
  createdAt: Date
  updatedAt: Date
}
