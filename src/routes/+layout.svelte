<script lang="ts">
  import { QueryClientProvider } from '@tanstack/svelte-query'
  import { SvelteQueryDevtools } from '@tanstack/svelte-query-devtools'
  import { navigating } from '$app/state'
  import favicon from '$lib/assets/favicon.svg'
  import Nav from '$lib/components/Nav.svelte'

  let { children, data } = $props()
</script>

<svelte:head>
  <link href={favicon} rel="icon" />
</svelte:head>

<QueryClientProvider client={data.queryClient}>
  <Nav />
  {@render children?.()}
  {#if navigating.to}
    <p>Navigating.. (Page is stalled)</p>
  {/if}
  <SvelteQueryDevtools />
</QueryClientProvider>
