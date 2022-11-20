import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import { string } from '@ioc:Adonis/Core/Helpers'
import User from './User'

export default class Token extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number | null

  @column()
  public type: string

  @column()
  public token: string

  @column.dateTime()
  public expiresAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  public static async generatePasswordResetToken(user: User | null) {
    const token = string.generateRandom(64)

    if (!user) return token

    await Token.expirePasswordResetTokens(user)
    const record = await user.related('tokens').create({
      type: 'PASSWORD_RESET',
      expiresAt: DateTime.now().plus({ hour: 1 }),
      token
    })

    return record.token
  }

  public static async expirePasswordResetTokens(user: User) {
    await user.related('passwordResetTokens').query().update({
      expiresAt: DateTime.now()
    })
  }

  public static async getPasswordResetUser(token: string) {
    const record = await Token.query()
      .preload('user')
      .where('token', token)
      .where('expiresAt', '>', DateTime.now().toSQL())
      .orderBy('createdAt', 'desc')
      .first()

    return record?.user
  }

  public static async verify(token: string) {
    const record = await Token.query()
      .where('expiresAt', '>', DateTime.now().toSQL())
      .where('token', token)
      .first()

    return !!record
  }
}
