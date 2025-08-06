# oRPC + SvelteQuery (Tanstack Query) + SSR + Prefetching

Template project for a SvelteKit project built with `oRPC` and `SvelteQuery` (Tanstack Query) with _NO double requests_.

> All backend requests are made **ONCE** (even when SSR-ed), and reused during client hydration.

## Developing

Once you've installed [bun](https://bun.sh), run:

```sh
# Install dependencies
bun install

# Run the development server
bun run dev
```

## Implementation

> [!IMPORTANT]
> This README assumes that you already have [Tanstack Query](https://tanstack.com/query/v5/docs/framework/svelte/ssr) and [oRPC](https://orpc.unnoq.com/docs/integrations/tanstack-query-old/svelte) setup in your project.
>
> If you are still confused with the implementation, **READ THIS PROJECT'S SOURCE CODE**.

To achieve hydration cache:

1. Modify the local oRPC client to make all requests _GET_ requests, and use `SimpleCsrfProtectionLinkPlugin` instead of the default `StrictGetMethodPlugin`.
2. Specify we want to use the `fetch` function from `+page.ts/+layout.ts` in the oRPC client
3. We tell sveltekit to cache the the `content-type` response header by adding it to the `filterSerializedResponseHeaders` function.

```diff
// $lib/orpc.ts

import type { router } from './server/rpc/router'
import { createORPCClient } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'
+ import { SimpleCsrfProtectionLinkPlugin } from '@orpc/client/plugins'
import type { RouterClient } from '@orpc/server'
import { createORPCSvelteQueryUtils } from '@orpc/svelte-query'
import { browser, dev } from '$app/environment'

+  interface ClientContext {
+    fetch?: typeof fetch
+  }

const baseURL = browser ? location.origin : `http://localhost:${dev ? 5173 : 3000}`

const link = new RPCLink<ClientContext>({
    url: `${baseURL}/rpc`,
+   method: 'GET',
+   fetch: (request, init, { context: { fetch: fetcher } }) => {
+     return (fetcher ?? fetch)(request, init)
+   },
+   plugins: [
+     new SimpleCsrfProtectionLinkPlugin(),
+   ],
})

- const client: RouterClient<typeof router> = createORPCClient(link)
+  const client: RouterClient<typeof router, ClientContext> = createORPCClient(link)
export const orpc = createORPCSvelteQueryUtils(client)
```

```diff
// src/routes/rpc/[...rest]/+server.ts

+ import { SimpleCsrfProtectionHandlerPlugin } from '@orpc/server/plugins'

const handler = new RPCHandler(router, {
+  strictGetMethodPluginEnabled: false,
+  plugins: [new SimpleCsrfProtectionHandlerPlugin()],
})
```

```ts
// src/hooks.server.ts

export async function handle({ event, resolve }) {
  const response = await resolve(event, {
    filterSerializedResponseHeaders: (name) => name === 'content-type',
  })

  return response
}
```

Finally, we can either **fully SSR** the data (in `+page.ts` or `+layout.ts`)

```ts
// src/routes/userSSR/[userId]/+page.ts

import { error } from '@sveltejs/kit'
import { orpc } from '$lib/orpc'
import { z } from 'zod'

export async function load({ parent, params: { userId }, fetch }) {
  const parsed = z.coerce.number().int().gte(0).safeParse(userId)
  if (!parsed.success) {
    error(400, 'Invalid user ID')
  }
  const id = parsed.data

  const { queryClient } = await parent()
  await queryClient.ensureQueryData(
    // Must pass fetch if orpc is used in ensureQueryData
    orpc.user.get.queryOptions({ input: { id }, context: { fetch } })
  )

  // Always return just the id, svelte-query will handle the rest
  return { userId: id }
}
```

or **just prefetch** the data (in `+page.ts` or `+layout.ts`)

```ts
// src/routes/userLoading/[userId]/+page.ts

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
  // MUST ADD browser check to avoid prefetching on server
  // (Pointless to prefetch on server)
  if (browser) {
    queryClient.prefetchQuery(
      // No need to pass fetch as we can use the window's fetch
      orpc.user.get.queryOptions({ input: { id } })
    )
  }

  // Always return just the id, svelte-query will handle the rest
  return { userId: id }
}
```

> [!WARNING]
> Make sure your queryClient has sensible default options, otherwise you might end up with double requests.

```ts
// src/routes/+layout.ts

import { QueryClient } from '@tanstack/svelte-query'

export async function load() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Infinity,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
        experimental_prefetchInRender: true,
        // Do not include { enabled: browser }
      },
    },
  })

  return { queryClient }
}
```

## Querying on the client

You'd be happy to know that you can query on the client with the same `orpc` syntax as before.

> [!NOTE]
> If you SSR the data, you can assume the data is already fetched and available in the query client. I usually do a non-null assertion `const user = $derived($userQuery.data!)`.

```ts
// src/lib/components/UserCard.svelte

<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query'
  import { orpc } from '$lib/orpc'

  let { userId }: { userId: number } = $props()

  const userQuery = $derived(createQuery(orpc.user.get.queryOptions({ input: { id: userId } })))
</script>

<div>
  {#if $userQuery.isSuccess}
    {@const { id, name, email, createdAt } = $userQuery.data}
    <h2>Id: {id}</h2>
    <p>Name: {name}</p>
    <p>Email: {email}</p>
    <p>Created At: {createdAt}</p>
  {:else}
    <div class="space-y-3">
      <div class="h-6 bg-gray-300 animate-pulse rounded-md w-24"></div>
      <div class="h-4 bg-gray-300 animate-pulse rounded-md w-48"></div>
      <div class="h-4 bg-gray-300 animate-pulse rounded-md w-56"></div>
      <div class="h-4 bg-gray-300 animate-pulse rounded-md w-40"></div>
    </div>
  {/if}
</div>
```

TS does **NOT** PMO
