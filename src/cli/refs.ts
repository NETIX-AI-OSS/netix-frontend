/**
 * The pinned refs a scaffold is born with. Bumped deliberately as part of a release:
 * tag the template first, then update these, then tag the library.
 */

/** Git ref of netix-frontend that scaffolded apps depend on. */
export const LIB_REF = 'v2.0.0'

/** Git ref of 4T5Labs/frontend-template that `netix init` scaffolds from. */
export const TEMPLATE_REF = 'template-v2.0.0'

/** Git ref serving the @netix shadcn registry (raw.githubusercontent). */
export const REGISTRY_REF = 'v2.0.0'

/** shadcn CLI version `netix add` delegates to — same one the registry is built with. */
export const SHADCN_VERSION = '4.19.1'

export const TEMPLATE_REPO = '4T5Labs/frontend-template'
export const LIB_REPO = 'NETIX-AI-OSS/netix-frontend'

export const REGISTRY_URL = `https://raw.githubusercontent.com/${LIB_REPO}/${REGISTRY_REF}/r/{name}.json`
