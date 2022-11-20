import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Mail from '@ioc:Adonis/Addons/Mail'
import Route from '@ioc:Adonis/Core/Route'
import Env from '@ioc:Adonis/Core/Env'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import User from 'App/Models/User'
import Token from 'App/Models/Token'

export default class PasswordResetController {
  public async forgot({ view }: HttpContextContract) {
    return view.render('password.forgot')
  }

  public async send({ request, response, session }: HttpContextContract) {
    const emailSchema = schema.create({
      email: schema.string([rules.email()])
    })

    const { email } = await request.validate({ schema: emailSchema })
    const user = await User.findBy('email', email)
    const token = await Token.generatePasswordResetToken(user)
    const resetLink = Route.makeUrl('password.reset', [token])

    if (user) {
      await Mail.sendLater(message => {
        message
          .from('noreply@adocasts.com')
          .to(user.email)
          .subject('Reset Your Password')
          .html(`Reset your password by <a href="${Env.get('DOMAIN')}${resetLink}">clicking here</a>`)
      })
    }

    session.flash('success', 'If an account matches the provided email, you will recieve a password reset link shortly')
    return response.redirect().back()
  }

  public async reset({ view, params }: HttpContextContract) {
    const token = params.token
    const isValid = await Token.verify(token)

    return view.render('password/reset', { isValid, token })
  }

  public async store({ request, response, session, auth }: HttpContextContract) {
    const passwordSchema = schema.create({
      token: schema.string(),
      password: schema.string([rules.minLength(8)])
    })

    const { token, password } = await request.validate({ schema: passwordSchema })
    const user = await Token.getPasswordResetUser(token)

    if (!user) {
      session.flash('error', 'Token expired or associated user could not be found')
      return response.redirect().back()
    }

    await user.merge({ password }).save()
    await auth.login(user)
    await Token.expirePasswordResetTokens(user)

    return response.redirect().toPath('/')
  }
}
