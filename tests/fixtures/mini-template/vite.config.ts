import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { fileURLToPath } from 'node:url'
import { loadEnv, type ProxyOptions } from 'vite'
import { defineConfig } from 'vitest/config'

/**
 * Proxies one same-origin `/<service>-api` prefix to that service's upstream.
 * The browser only ever talks to the dev server's own origin, so no request is
 * cross-origin and no CORS preflight is involved.
 *
 * The upstream is Django behind envoy: its CSRF middleware rejects unsafe
 * methods whose Origin is not in CSRF_TRUSTED_ORIGINS, and a forwarded cookie
 * jar would switch it from bearer to session authentication. Presenting the
 * upstream's own origin and stripping cookies keeps proxied requests
 * indistinguishable from the deployed app's.
 */
function serviceProxy(prefix: string, target: string): ProxyOptions {
  return {
    target,
    changeOrigin: true,
    rewrite: (requestPath) => requestPath.slice(prefix.length),
    configure: (proxy) => {
      proxy.on('proxyReq', (proxyReq) => {
        proxyReq.setHeader('origin', target)
        proxyReq.setHeader('referer', `${target}/`)
        proxyReq.removeHeader('cookie')
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Same input the app reads (app/config/env.ts) — from `.env`, or from a real
  // env var, which wins (the Docker dev image has no `.env` and passes it in).
  const env = loadEnv(mode, import.meta.dirname)
  const baseDomain = env.VITE_BASE_DOMAIN || 'netixai.dev'

  // Where `pnpm dev` sends each service's prefix. Deployed builds never use this
  // map — they call the real domains derived in app/config/env.ts. To run one
  // service from your own machine instead, replace its target below; the app
  // needs no change, since it only ever calls the prefix.
  const devUpstreams: Record<string, string> = {
    '/user-api': `https://user.api.${baseDomain}`,
  }

  return {
    plugins: [react(), tailwindcss()],
    server: {
      // Matches the port the Dockerfile exposes and docker-compose maps.
      port: 5174,
      // netix-frontend's styles.css points @font-face at woff2 files inside the
      // package. When the package is linked to a local checkout (`link:` in
      // package.json), those resolve outside this project and the dev server
      // refuses to serve them, so the fonts silently fall back. Allowing the
      // resolved package directory is a no-op for a normal installed dependency.
      fs: {
        allow: [
          import.meta.dirname,
          path.dirname(fileURLToPath(import.meta.resolve('netix-frontend/styles.css'))),
        ],
      },
      proxy: Object.fromEntries(
        Object.entries(devUpstreams).map(([prefix, target]) => [
          prefix,
          serviceProxy(prefix, target),
        ]),
      ),
    },
    build: {
      target: 'es2022',
      rolldownOptions: {
        output: {
          codeSplitting: {
            minSize: 20_000,
            groups: [
              {
                name: 'react-vendor',
                test: /node_modules[\\/](?:react|react-dom|scheduler)[\\/]/,
                priority: 3,
              },
              {
                name: 'netix-vendor',
                test: /node_modules[\\/]netix-frontend[\\/]/,
                priority: 2,
              },
              {
                name: 'vendor',
                test: /node_modules/,
                priority: 1,
              },
            ],
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './app'),
      },
    },
    test: {
      environment: 'node',
      include: ['app/**/*.test.{ts,tsx}'],
      coverage: {
        provider: 'v8',
        exclude: ['app/client/gen/**', '**/*.test.ts'],
      },
    },
  }
})
