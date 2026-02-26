import nodemailer from 'nodemailer'

interface Attachment {
  filename: string
  content: Buffer
  contentType: string
}

export class EmailProvider {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })

  async send(
    to: string,
    subject: string,
    text: string,
    attachments?: Attachment[]
  ): Promise<void> {
    await this.transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      attachments: attachments?.map((a) => ({
        filename: a.filename,
        content: a.content,
        contentType: a.contentType,
      })),
    })
  }
}