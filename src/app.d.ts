// See https://svelte.dev/docs/kit/types#app.d.ts

import type { RouterClient } from '@orpc/server'
import type { DehydratedState } from '@tanstack/svelte-query'
import type { router } from '$lib/server/rpc/router'

// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
  var $client: RouterClient<typeof router> | undefined
  interface Window {
    dehydrated: DehydratedState
  }
}

export {}
