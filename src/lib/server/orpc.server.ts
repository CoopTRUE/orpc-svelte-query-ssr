import { router } from './rpc/router'
import { createRouterClient } from '@orpc/server'

globalThis.$client = createRouterClient(router)
