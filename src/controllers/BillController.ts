import { Request, Response } from 'express'
import { BillService } from '../services/BillService'

export class BillController {
  private billService = new BillService()

  create = async (req: Request, res: Response) => {
    const { title, amount, dueDate } = req.body
    const userId = req.userId!

    const bill = await this.billService.create(
      title,
      amount,
      new Date(dueDate),
      userId
    )

    return res.status(201).json(bill)
  }

  getAll = async (req: Request, res: Response) => {
    const userId = req.userId!
    const bills = await this.billService.getAll(userId)
    return res.json(bills)
  }

  pay = async (req: Request, res: Response) => {
    const id = String(req.params.id)
    const userId = req.userId!

    const bill = await this.billService.pay(id, userId)
    return res.json(bill)
  }
}
