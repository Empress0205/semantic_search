/**
 * Chooses the data source.
 *
 * Default is the browser-local implementation, so `npm run dev` works with no
 * backend running. Set VITE_USE_BACKEND=true in `.env.local` once the FastAPI
 * service from Phase 5 is up — nothing else in the app changes.
 */

import { httpApi } from './http.js'
import { localApi } from './local.js'

export const USING_BACKEND = import.meta.env.VITE_USE_BACKEND === 'true'

export const api = USING_BACKEND ? httpApi : localApi
