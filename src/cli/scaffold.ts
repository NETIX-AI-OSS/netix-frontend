import { existsSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import {
  buildEnvExample,
  buildLocalDevUrls,
  buildServiceClient,
  DEMO_PAGES,
  deployRenames,
  rewriteComponentsJson,
  rewriteDeployFile,
  rewriteDocs,
  rewriteEnv,
  rewriteIndexHtml,
  rewriteOrganizationLocale,
  rewriteOrvalConfig,
  rewritePackageJson,
  rewriteViteEnv,
  type ScaffoldOptions,
  serviceNames,
  stripLazyBarrel,
  stripRouteImports,
  stripRoutes,
} from './transforms'

const DEPLOY_FILES = [
  'docker-compose.yaml',
  'app-ui-deployment.yaml',
  'app-ui-ingress.yaml',
  '.github/workflows/docker-image-push.yaml',
]

const DOC_FILES = ['README.md', 'CLAUDE.md', 'AGENTS.md']

/**
 * Applies every scaffold transform to a template copy at `root`, in place.
 * Pure over the filesystem: no prompts, no network, no child processes.
 * Returns human-readable notes about what happened.
 */
export function applyScaffoldTransforms(
  root: string,
  options: ScaffoldOptions & { stripDemo?: boolean },
): string[] {
  const notes: string[] = []
  const edit = (path: string, transform: (content: string) => string) => {
    const file = join(root, path)
    if (!existsSync(file)) {
      notes.push(`skipped ${path} (not in template)`)
      return false
    }
    writeFileSync(file, transform(readFileSync(file, 'utf8')))
    return true
  }

  edit('package.json', (c) => rewritePackageJson(c, options))
  edit('index.html', (c) => rewriteIndexHtml(c, options))
  edit('app/lib/organization-locale.ts', (c) => rewriteOrganizationLocale(c, options))

  for (const path of DEPLOY_FILES) edit(path, (c) => rewriteDeployFile(c, options))
  for (const [from, to] of Object.entries(deployRenames(options)))
    if (existsSync(join(root, from))) renameSync(join(root, from), join(root, to))

  if (edit('.env', (c) => rewriteEnv(c, options))) {
    writeFileSync(
      join(root, '.env.example'),
      buildEnvExample(readFileSync(join(root, '.env'), 'utf8')),
    )
    notes.push('wrote .env.example')
  }

  edit('orval.config.ts', (c) => rewriteOrvalConfig(c, options))
  edit('app/vite-env.d.ts', (c) => rewriteViteEnv(c, options))

  const dataClient = join(root, 'app/client/http-data-service-client.ts')
  const dataClientTest = join(root, 'app/client/http-data-service-client.test.ts')
  if (existsSync(dataClient)) {
    const clientSource = readFileSync(dataClient, 'utf8')
    const testSource = existsSync(dataClientTest) ? readFileSync(dataClientTest, 'utf8') : undefined
    for (const key of options.services.filter((k) => k !== 'data')) {
      const { slug } = serviceNames(key)
      writeFileSync(
        join(root, `app/client/http-${slug}-client.ts`),
        buildServiceClient(clientSource, key),
      )
      notes.push(`wired ${slug} client`)
    }
    if (!options.services.includes('data')) {
      const [first] = options.services
      if (first && testSource) {
        const { slug } = serviceNames(first)
        writeFileSync(
          join(root, `app/client/http-${slug}-client.test.ts`),
          buildServiceClient(testSource, first),
        )
      }
      rmSync(dataClient)
      if (testSource) rmSync(dataClientTest)
      rmSync(join(root, 'schema/data-service.yaml'), { force: true })
      notes.push('removed the data-service client (not selected)')
    }
    writeFileSync(join(root, 'app/client/local-dev-urls.ts'), buildLocalDevUrls(options))
  }

  edit('components.json', (c) => rewriteComponentsJson(c, options))
  for (const path of DOC_FILES) edit(path, (c) => rewriteDocs(c, options))

  if (options.stripDemo) {
    for (const page of DEMO_PAGES) {
      rmSync(join(root, `app/pages/${page}.tsx`), { force: true })
      rmSync(join(root, `app/pages/${page}`), { recursive: true, force: true })
    }
    edit('app/pages/lazy.ts', stripLazyBarrel)
    edit('app/main.tsx', (c) => stripRouteImports(stripRoutes(c)))
    notes.push(`stripped demo pages: ${DEMO_PAGES.join(', ')}`)
  }

  return notes
}
