import { faker } from '@faker-js/faker'
import { z } from 'zod'

interface User {
  id: number
  name: string
  email: string
  createdAt: Date
}

export async function getUser(id: number) {
  // Seed the faker library with the user id to ensure consistent data
  faker.seed(id)
  // Simulate a slow database call
  await new Promise((resolve) => setTimeout(resolve, faker.number.int({ min: 300, max: 1000 })))
  faker.seed(id)
  return {
    id,
    name: faker.person.fullName(),
    email: faker.internet.email(),
    createdAt: faker.date.recent({ days: 10 }),
  } as const satisfies User
}
