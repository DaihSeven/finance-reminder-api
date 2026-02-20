import { Request, Response } from 'express'
import { BillService } from '../services/BillService'
import { Bill, BillCategory, BillRecurrence } from '@prisma/client'

export class BillController {
  private billService = new BillService()

  create = async (req: Request, res: Response) => {
    const { title, amount, dueDate,  category, recurrence } = req.body
    const userId = req.userId!

    const bill = await this.billService.create(
      title,
      amount,
      new Date(dueDate),
      userId,
      category, 
      recurrence
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
  
  filters = async (req: Request, res: Response) => {
  const userId = req.userId!

  const {
    startDate,
    endDate,
    category,
    recurrence,
    page,
    limit
  } = req.query

  const bills = await this.billService.getByFilters({
    userId,
    startDate: startDate ? new Date(startDate as string) : undefined,
    endDate: endDate ? new Date(endDate as string) : undefined,
    category: category as BillCategory,
    recurrence: recurrence as BillRecurrence,
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined
  })

  return res.json(bills)
}


   delete = async (req: Request, res: Response) => {
    const id = String(req.params.id)
    const userId = req.userId!

    await this.billService.delete(id, userId)

    return res.status(204).send()
  }
}
