import Route from '@ioc:Adonis/Core/Route'
import Database from '@ioc:Adonis/Lucid/Database'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

Route.get('test_db_connections', async ({ response }: HttpContextContract) => {
  await Database.report().then(({ health }) => {
    const { healthy, message } = health

    if (healthy) {
      return response.ok({ message })
    }

    return response.status(500).json({ message })
  })
})

Route.get('/', async () => {
  return { hello: 'world' }
})
