import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Role from 'App/Models/Role'
import User from 'App/Models/User'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Roles from 'App/Enums/Roles'

export default class UsersController {
  public async manage({ view }: HttpContextContract) {
    const users = await User.query()
      .orderBy('email')
      
    const roles = await Role.query()
      .orderBy('name')

    return view.render('users/manage', { users, roles })
  }

  public async role({ request, response, params, auth }: HttpContextContract) {
    const roleSchema = schema.create({
      roleId: schema.number([rules.exists({ table: 'roles', column: 'id' })])
    })

    const data = await request.validate({ schema: roleSchema })
    const user = await User.findOrFail(params.id)
    const isAuthUser = user.id === auth.user?.id

    await user.merge(data).save()

    return isAuthUser && user.roleId !== Roles.ADMIN
      ? response.redirect().toPath('/')
      : response.redirect().back()
  }

  public async destroy({ response, params, auth }: HttpContextContract) {
    const user = await User.findOrFail(params.id)
    const isAuthUser = user.id === auth.user?.id

    await user.delete()

    return isAuthUser
      ? response.redirect().toPath('/')
      : response.redirect().back()
  }
}
