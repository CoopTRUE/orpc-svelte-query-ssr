<script lang="ts">
  import { page } from '$app/state'
</script>

<div class="text-lg">
  <p>
    <strong class="text-green-500">ALL REQUESTS</strong>
    are prefetched on
    <u>hover</u>
    .
  </p>
  <p>
    <strong>(SSR)</strong>
    waits for the data to be fetched before rendering
  </p>
  <p>
    <strong>(Loading)</strong>
    shows a loading state (Data is not SSRed)
  </p>
  <p class="text-3xl bg-green-100 text-green-500 p-2">
    <strong>ALL</strong>
    data is queried
    <strong>ONLY ONCE</strong>
    per page regardless of SSR or Loading
    <br />
    and reused in hydration
  </p>
  <br />
  <code>
    Try this in your terminal:
    <br />
    curl {page.url}userSSR/1
  </code>
</div>
