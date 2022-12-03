import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Token from 'App/Models/Token'

export default class VerifyEmailController {
  public async index({ view, auth }: HttpContextContract) {
    await auth.user?.sendVerifyEmail()
    return view.render('emails/verify')
  }

  public async verify({ response, session, params, auth }: HttpContextContract) {
    const user = await Token.getTokenUser(params.token, 'VERIFY_EMAIL')
    const isMatch = user?.id === auth.user?.id

    // if token is valid and bound to a user, but user is not authenticated
    if (user && !auth.user) {
      // return to login page & verify email after successful login
      session.put('isVerifyingEmail', true)
      return response.redirect().toPath('/')
    }

    // if token is invalid, not bound to a user, or does not match the auth user
    if (!user || !isMatch) {
      // handle invalid token
      session.flash('token', 'Your token is invalid or expired')
      return response.redirect().toRoute('verify.email')
    }

    user.isEmailVerified = true
    await user.save()
    await Token.expireTokens(user, 'verifyEmailTokens')

    return response.redirect().toPath('/')
  }
}
