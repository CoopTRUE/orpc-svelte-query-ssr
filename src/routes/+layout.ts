import { QueryClient } from '@tanstack/svelte-query'
// import { browser } from '$app/environment'

export async function load() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Infinity,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
        // DO NOT include this, as we want to prefetch and fetch on server
        // enabled: browser,
        experimental_prefetchInRender: true,
      },
    },
  })

  return { queryClient }
}
