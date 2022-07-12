import { test } from '@japa/runner'
import Database from '@ioc:Adonis/Lucid/Database'

import { UserFactory } from 'Database/factories/index'

test.group('Users create', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('should not create new user without the body content', async ({ client, route }) => {
    const response = await client.post(route('UsersController.store'))

    response.assertStatus(422)
    response.assertBodyContains({ Array })
  })

  test('should create new user with correct body content', async ({ client, route }) => {
    const user = await UserFactory.with('addresses', 1).create()

    const response = await client.post(route('UsersController.store')).json({
      name: user.name,
      cpf: '123.123.123-12',
      email: 'asdasdasd@aemci.com',
      password: 'secret',
      zipCode: user.addresses[0].zipCode,
      state: user.addresses[0].state,
      city: user.addresses[0].city,
      street: user.addresses[0].street,
      district: user.addresses[0].district,
      number: user.addresses[0].number,
      complement: user.addresses[0].complement,
    })

    console.log(user.name)
    console.log(response.body())

    response.assertStatus(200)
    response.assertBodyContains({ Object })
  })
})
