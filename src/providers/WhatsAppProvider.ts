export class WhatsAppProvider {
  async send(phone: string, message: string) {
    console.log(`📱 Sending WhatsApp to ${phone}`)
    console.log(message)
  }
}