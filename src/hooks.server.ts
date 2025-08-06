export async function handle({ event, resolve }) {
  const response = await resolve(event, {
    filterSerializedResponseHeaders: (name) => name === 'content-type',
  })

  return response
}
