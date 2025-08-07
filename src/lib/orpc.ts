import type { router } from './server/rpc/router'
import { createORPCClient } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'
import { BatchLinkPlugin } from '@orpc/client/plugins'
import type { RouterClient } from '@orpc/server'
import { createTanstackQueryUtils } from '@orpc/tanstack-query'

const link = new RPCLink({
  url: () => `${window.location.origin}/rpc`,
  plugins: [
    new BatchLinkPlugin({
      groups: [{ condition: () => true, context: {} }],
    }),
  ],
})

export const client: RouterClient<typeof router> = globalThis.$client ?? createORPCClient(link)
export const orpc = createTanstackQueryUtils(client)
