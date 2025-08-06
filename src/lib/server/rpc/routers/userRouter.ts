import { os } from '@orpc/server'
import { getUser } from '$lib/server/db'
import { z } from 'zod'

export const userRouter = {
  get: os.input(z.object({ id: z.int().gte(0) })).handler(async ({ input }) => {
    console.log('[SERVER] user.get', input.id)
    const user = await getUser(input.id)
    return user
  }),
}
