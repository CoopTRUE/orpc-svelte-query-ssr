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
