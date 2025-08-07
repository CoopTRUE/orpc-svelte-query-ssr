import { StandardRPCJsonSerializer } from '@orpc/client/standard'
import { dehydrate, hydrate, QueryClient } from '@tanstack/svelte-query'
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
    console.log('HYDRATING')
    hydrate(queryClient, window.dehydrated)
  }

  return { queryClient }
}
