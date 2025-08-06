<script lang="ts">
  let userInput = $state<number>()
</script>

<nav class="flex flex-col gap-4 w-64 bg-gray-800 rounded-lg p-4 justify-evenly">
  <div class="flex flex-col gap-2">
    <p>Navigate to (SSR):</p>
    <a href="/">Home</a>
    <a href="/userSSR/1">User 1</a>
    <a href="/userSSR/2">User 2</a>
    <a href="/userSSR/10">User 10</a>
    <a href="/userSSR/100">User 100</a>
    <a href="/userSSR/-1">User Invalid</a>
  </div>
  <div class="flex flex-col gap-2">
    <p>Navigate to (Loading):</p>
    <a href="/userLoading/1">User 1</a>
    <a href="/userLoading/2">User 2</a>
    <a href="/userLoading/10">User 10</a>
    <a href="/userLoading/100">User 100</a>
    <a href="/userLoading/-1">User Invalid</a>
  </div>
  <div>
    <div class="grid grid-cols-2 gap-2 text-center">
      {#if !isNaN(userInput ?? NaN)}
        <a href="/userSSR/{userInput}">Goto (SSR)</a>
        <a href="/userLoading/{userInput}">Goto (Loading)</a>
      {/if}
    </div>
    <label>
      <p class="mb-2">Custom navigate:</p>
      <input class="w-full mb-2" placeholder="User ID" type="number" bind:value={userInput} />
    </label>
  </div>
</nav>

<style lang="postcss">
  @reference "tailwindcss";
  a {
    @apply text-blue-500 bg-blue-100 rounded-md p-2;
  }
</style>
