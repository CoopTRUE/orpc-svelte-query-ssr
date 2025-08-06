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
