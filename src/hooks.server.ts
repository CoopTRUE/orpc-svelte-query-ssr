// https://svelte.dev/docs/kit/load#Making-fetch-requests
// Fetch requests responses are cached by sveltekit, but not the response headers
// We must allow content-type header to be cached so orpc can work

export async function handle({ event, resolve }) {
  globalThis.serverURL = event.url.origin

  const response = await resolve(event, {
    filterSerializedResponseHeaders: (name) => name === 'content-type',
  })

  return response
}
