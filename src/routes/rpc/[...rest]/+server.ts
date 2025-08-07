import { RPCHandler } from '@orpc/server/fetch'
import { BatchHandlerPlugin } from '@orpc/server/plugins'
import type { RequestHandler } from '@sveltejs/kit'
import { router } from '$lib/server/rpc/router'

const handler = new RPCHandler(router, {
  plugins: [new BatchHandlerPlugin()],
})

const handle: RequestHandler = async ({ request }) => {
  const { response } = await handler.handle(request, {
    prefix: '/rpc',
  })

  return response ?? new Response('Not Found', { status: 404 })
}

export const GET = handle
export const POST = handle
export const PUT = handle
export const PATCH = handle
export const DELETE = handle
