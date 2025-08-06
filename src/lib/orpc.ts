import type { router } from './server/rpc/router'
import { createORPCClient } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'
import { SimpleCsrfProtectionLinkPlugin } from '@orpc/client/plugins'
import type { RouterClient } from '@orpc/server'
import { createTanstackQueryUtils } from '@orpc/tanstack-query'
import { browser } from '$app/environment'

interface ClientContext {
  fetch?: typeof fetch
}

function getBaseURL() {
  return browser ? window.location.origin : globalThis.serverURL
}

const link = new RPCLink<ClientContext>({
  url: () => `${getBaseURL()}/rpc`,
  // GET method tells sveltekit to cache the initial response for client hydration
  method: 'GET',
  fetch: (request, init, { context: { fetch: fetcher } }) => {
    // fetcher will be the fetch (if provided) passed from +page.ts or +layout.svelte
    return (fetcher ?? fetch)(request, init)
  },
  plugins: [
    // We disabled the StrictGetMethodPlugin as all methods are GET
    // But we still need to protect against CSRF attacks
    new SimpleCsrfProtectionLinkPlugin(),
  ],
})

const client: RouterClient<typeof router, ClientContext> = createORPCClient(link)
export const orpc = createTanstackQueryUtils(client)
