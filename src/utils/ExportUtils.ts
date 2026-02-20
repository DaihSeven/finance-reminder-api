import { stringify } from 'csv-stringify/sync'
import PDFDocument from 'pdfkit'
import { Response } from 'express'
import { Bill } from '@prisma/client'

function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR')
}

function formatAmount(amount: number): string {
  return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatStatus(status: string): string {
  return status === 'PAID' ? 'Paga' : 'Pendente'
}

function formatCategory(category: string): string {
  return category === 'FIXED' ? 'Fixa' : 'Variável'
}

function formatRecurrence(recurrence: string): string {
  return recurrence === 'MONTHLY' ? 'Mensal' : 'Nenhuma'
}

export function generateCsv(bills: Bill[], res: Response): void {
  const rows = bills.map((bill) => ({
    Título: bill.title,
    Valor: formatAmount(bill.amount),
    Vencimento: formatDate(bill.dueDate),
    Status: formatStatus(bill.status),
    Categoria: formatCategory(bill.category),
    Recorrência: formatRecurrence(bill.recurrence),
  }))

  const csv = stringify(rows, { header: true, delimiter: ';' })

  res.setHeader('Content-Type', 'text/csv; charset=utf-8')
  res.setHeader('Content-Disposition', 'attachment; filename="contas.csv"')
  
  res.send('\uFEFF' + csv)
}

export function generatePdf(bills: Bill[], res: Response): void {
  const doc = new PDFDocument({ margin: 40, size: 'A4' })

  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', 'attachment; filename="contas.pdf"')
  doc.pipe(res)

  doc
    .fontSize(18)
    .font('Helvetica-Bold')
    .text('Finance Reminder', { align: 'center' })

  doc
    .fontSize(11)
    .font('Helvetica')
    .fillColor('#666666')
    .text(`Relatório de contas gerado em ${formatDate(new Date())}`, { align: 'center' })

  doc.moveDown(1.5)

  const total = bills.length
  const paid = bills.filter((b) => b.status === 'PAID').length
  const pending = total - paid
  const totalAmount = bills.reduce((sum, b) => sum + b.amount, 0)

  doc.fillColor('#000000').fontSize(11).font('Helvetica-Bold').text('Resumo')
  doc.moveDown(0.3)

  doc.font('Helvetica').fontSize(10).fillColor('#333333')
  doc.text(`Total de contas: ${total}`)
  doc.text(`Pagas: ${paid}`)
  doc.text(`Pendentes: ${pending}`)
  doc.text(`Valor total: ${formatAmount(totalAmount)}`)

  doc.moveDown(1.5)

  const colX = { title: 40, amount: 230, due: 310, status: 390, category: 460 }
  const rowHeight = 22

  doc
    .rect(40, doc.y, 520, rowHeight)
    .fill('#2c3e50')

  doc
    .fillColor('#ffffff')
    .fontSize(9)
    .font('Helvetica-Bold')

  const headerY = doc.y - rowHeight + 7
  doc.text('Título',      colX.title,    headerY)
  doc.text('Valor',       colX.amount,   headerY)
  doc.text('Vencimento',  colX.due,      headerY)
  doc.text('Status',      colX.status,   headerY)
  doc.text('Categoria',   colX.category, headerY)

  doc.moveDown(0.1)

  bills.forEach((bill, i) => {
    const rowY = doc.y
    const bgColor = i % 2 === 0 ? '#f9f9f9' : '#ffffff'

    doc.rect(40, rowY, 520, rowHeight).fill(bgColor)

    const textY = rowY + 7
    doc
      .fillColor('#222222')
      .fontSize(9)
      .font('Helvetica')

    const title = bill.title.length > 22 ? bill.title.slice(0, 22) + '…' : bill.title

    doc.text(title,                        colX.title,    textY)
    doc.text(formatAmount(bill.amount),    colX.amount,   textY)
    doc.text(formatDate(bill.dueDate),     colX.due,      textY)
    doc.text(formatStatus(bill.status),    colX.status,   textY)
    doc.text(formatCategory(bill.category),colX.category, textY)

    doc.y = rowY + rowHeight
  })

  doc.moveDown(0.5)
  doc
    .moveTo(40, doc.y)
    .lineTo(560, doc.y)
    .strokeColor('#cccccc')
    .stroke()

  doc.moveDown(1)
  doc
    .fontSize(8)
    .fillColor('#aaaaaa')
    .font('Helvetica')
    .text('Finance Reminder API — gerado automaticamente', { align: 'center' })

  doc.end()
}

export function generateCsvBuffer(bills: Bill[]): Buffer {
  const rows = bills.map((bill) => ({
    Título: bill.title,
    Valor: formatAmount(bill.amount),
    Vencimento: formatDate(bill.dueDate),
    Status: formatStatus(bill.status),
    Categoria: formatCategory(bill.category),
    Recorrência: formatRecurrence(bill.recurrence),
  }))

  const csv = stringify(rows, { header: true, delimiter: ';' })
 
  return Buffer.from('\uFEFF' + csv, 'utf-8')
}

export function generatePdfBuffer(bills: Bill[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4' })
    const chunks: Buffer[] = []

    doc.on('data', (chunk: Buffer) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    doc
      .fontSize(18)
      .font('Helvetica-Bold')
      .text('Finance Reminder', { align: 'center' })

    doc
      .fontSize(11)
      .font('Helvetica')
      .fillColor('#666666')
      .text(`Relatório de contas gerado em ${formatDate(new Date())}`, { align: 'center' })

    doc.moveDown(1.5)

    const total = bills.length
    const paid = bills.filter((b) => b.status === 'PAID').length
    const pending = total - paid
    const totalAmount = bills.reduce((sum, b) => sum + b.amount, 0)

    doc.fillColor('#000000').fontSize(11).font('Helvetica-Bold').text('Resumo')
    doc.moveDown(0.3)
    doc.font('Helvetica').fontSize(10).fillColor('#333333')
    doc.text(`Total de contas: ${total}`)
    doc.text(`Pagas: ${paid}`)
    doc.text(`Pendentes: ${pending}`)
    doc.text(`Valor total: ${formatAmount(totalAmount)}`)
    doc.moveDown(1.5)

    const colX = { title: 40, amount: 230, due: 310, status: 390, category: 460 }
    const rowHeight = 22

    doc.rect(40, doc.y, 520, rowHeight).fill('#2c3e50')
    doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold')

    const headerY = doc.y - rowHeight + 7
    doc.text('Título',     colX.title,    headerY)
    doc.text('Valor',      colX.amount,   headerY)
    doc.text('Vencimento', colX.due,      headerY)
    doc.text('Status',     colX.status,   headerY)
    doc.text('Categoria',  colX.category, headerY)
    doc.moveDown(0.1)

    bills.forEach((bill, i) => {
      const rowY = doc.y
      doc.rect(40, rowY, 520, rowHeight).fill(i % 2 === 0 ? '#f9f9f9' : '#ffffff')

      const textY = rowY + 7
      const title = bill.title.length > 22 ? bill.title.slice(0, 22) + '…' : bill.title

      doc.fillColor('#222222').fontSize(9).font('Helvetica')
      doc.text(title,                         colX.title,    textY)
      doc.text(formatAmount(bill.amount),     colX.amount,   textY)
      doc.text(formatDate(bill.dueDate),      colX.due,      textY)
      doc.text(formatStatus(bill.status),     colX.status,   textY)
      doc.text(formatCategory(bill.category), colX.category, textY)
      doc.y = rowY + rowHeight
    })

    doc.moveDown(0.5)
    doc.moveTo(40, doc.y).lineTo(560, doc.y).strokeColor('#cccccc').stroke()
    doc.moveDown(1)
    doc.fontSize(8).fillColor('#aaaaaa').font('Helvetica')
      .text('Finance Reminder API — gerado automaticamente', { align: 'center' })

    doc.end()
  })
}