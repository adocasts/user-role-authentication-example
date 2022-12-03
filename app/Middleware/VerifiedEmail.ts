import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class VerifiedEmail {
  public async handle({ auth, view }: HttpContextContract, next: () => Promise<void>) {
    if (auth.user && !auth.user.isEmailVerified) {
      view.share({ nonVerifiedEmail: true })
    }

    // code for middleware goes here. ABOVE THE NEXT CALL
    await next()
  }
}
