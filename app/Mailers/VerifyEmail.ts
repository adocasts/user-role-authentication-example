import { BaseMailer, MessageContract } from '@ioc:Adonis/Addons/Mail'
import User from 'App/Models/User'
import Env from '@ioc:Adonis/Core/Env'
import Route from '@ioc:Adonis/Core/Route'

export default class VerifyEmail extends BaseMailer {
  constructor(private user: User, private token: string) {
    super()
  }
  /**
   * WANT TO USE A DIFFERENT MAILER?
   *
   * Uncomment the following line of code to use a different
   * mailer and chain the ".options" method to pass custom
   * options to the send method
   */
  // public mailer = this.mail.use()

  /**
   * The prepare method is invoked automatically when you run
   * "VerifyEmail.send".
   *
   * Use this method to prepare the email message. The method can
   * also be async.
   */
  public prepare(message: MessageContract) {
    const domain = Env.get('DOMAIN')
    const path = Route.makeUrl('verify.email.verify', [this.token])
    const url = domain + path
    message
      .subject('Please Verify Your Email')
      .from('noreply@adocasts.com')
      .to(this.user.email)
      .html(`
        Please click the following link to verify your email
        <a href="${url}">Verify email</a>
      `)
  }
}
