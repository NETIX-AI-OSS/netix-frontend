'use strict'

// eslint-disable-next-line @typescript-eslint/no-require-imports -- CJS bridge for shadcn’s default import.
const createMerge = require('@fastify/deepmerge')
const merge = createMerge({ symbols: true })
const mergeAll = createMerge({ symbols: true, all: true })

function configuredMerge(options, all = false) {
  if (options === undefined) return all ? mergeAll : merge
  if (
    options === null ||
    typeof options !== 'object' ||
    Object.keys(options).some((key) => key !== 'arrayMerge') ||
    (options.arrayMerge !== undefined && typeof options.arrayMerge !== 'function')
  ) {
    throw new TypeError('@netix/shadcn-merge supports only the audited arrayMerge option')
  }
  return createMerge({
    symbols: true,
    all,
    // Shadcn supplies a two-argument callback that replaces arrays. Fastify
    // still owns all recursive merging, cloning and prototype-key filtering.
    ...(options.arrayMerge && { mergeArray: () => options.arrayMerge }),
  })
}

function mergeConfiguration(target, source, options) {
  return configuredMerge(options)(target, source)
}

mergeConfiguration.all = function mergeConfigurations(values, options) {
  if (!Array.isArray(values)) throw new TypeError('Expected an array of configurations')
  // Legacy .all starts with an empty object, including for an empty input.
  return configuredMerge(options, true)({}, ...values)
}

module.exports = mergeConfiguration
