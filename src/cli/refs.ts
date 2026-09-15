/**
 * The pinned refs a scaffold is born with. Bumped deliberately as part of a release. The
 * template itself is not pinned: `netix init` scaffolds from NETIX-AI/frontend-template's newest
 * `vX.Y.Z` tag, resolved at run time (see `resolveTemplate` in template.ts).
 */

/** Git ref of netix-frontend that scaffolded apps depend on. */
export const LIB_REF = 'v2.0.3'

/** Git ref serving the @netix shadcn registry (raw.githubusercontent). */
export const REGISTRY_REF = 'v2.0.1'

/** shadcn CLI version `netix add` delegates to — the version frontend-template pins. */
export const SHADCN_VERSION = '4.21.0'

// The 4T5Labs org was renamed; GitHub redirects the old name, but pins stay canonical.
export const TEMPLATE_REPO = 'NETIX-AI/frontend-template'
export const LIB_REPO = 'NETIX-AI-OSS/netix-frontend'

export const REGISTRY_URL = `https://raw.githubusercontent.com/${LIB_REPO}/${REGISTRY_REF}/r/{name}.json`
