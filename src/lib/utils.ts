import type { DehydratedState } from '@tanstack/svelte-query'

const replacements = {
  '<': '\\u003C',
  '\u2028': '\\u2028',
  '\u2029': '\\u2029',
}
const pattern = new RegExp(`[${Object.keys(replacements).join('')}]`, 'g')

export function createDehydratedScript(dehydratedState: DehydratedState) {
  const escaped = JSON.stringify(dehydratedState).replace(
    pattern,
    (match) => replacements[match as keyof typeof replacements]
  )
  return `<script>window.dehydrated = ${escaped}</script>`
}
