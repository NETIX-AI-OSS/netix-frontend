/**
 * The pinned refs a scaffold is born with. Bumped deliberately as part of a release:
 * tag the template first, then update these, then tag the library.
 */

/** Git ref of netix-frontend that scaffolded apps depend on. */
export const LIB_REF = 'v2.0.1'

/** Git ref of NETIX-AI/frontend-template that `netix init` scaffolds from (versioned independently of this package). */
export const TEMPLATE_REF = 'v1.0.0'

/** Git ref serving the @netix shadcn registry (raw.githubusercontent). */
export const REGISTRY_REF = 'v2.0.1'

/** shadcn CLI version `netix add` delegates to — same one the registry is built with. */
export const SHADCN_VERSION = '4.19.1'

// The 4T5Labs org was renamed; GitHub redirects the old name, but pins stay canonical.
export const TEMPLATE_REPO = 'NETIX-AI/frontend-template'
export const LIB_REPO = 'NETIX-AI-OSS/netix-frontend'

export const REGISTRY_URL = `https://raw.githubusercontent.com/${LIB_REPO}/${REGISTRY_REF}/r/{name}.json`
