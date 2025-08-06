<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query'
  import { orpc } from '$lib/orpc'

  let { userId }: { userId: number } = $props()

  const userQuery = $derived(createQuery(orpc.user.get.queryOptions({ input: { id: userId } })))
</script>

{#if $userQuery.isSuccess}
  {@const { id, name, email, createdAt } = $userQuery.data}
  <div>
    <h2>User {id}</h2>
    <p>Name: {name}</p>
    <p>Email: {email}</p>
    <p>Created At: {createdAt}</p>
  </div>
{:else}
  <p>Loading...</p>
{/if}
