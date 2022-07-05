import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'

import Bet from 'App/Models/Bet'

import StoreValidator from 'App/Validators/Bet/StoreValidator'
import UpdateValidator from 'App/Validators/Bet/UpdateValidator'

export default class GamesController {
  public async index({ request, response }: HttpContextContract) {
    const { page, perPage, noPaginate, ...inputs } = request.qs()

    try {
      if (noPaginate) {
        return Bet.query().filter(inputs)
      }

      const bets = await Bet.query()
        .filter(inputs)
        .paginate(page || 1, perPage || 10)

      return response.ok(bets)
    } catch (error) {
      return response.badRequest({ message: 'Error in bets list', originalError: error.message })
    }
  }

  public async show({ response, params }: HttpContextContract) {
    const betSecureId = params.id

    try {
      const bet = await Bet.query().where('secure_id', betSecureId).preload('user').preload('game')

      return response.ok(bet)
    } catch (error) {
      return response.notFound({ message: 'Bet not found', originalError: error.message })
    }
  }

  public async store({ request, response, auth }: HttpContextContract) {
    await request.validate(StoreValidator)

    const userAuthenticated = auth.user?.id

    if (userAuthenticated) {
      const bodyBet = request.all()

      let betCreated

      const trx = await Database.beginGlobalTransaction()

      try {
        betCreated = await Bet.create(bodyBet, trx)
      } catch (error) {
        trx.rollback()

        return response.badRequest({ message: 'Error in create bet', originalError: error.message })
      }

      let betFind

      try {
        betFind = await Bet.query().where('id', betCreated.id).preload('user').preload('game')
      } catch (error) {
        trx.rollback()

        return response.badRequest({
          message: 'Error in find bet',
          originalError: error.message,
        })
      }

      trx.commit()

      return response.ok(betFind)
    } else {
      return response.unauthorized({ message: 'You need to be logged' })
    }
  }

  public async update({ request, response, params }: HttpContextContract) {
    await request.validate(UpdateValidator)

    const betSecureId = params.id
    const bodyBet = request.all()

    let betUpdated

    const trx = await Database.beginGlobalTransaction()

    try {
      betUpdated = await Bet.findByOrFail('secure_id', betSecureId)

      betUpdated.useTransaction(trx)

      await betUpdated.merge(bodyBet).save()
    } catch (error) {
      trx.rollback()

      return response.badRequest({ message: 'Error in update bet', originalError: error.message })
    }

    let betFind

    try {
      betFind = await Bet.query().where('id', betUpdated.id).preload('user').preload('game')
    } catch (error) {
      trx.rollback()

      return response.badRequest({
        message: 'Error in find bet',
        originalError: error.message,
      })
    }

    trx.commit()

    return response.ok(betFind)
  }

  public async destroy({ response, params }: HttpContextContract) {
    const betSecureId = params.id

    try {
      await Bet.query().where('secure_id', betSecureId).delete()

      return response.ok({ message: 'Bet deleted successfully' })
    } catch (error) {
      return response.notFound({ message: 'Bet not found', originalError: error.message })
    }
  }
}
