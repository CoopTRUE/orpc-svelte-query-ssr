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
