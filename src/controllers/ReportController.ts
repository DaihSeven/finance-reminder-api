import { Request, Response } from 'express'
import { ReportService } from '../services/ReportService'
import { BillService } from '../services/BillService'
import { UserRepository } from '../repositories/UserRepository'
import { EmailProvider } from '../providers/EmailProvider'
import { generateCsv, generatePdf, generateCsvBuffer, generatePdfBuffer } from '../utils/ExportUtils'

export class ReportController {
  private reportService = new ReportService()
  private billService = new BillService()
  private userRepository = new UserRepository()
  private emailProvider = new EmailProvider()

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

  exportCsv = async (req: Request, res: Response) => {
    const userId = req.userId!
    const bills = await this.billService.getAll(userId)
    generateCsv(bills, res)
}

exportPdf = async (req: Request, res: Response) => {
    const userId = req.userId!
    const bills = await this.billService.getAll(userId)
    generatePdf(bills, res)
  }

  emailCsv = async (req: Request, res: Response) => {
    const userId = req.userId!

    const [bills, user] = await Promise.all([
      this.billService.getAll(userId),
      this.userRepository.findById(userId),
    ])

    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' })

    const buffer = generateCsvBuffer(bills)

    await this.emailProvider.send(
      user.email,
      'Finance Reminder — seu relatório CSV',
      `Olá ${user.name},\n\nSegue em anexo o relatório das suas contas em formato CSV.\n\nFinance Reminder`,
      [{ filename: 'contas.csv', content: buffer, contentType: 'text/csv' }]
    )

    return res.json({ message: `Relatório CSV enviado para ${user.email}` })
  }

  emailPdf = async (req: Request, res: Response) => {
    const userId = req.userId!

    const [bills, user] = await Promise.all([
      this.billService.getAll(userId),
      this.userRepository.findById(userId),
    ])

    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' })

    const buffer = await generatePdfBuffer(bills)

    await this.emailProvider.send(
      user.email,
      'Finance Reminder — seu relatório PDF',
      `Olá ${user.name},\n\nSegue em anexo o relatório das suas contas em formato PDF.\n\nFinance Reminder`,
      [{ filename: 'contas.pdf', content: buffer, contentType: 'application/pdf' }]
    )

    return res.json({ message: `Relatório PDF enviado para ${user.email}` })
  }

}
