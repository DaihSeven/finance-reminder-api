import { Request, Response } from 'express'
import { ReportService } from '../services/ReportService'

export class ReportController {
  private reportService = new ReportService()

  summary = async (req: Request, res: Response) => {
    const userId = req.userId!

    const summary = await this.reportService.getSummary(userId)

    return res.json(summary)
  }

  dashboard = async (req: Request, res: Response) => {
    const userId = req.userId!
    const dashboard = await this.reportService.getDashboard(userId)
    return res.json(dashboard)
  }

  history = async (req: Request, res: Response) => {
    const userId = req.userId!
    const history = await this.reportService.getMonthlyHistory(userId)
    return res.json(history)
  }
}
