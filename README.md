# oRPC + SvelteQuery (Tanstack Query) + SSR + Hydration

Template project for a SvelteKit project built with `oRPC` and `SvelteQuery` (Tanstack Query) with **_NO double requests_**.

> All backend requests are made **ONCE** (even when SSR-ed), and reused during client hydration using proper dehydration/hydration.

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
> This README assumes that you already have [Tanstack Query](https://tanstack.com/query/v5/docs/framework/svelte/ssr) and [oRPC](https://orpc.unnoq.com/docs/adapters/svelte-kit) setup in your project.
>
> If you are still confused with the implementation, **READ THIS PROJECT'S SOURCE CODE**.

To achieve proper SSR with hydration and no double requests:

### 1. 📝 Setup Global Types

Update your `app.d.ts` to include the global client and dehydrated state:

```ts
// src/app.d.ts
import type { RouterClient } from '@orpc/server'
import type { DehydratedState } from '@tanstack/svelte-query'
import type { router } from '$lib/server/rpc/router'

declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
  var $client: RouterClient<typeof router> | undefined
  interface Window {
    dehydrated: DehydratedState
  }
}

export {}
```

### 2. 🖥️ Create Server-Side Client

Create a server-side oRPC client that can be used during SSR (No network overhead):

```ts
// src/lib/server/orpc.server.ts
import { router } from './rpc/router'
import { createRouterClient } from '@orpc/server'

globalThis.$client = createRouterClient(router)
```

### 3. 🔌 Import Server Client in Hooks

```ts
// src/hooks.server.ts
import '$lib/server/orpc.server'
```

### 4. 🔄 Setup Client with Alias

Update your local client to use the global server client when available:

```diff
// src/lib/orpc.ts

- const client: RouterClient<typeof router> = createORPCClient(link)
+ const client: RouterClient<typeof router> = globalThis.$client ?? createORPCClient(link)
export const orpc = createTanstackQueryUtils(client)
```

### 5. 🧊 Create Dehydration Utility

Create a utility to safely serialize dehydrated state:

```ts
// src/lib/utils.ts
import type { DehydratedState } from '@tanstack/svelte-query'

const replacements = {
  '<': '\\u003C',
  '\u2028': '\\u2028',
  '\u2029': '\\u2029',
}
const pattern = new RegExp(`[${Object.keys(replacements).join('')}]`, 'g')

export function createDehydratedScript(dehydratedState: DehydratedState) {
  const escaped = JSON.stringify(dehydratedState).replace(
    pattern,
    (match) => replacements[match as keyof typeof replacements]
  )
  return `<script>window.dehydrated = ${escaped}</script>`
}
```

### 6. ⚙️ Setup Layout with Query Client and Hydration

Create your layout with proper dehydration/hydration setup:

```ts
// src/routes/(app)/+layout.ts
import { StandardRPCJsonSerializer } from '@orpc/client/standard'
import { hydrate, QueryClient } from '@tanstack/svelte-query'
import { browser } from '$app/environment'

const serializer = new StandardRPCJsonSerializer()

export async function load() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Infinity,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
        enabled: browser,
      },
      dehydrate: {
        serializeData(data) {
          const [json, meta] = serializer.serialize(data)
          return { json, meta }
        },
      },
      hydrate: {
        deserializeData(data) {
          return serializer.deserialize(data.json, data.meta)
        },
      },
    },
  })

  if (browser) {
    hydrate(queryClient, window.dehydrated)
  }

  return { queryClient }
}
```

### 7. 🎨 Update Layout Component for Dehydration

```tsx
<!-- src/routes/(app)/+layout.svelte -->
<script lang="ts">
  import { dehydrate, QueryClientProvider } from '@tanstack/svelte-query'
  import { browser } from '$app/environment'
  import { createDehydratedScript } from '$lib/utils'

  let { children, data } = $props()
</script>

<svelte:head>
  {#if !browser}
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html createDehydratedScript(dehydrate(data.queryClient))}
  {/if}
</svelte:head>

<QueryClientProvider client={data.queryClient}>
  {@render children?.()}
</QueryClientProvider>
```

## 🚀 Usage Examples

### 🏃‍♂️ SSR with Hydration

For pages that need data immediately available (no loading states):

```ts
// src/routes/(app)/userSSR/[userId]/+page.ts
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
  await queryClient.ensureQueryData(orpc.user.get.queryOptions({ input: { id } }))

  return { userId: id }
}
```

### ⏳ Client-Side Loading with Prefetching

For pages that can show loading states but benefit from prefetching:

```ts
// src/routes/(app)/userLoading/[userId]/+page.ts
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
  // Only prefetch on client-side navigation
  if (browser) {
    queryClient.prefetchQuery(orpc.user.get.queryOptions({ input: { id } }))
  }

  return { userId: id }
}
```

## 🔍 Querying on the Client

You can query on the client with the same `orpc` syntax as before, (There will be no loading states if you SSRed):

```svelte
<!-- src/lib/components/UserCard.svelte -->
<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query'
  import { browser } from '$app/environment'
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

### 🚄 Advanced Features

The new implementation also fully supports any and all oRPC plugins like [batching](https://orpc.unnoq.com/docs/plugins/batch-requests)

```tsx
<!-- Example: Prefetching multiple users -->
<script lang="ts">
  import { createMutation, useQueryClient } from '@tanstack/svelte-query'
  import { orpc } from '$lib/orpc'

  const queryClient = useQueryClient()

  const prefetchUsers = createMutation({
    mutationFn: async () => {
      await Promise.all(
        Array.from({ length: 10 }, async (_, i) => {
          const options = orpc.user.get.queryOptions({ input: { id: i + 1 } })
          await queryClient.prefetchQuery(options)
        })
      )
    },
  })
</script>

<button onclick={() => $prefetchUsers.mutate()}>
  Preload users 1-10
  {#if $prefetchUsers.isPending}
    <span class="animate-spin inline-block">⏳</span>
  {/if}
</button>
```
