/**
 * The `react-native` entry: everything `./api` exports, plus the dev-token manager.
 *
 * `createDevLoginPrompt` mounts a DOM form (`globalThis.document`), so it is a silent no-op
 * under React Native. v2.0.0 removed `createDevTokenManager` because the browser prompt
 * supersedes it — true on the web, where a form can be mounted and credentials stay out of
 * `.env`. React Native has no such form, so the token manager is still the only local-dev
 * path there, and it is exported on this condition only.
 */
export { createDevTokenManager, type DevTokenConfig, type DevTokenManager } from './dev-token'
export * from './index'
