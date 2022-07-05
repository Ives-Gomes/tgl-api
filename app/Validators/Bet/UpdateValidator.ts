import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import MessagesCustom from '../messagesCustom'

export default class StoreValidator extends MessagesCustom {
  constructor(protected ctx: HttpContextContract) {
    super()
  }

  public schema = schema.create({
    user_id: schema.number.optional([
      rules.exists({ table: 'users', column: 'id' }),
      rules.unsigned(),
    ]),
    game_id: schema.number.optional([
      rules.exists({ table: 'games', column: 'id' }),
      rules.unsigned(),
    ]),
  })
}
