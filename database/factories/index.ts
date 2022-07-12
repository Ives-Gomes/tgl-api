/* eslint-disable prettier/prettier */
import Factory from '@ioc:Adonis/Lucid/Factory'

import User from 'App/Models/User'
import Address from 'App/Models/Address'

export const AddressFactory = Factory.define(Address, ({ faker }) => {
  return {
    zipCode: `${faker.random.numeric(5)}-${faker.random.numeric(3)}`,
    state: faker.address.stateAbbr(),
    city: faker.address.cityName(),
    street: faker.address.street(),
    district: faker.address.streetPrefix(),
    number: faker.address.buildingNumber(),
    complement: faker.lorem.words(10),
  }
}).build()

export const UserFactory = Factory.define(User, ({ faker }) => {
  return {
    name: faker.name.firstName(),
    cpf: `${faker.random.numeric(3, { allowLeadingZeros: true })}.${faker.random.numeric(3, { allowLeadingZeros: true })}.${faker.random.numeric(3, { allowLeadingZeros: true })}-${faker.random.numeric(2, { allowLeadingZeros: true })}`,
    email: `${faker.random.alphaNumeric(10)}@email.com`,
    password: faker.random.alphaNumeric(5),
  }
})
  .relation('addresses', () => AddressFactory)
  .build()
