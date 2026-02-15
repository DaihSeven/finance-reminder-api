import { BillRepository } from '../repositories/BillRepository'

export class BillService {
  private billRepository = new BillRepository()

  async create( 
    title: string, 
    amount: number, 
    dueDate: Date, 
    userId: string
  )  {
    return this.billRepository.create({
      title,
      amount,
      dueDate,
      userId
    })
  }

  async getAll(userId: string) {
    return this.billRepository.findByUser(userId)
  }

  async pay(id: string, userId: string) {
    return this.billRepository.markAsPaid(id, userId)
  }

  async delete(id: string, userId: string) {
    await this.billRepository.delete(id, userId)
  }
}
