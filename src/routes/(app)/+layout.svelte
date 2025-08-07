<script lang="ts">
  import '../../app.css'
  import { dehydrate, QueryClientProvider } from '@tanstack/svelte-query'
  import { SvelteQueryDevtools } from '@tanstack/svelte-query-devtools'
  import { browser } from '$app/environment'
  import { navigating } from '$app/state'
  import favicon from '$lib/assets/favicon.svg'
  import Nav from '$lib/components/Nav.svelte'
  import { createDehydratedScript } from '$lib/utils'

  let { children, data } = $props()
</script>

<svelte:head>
  <link href={favicon} rel="icon" />
  {#if !browser}
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html createDehydratedScript(dehydrate(data.queryClient))}
  {/if}
</svelte:head>

<QueryClientProvider client={data.queryClient}>
  <div class="flex gap-4 h-dvh">
    <Nav />
    <main class="flex-1 flex justify-center items-center flex-col">
      {#if navigating.to}
        <p>
          Navigating (Page is stalled)...
          <span class="animate-spin inline-block">⏳</span>
        </p>
      {/if}
      {@render children?.()}
    </main>
  </div>
  <SvelteQueryDevtools />
</QueryClientProvider>
