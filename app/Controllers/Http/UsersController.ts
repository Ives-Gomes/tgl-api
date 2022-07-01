import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import User from 'App/Models/User'
import Role from 'App/Models/Role'
import Database from '@ioc:Adonis/Lucid/Database'
import Address from 'App/Models/Address'

export default class UsersController {
  public async index({ request, response }: HttpContextContract) {
    response.ok('index')
  }

  public async show({ request, response }: HttpContextContract) {
    response.ok('show')
  }

  public async store({ request, response }: HttpContextContract) {
    const bodyUser = request.only(['name', 'cpf', 'email', 'password'])
    const bodyAddress = request.only([
      'zipCode',
      'state',
      'city',
      'street',
      'district',
      'number',
      'complement',
    ])

    let userCreated

    const trx = await Database.beginGlobalTransaction()

    try {
      userCreated = await User.create(bodyUser, trx)

      const roleClient = await Role.findBy('name', 'client')

      if (roleClient) await userCreated.related('roles').attach([roleClient.id], trx)
    } catch (error) {
      trx.rollback()

      return response.badRequest({ message: 'Error in create user', originalError: error.message })
    }

    try {
      await userCreated.related('addresses').create(bodyAddress)
    } catch (error) {
      trx.rollback()

      return response.badRequest({
        message: 'Error in create address',
        originalError: error.message,
      })
    }

    let userFind

    try {
      userFind = await User.query()
        .where('id', userCreated.id)
        .preload('roles')
        .preload('addresses')
    } catch (error) {
      trx.rollback()

      return response.badRequest({
        message: 'Error in find user',
        originalError: error.message,
      })
    }

    trx.commit()

    return response.ok(userFind)
  }

  public async update({ request, response, params }: HttpContextContract) {
    console.log(params.id)

    const userSecureId = params.id
    const bodyUser = request.only(['name', 'cpf', 'email', 'password'])
    const bodyAddress = request.only([
      'addressId',
      'zipCode',
      'state',
      'city',
      'street',
      'district',
      'number',
      'complement',
    ])

    let userUpdated

    const trx = await Database.beginGlobalTransaction()

    try {
      userUpdated = await User.findByOrFail('secure_id', userSecureId)

      userUpdated.useTransaction(trx)

      await userUpdated.merge(bodyUser).save()
    } catch (error) {
      trx.rollback()

      return response.badRequest({ message: 'Error in update user', originalError: error.message })
    }

    try {
      const addressesUpdtated = await Address.findByOrFail('id', bodyAddress.addressId)

      addressesUpdtated.useTransaction(trx)

      delete bodyAddress.addressId

      await addressesUpdtated.merge(bodyAddress).save()
    } catch (error) {
      trx.rollback()

      return response.badRequest({
        message: 'Error in update address',
        originalError: error.message,
      })
    }

    let userFind

    try {
      userFind = await User.query()
        .where('id', userUpdated.id)
        .preload('roles')
        .preload('addresses')
    } catch (error) {
      trx.rollback()

      return response.badRequest({
        message: 'Error in find user',
        originalError: error.message,
      })
    }

    trx.commit()

    return response.ok(userFind)
  }

  public async destroy({ request, response }: HttpContextContract) {
    response.ok('destroy')
  }
}