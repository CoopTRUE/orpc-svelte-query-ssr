import { error } from '@sveltejs/kit'
import { orpc } from '$lib/orpc'
import { z } from 'zod'

export async function load({ parent, params: { userId } }) {
  const parsed = z.coerce.number().int().gte(0).safeParse(userId)
  if (!parsed.success) {
    error(400, 'Invalid user ID')
  }
  const id = parsed.data

  const { queryClient } = await parent()
  await queryClient.ensureQueryData(
    // Must past fetch if orpc is used in ensureQueryData
    orpc.user.get.queryOptions({ input: { id } })
  )

  // Always return just the id, svelte-query will handle the rest
  return { userId: id }
}
