<script lang="ts">
  let userInput = $state<number>()
</script>

<header>
  <nav>
    <div>
      <p>Navigate to:</p>
      <a href="/">Home</a>
      <a href="/user/1">User 1</a>
      <a href="/user/2">User 2</a>
      <a href="/user/10">User 10</a>
      <a href="/user/100">User 100</a>
      <a href="/user/-1">User Invalid</a>
    </div>
    <div>
      <p>Navigate to (with loading):</p>
      <a href="/userWithLoading/1">User 1</a>
      <a href="/userWithLoading/2">User 2</a>
      <a href="/userWithLoading/10">User 10</a>
      <a href="/userWithLoading/100">User 100</a>
      <a href="/userWithLoading/-1">User Invalid</a>
    </div>
    <div>
      <p>Custom navigate:</p>
      <label>
        <input placeholder="User ID" type="number" bind:value={userInput} />
        {#if userInput !== undefined}
          <a href="/user/{userInput}">Go to user {userInput}</a>
          <a href="/userWithLoading/{userInput}">Go to user {userInput} (Loading)</a>
        {/if}
      </label>
    </div>
  </nav>
</header>

<style lang="postcss">
  nav {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  a {
    background-color: #f0f0f0;
    padding: 0.5rem;
    border-radius: 0.5rem;
    text-decoration: none;
    color: black;
  }
</style>
