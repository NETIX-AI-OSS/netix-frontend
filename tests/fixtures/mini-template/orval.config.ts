import { defineConfig } from 'orval'

export default defineConfig({
  'data-service': {
    input: './schema/data-service.yaml',
    output: {
      target: './app/client/gen/data-service/index.ts',
      schemas: './app/client/gen/data-service',
      client: 'swr',
      httpClient: 'axios',
      mode: 'tags-split',
      mock: false,
      prettier: true,
      override: {
        mutator: {
          path: './app/client/http-data-service-client.ts',
          name: 'httpDataServiceClient',
        },
      },
    },
  },
})
