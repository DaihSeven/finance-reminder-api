import { Request, Response } from 'express'
import { ReportService } from '../services/ReportService'

export class ReportController {
  private reportService = new ReportService()

  summary = async (req: Request, res: Response) => {
    const userId = req.userId!

    const summary = await this.reportService.getSummary(userId)

    return res.json(summary)
  }
}
