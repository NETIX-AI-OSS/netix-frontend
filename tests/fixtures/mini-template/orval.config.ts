import { defineConfig } from 'orval'

// One entry per backend service, keyed `<svc>-service` and reading
// `schema/<svc>-service.yaml`. `netix init --services` writes these;
// `pnpm generate:client` turns them into `app/client/gen/`.
export default defineConfig({})
