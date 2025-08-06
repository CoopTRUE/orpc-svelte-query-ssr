<script lang="ts">
  import UserCard from '$lib/components/UserCard.svelte'

  let { data } = $props()
</script>

<UserCard userId={data.userId} />
