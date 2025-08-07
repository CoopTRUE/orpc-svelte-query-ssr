import { error } from '@sveltejs/kit'
import { browser } from '$app/environment'
import { orpc } from '$lib/orpc'
import { z } from 'zod'

export async function load({ parent, params: { userId } }) {
  const parsed = z.coerce.number().int().gte(0).safeParse(userId)
  if (!parsed.success) {
    error(400, 'Invalid user ID')
  }
  const id = parsed.data

  const { queryClient } = await parent()
  // MUST ADD browser check to avoid prefetching on server (Pointless to prefetch on server)
  if (browser) {
    queryClient.prefetchQuery(orpc.user.get.queryOptions({ input: { id } }))
  }

  // Always return just the id, svelte-query will handle the rest
  return { userId: id }
}
