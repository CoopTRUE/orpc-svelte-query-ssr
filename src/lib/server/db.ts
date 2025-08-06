import { faker } from '@faker-js/faker'

interface User {
  id: number
  name: string
  email: string
  createdAt: Date
}

export async function getUser(id: number) {
  // Simulate a slow database call
  await new Promise((resolve) => setTimeout(resolve, faker.number.int({ min: 1000, max: 1500 })))
  // Seed the faker library with the user id to ensure consistent data
  faker.seed(id)
  return {
    id,
    name: faker.person.fullName(),
    email: faker.internet.email(),
    createdAt: faker.date.recent({ days: 10 }),
  } as const satisfies User
}
